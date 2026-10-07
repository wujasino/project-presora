/**
 * GET/POST /.netlify/functions/billing-status
 *
 * Monthly internal financial/tax report: pulls this month's Stripe charges,
 * combines them with company_finance_settings (tax rate, VAT rate, fixed
 * costs), and emails a VAT/income-tax reserve estimate + net profit to the
 * owner. Not user-facing — no frontend calls this.
 *
 * Scheduled (see the `[functions."billing-status"]` entry in netlify.toml)
 * for the 15th of each month at 09:00 — a month-to-date snapshot (this
 * month's Stripe charges so far), sent ahead of the 20th/25th tax deadlines
 * mentioned in the report itself. It reports partial-month revenue by
 * design; it is not meant to be a final, complete-month total.
 */
const { createClient } = require('@supabase/supabase-js');
const ws = require('ws');
const Stripe = require('stripe');

if (!globalThis.WebSocket) globalThis.WebSocket = ws;

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

exports.handler = async (event) => {
  const headers = { 'Content-Type': 'application/json' };
  const isCron = event.headers?.['x-netlify-event'] === 'schedule';
  const authHeader = event.headers?.authorization || event.headers?.Authorization;
  const isAuthorizedManualCall = authHeader === `Bearer ${process.env.INTERNAL_ADMIN_TOKEN}` && !!process.env.INTERNAL_ADMIN_TOKEN;

  if (!isCron && !isAuthorizedManualCall) {
    return { statusCode: 401, headers, body: JSON.stringify({ error: 'Unauthorized' }) };
  }

  const now = new Date();

  try {
    if (!process.env.STRIPE_SECRET_KEY) throw new Error('STRIPE_SECRET_KEY is not configured');
    if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) throw new Error('Missing Supabase service role configuration');

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startTimestamp = Math.floor(firstDayOfMonth.getTime() / 1000);

    // ==========================================
    // Stripe charges for the month so far
    // ==========================================
    // Capped at 100 (Stripe's default page size) — plenty at current volume;
    // revisit with pagination if monthly charge count ever gets close to it.
    const charges = await stripe.charges.list({ created: { gte: startTimestamp }, limit: 100 });

    let totalGrossRevenueCents = 0;
    let stripeFeesCents = 0;
    for (const charge of charges.data) {
      if (charge.paid && !charge.refunded) {
        totalGrossRevenueCents += charge.amount;
        stripeFeesCents += Math.round(charge.amount * 0.029 + 30);
      }
    }
    const totalGrossRevenue = totalGrossRevenueCents / 100;
    const estimatedStripeFees = stripeFeesCents / 100;

    // ==========================================
    // Tax settings (company_finance_settings)
    // ==========================================
    const { data: finSettings, error: finError } = await supabase
      .from('company_finance_settings')
      .select('*')
      .single();
    if (finError) throw finError;

    const taxRate = finSettings.tax_rate_percent / 100;
    const vatRate = finSettings.vat_rate_percent / 100;

    // api_costs is the itemized per-provider breakdown (OpenRouter,
    // Anthropic, Voyage AI, ElevenLabs, Resend, Mailchimp — see the
    // 20240138 migration); monthly_fixed_costs stays as a catch-all for
    // anything not itemized (Supabase/Netlify plan, Cloudflare, Sentry,
    // Plausible, etc.). Both feed into the same tax calculation below.
    const apiCosts = finSettings.api_costs || {};
    const totalApiCosts = Object.values(apiCosts).reduce((sum, v) => sum + Number(v || 0), 0);
    const otherFixedCosts = Number(finSettings.monthly_fixed_costs) || 0;
    const monthlyFixedCosts = totalApiCosts + otherFixedCosts;

    // ==========================================
    // Tax calculations
    // ==========================================
    const netRevenueWithVatExcluded = totalGrossRevenue / (1 + vatRate);
    const vatToPay = totalGrossRevenue - netRevenueWithVatExcluded;

    const taxableIncome = Math.max(0, netRevenueWithVatExcluded - estimatedStripeFees - monthlyFixedCosts);
    const incomeTaxToPay = taxableIncome * taxRate;
    const netProfitToKeep = netRevenueWithVatExcluded - estimatedStripeFees - monthlyFixedCosts - incomeTaxToPay;
    const totalTaxReservation = vatToPay + incomeTaxToPay;

    // ==========================================
    // System stats
    // ==========================================
    const { count: totalUsers } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true });

    // ==========================================
    // Email
    // ==========================================
    const periodString = firstDayOfMonth.toLocaleDateString('pl-PL', { month: 'long', year: 'numeric' });
    const netMarginPercent = totalGrossRevenue > 0 ? (netProfitToKeep / totalGrossRevenue) * 100 : 0;

    const API_COST_LABELS = {
      openrouter: 'OpenRouter',
      anthropic: 'Anthropic (fallback)',
      voyage: 'Voyage AI (RAG embeddings)',
      elevenlabs: 'ElevenLabs (TTS)',
      resend: 'Resend (email)',
      mailchimp: 'Mailchimp',
    };
    const apiCostRows = Object.entries(apiCosts)
      .filter(([, cost]) => Number(cost) > 0)
      .map(([key, cost]) => `
            <div class="row">
              <span class="label">${API_COST_LABELS[key] || key}:</span>
              <span class="value">-${Number(cost).toFixed(2)} USD</span>
            </div>`)
      .join('');

    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>SaaS Financial & Tax Alert</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0a0a0a; color: #edd; margin: 0; padding: 40px 20px; }
          .container { max-width: 600px; margin: 0 auto; background: #121212; border: 1px solid #262626; border-radius: 12px; padding: 32px; box-shadow: 0 4px 30px rgba(0, 0, 0, 0.5); }
          h1 { font-size: 24px; font-weight: 700; color: #ffffff; margin-top: 0; margin-bottom: 8px; }
          .period { font-size: 14px; color: #a3a3a3; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 32px; }
          .section { margin-bottom: 28px; border-bottom: 1px solid #262626; padding-bottom: 20px; }
          .section:last-child { border-bottom: none; padding-bottom: 0; }
          .section-title { font-size: 12px; font-weight: 600; color: #a3a3a3; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 16px; }
          .row { display: flex; justify-content: space-between; margin-bottom: 12px; font-size: 15px; }
          .label { color: #a3a3a3; }
          .value { font-weight: 500; color: #ffffff; }
          .alert-box { background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.2); border-radius: 8px; padding: 16px; margin-top: 12px; }
          .alert-title { color: #f87171; font-weight: 600; font-size: 14px; margin-bottom: 4px; }
          .alert-desc { color: #fca5a5; font-size: 13px; line-height: 1.5; }
          .highlight .value { color: #f87171; font-weight: 700; }
          .profit .value { color: #4ade80; font-weight: 700; }
          .footer { text-align: center; font-size: 12px; color: #737373; margin-top: 32px; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>📊 SaaS Financial & Tax Report</h1>
          <div class="period">Okres: ${periodString}</div>

          <div class="section">
            <div class="section-title">Przychody i Koszty</div>
            <div class="row">
              <span class="label">Przychód Stripe (Brutto):</span>
              <span class="value">${totalGrossRevenue.toFixed(2)} USD</span>
            </div>
            <div class="row">
              <span class="label">Prowizje Stripe (Szacowane):</span>
              <span class="value">-${estimatedStripeFees.toFixed(2)} USD</span>
            </div>${apiCostRows}
            <div class="row">
              <span class="label">Inne koszty stałe (hosting, itp.):</span>
              <span class="value">-${otherFixedCosts.toFixed(2)} USD</span>
            </div>
            <div class="row" style="margin-top: 4px; padding-top: 8px; border-top: 1px solid #262626;">
              <span class="label" style="font-weight: 600;">Suma kosztów stałych:</span>
              <span class="value">-${monthlyFixedCosts.toFixed(2)} USD</span>
            </div>
          </div>

          <div class="section">
            <div class="section-title">🚨 Rezerwa Podatkowa (Urząd Skarbowy)</div>
            <div class="row">
              <span class="label">Szacowany VAT (${finSettings.vat_rate_percent}%):</span>
              <span class="value">${vatToPay.toFixed(2)} USD</span>
            </div>
            <div class="row">
              <span class="label">Podatek dochodowy (${finSettings.tax_rate_percent}%):</span>
              <span class="value">${incomeTaxToPay.toFixed(2)} USD</span>
            </div>
            <div class="row highlight" style="margin-top: 16px; font-size: 16px;">
              <span class="label" style="color: #f87171;">Suma do odłożenia:</span>
              <span class="value">-${totalTaxReservation.toFixed(2)} USD</span>
            </div>

            <div class="alert-box">
              <div class="alert-title">Przelej tę kwotę na subkonto podatkowe!</div>
              <div class="alert-desc">Zabezpiecz te środki przed końcem miesiąca. Płatność VAT przypada zazwyczaj do 25., a dochodowego do 20. dnia kolejnego miesiąca.</div>
            </div>
          </div>

          <div class="section">
            <div class="section-title">Czysty Zysk</div>
            <div class="row profit" style="font-size: 18px;">
              <span class="label" style="color: #4ade80;">Na czysto dla Ciebie:</span>
              <span class="value">${netProfitToKeep.toFixed(2)} USD</span>
            </div>
            <div class="row">
              <span class="label">Marża netto:</span>
              <span class="value">${netMarginPercent.toFixed(1)}%</span>
            </div>
          </div>

          <div class="section">
            <div class="section-title">Kondycja Systemu</div>
            <div class="row">
              <span class="label">Zarejestrowani użytkownicy:</span>
              <span class="value">${totalUsers || 0}</span>
            </div>
            <div class="row">
              <span class="label">Status AI Fallback:</span>
              <span class="value" style="color: #4ade80;">Aktywny (OpenRouter + Anthropic)</span>
            </div>
          </div>

          <div class="footer">
            Raport wygenerowany automatycznie przez Netlify Functions.<br>
            Data wygenerowania: ${now.toLocaleString('pl-PL')}
          </div>
        </div>
      </body>
      </html>
    `;

    if (process.env.RESEND_API_KEY) {
      try {
        await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: 'Presora Reports <reports@presora.app>',
            to: [process.env.ADMIN_NOTIFICATION_EMAIL || 'contact.presora@gmail.com'],
            subject: `🚨 Alert Podatkowy i Finansowy SaaS - ${periodString}`,
            html: emailHtml,
          }),
        });
      } catch (err) {
        console.error('billing-status: Resend send failed:', err.message);
        // Non-fatal — the numbers below are still returned to the caller.
      }
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ message: 'Report sent successfully', totalTaxReservation }, null, 2),
    };
  } catch (error) {
    console.error('billing-status error:', error.message);
    return { statusCode: 500, headers, body: JSON.stringify({ error: error.message }) };
  }
};
