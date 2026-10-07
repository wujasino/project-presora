import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Copy, Check, Terminal, Webhook, Key, Zap, ArrowRight, BookOpen } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { cn } from '@/lib/utils';

const SECTIONS = [
  { id: 'overview',      label: 'Wprowadzenie' },
  { id: 'auth',          label: 'Autoryzacja'  },
  { id: 'analyze',       label: 'POST /analyze' },
  { id: 'get-analysis',  label: 'GET /analyses/{id}' },
  { id: 'list',          label: 'GET /analyses' },
  { id: 'webhooks',      label: 'Webhooki' },
  { id: 'events',        label: 'Zdarzenia' },
  { id: 'signature',     label: 'Weryfikacja podpisu' },
  { id: 'errors',        label: 'Kody błędów' },
  { id: 'rate-limits',   label: 'Limity' },
];

const CodeBlock = ({ children, lang = 'bash' }: { children: string; lang?: string }) => {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    await navigator.clipboard.writeText(children);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };
  return (
    <div className="relative rounded-xl border border-[hsl(var(--glass-border))] bg-slate-950/60 overflow-hidden my-3">
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-[hsl(var(--glass-border))] bg-black/30">
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-data">{lang}</span>
        <button onClick={copy} className="text-muted-foreground hover:text-foreground transition-colors">
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
        </button>
      </div>
      <pre className="px-4 py-3 overflow-x-auto text-xs font-data text-foreground/90 leading-relaxed">
        <code>{children}</code>
      </pre>
    </div>
  );
};

const H = ({ id, children }: { id: string; children: React.ReactNode }) => (
  <h2 id={id} className="scroll-mt-24 text-xl font-display text-foreground mt-12 mb-4 pb-2 border-b border-[hsl(var(--glass-border))]">
    {children}
  </h2>
);

const Endpoint = ({ method, path }: { method: 'GET' | 'POST' | 'DELETE'; path: string }) => {
  const color =
    method === 'GET' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' :
    method === 'POST' ? 'bg-primary/10 text-primary border-primary/30' :
    'bg-red-500/10 text-red-400 border-red-500/30';
  return (
    <div className="inline-flex items-center gap-2 my-2">
      <span className={cn('px-2 py-0.5 rounded text-[10px] font-data font-bold border', color)}>{method}</span>
      <code className="font-data text-sm text-foreground">{path}</code>
    </div>
  );
};

const ApiDocs = () => {
  const [active, setActive] = useState('overview');

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 mb-3">
            <BookOpen className="w-4 h-4 text-primary" />
            <span className="text-[10px] uppercase tracking-[0.25em] text-primary font-data">Documentation</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-display text-foreground">API & Webhooks</h1>
          <p className="text-muted-foreground text-sm mt-2 max-w-2xl">
            REST API do programowego uruchamiania analiz oraz webhooki do powiadomień zdarzeń w czasie rzeczywistym.
          </p>

          <div className="mt-6 flex flex-wrap gap-2">
            <Link
              to="/developers"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-90"
            >
              <Key className="w-4 h-4" />
              Zarządzaj kluczami
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <a
              href="#analyze"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-[hsl(var(--glass-border))] text-sm text-foreground hover:bg-accent transition-colors"
            >
              <Terminal className="w-4 h-4" />
              Quick start
            </a>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-8">
          {/* Sidebar */}
          <aside className="hidden lg:block col-span-3">
            <nav className="sticky top-24 space-y-0.5">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground/70 font-medium px-3 py-2">
                Na tej stronie
              </p>
              {SECTIONS.map(s => (
                <a
                  key={s.id}
                  href={`#${s.id}`}
                  onClick={() => setActive(s.id)}
                  className={cn(
                    'block px-3 py-1.5 rounded-lg text-sm transition-colors',
                    active === s.id
                      ? 'bg-primary/10 text-primary font-medium'
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                  )}
                >
                  {s.label}
                </a>
              ))}
            </nav>
          </aside>

          {/* Content */}
          <main className="col-span-12 lg:col-span-9 max-w-3xl">
            {/* Overview */}
            <H id="overview">Wprowadzenie</H>

            <p className="text-sm text-muted-foreground leading-relaxed">
              Presora API to REST nad HTTPS z JSON-em w body i odpowiedziach. Bazowy URL:
            </p>
            <CodeBlock lang="http">{`https://www.presora.app/api/v1`}</CodeBlock>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Wszystkie żądania wymagają nagłówka <code className="font-data px-1 py-0.5 rounded bg-muted text-foreground">Authorization</code> z kluczem API.
            </p>

            <div className="grid sm:grid-cols-3 gap-3 mt-5">
              {[
                { icon: Zap,    title: 'Niskie opóźnienia', desc: 'Mediana <800ms dla cache, <12s dla nowych analiz' },
                { icon: Webhook,title: 'Webhooki',          desc: 'Push zdarzeń w czasie rzeczywistym z HMAC' },
                { icon: Key,    title: 'Bezpieczeństwo',    desc: 'Bearer tokens, IP allowlist, audit log' },
              ].map(({ icon: Icon, title, desc }) => (
                <div key={title} className="rounded-xl border border-[hsl(var(--glass-border))] bg-muted/20 p-4">
                  <Icon className="w-4 h-4 text-primary mb-2" />
                  <p className="text-sm font-medium text-foreground">{title}</p>
                  <p className="text-xs text-muted-foreground mt-1">{desc}</p>
                </div>
              ))}
            </div>

            {/* Auth */}
            <H id="auth">Autoryzacja</H>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Wygeneruj klucz w panelu <Link to="/developers" className="text-primary hover:underline">Developers</Link> i wyślij go w nagłówku Bearer:
            </p>
            <CodeBlock>{`curl https://www.presora.app/api/v1/analyses \\
  -H "Authorization: Bearer bb_live_a1b2c3d4e5f6..."`}</CodeBlock>
            <p className="text-sm text-muted-foreground">
              Klucze są pokazywane tylko raz przy tworzeniu. Trzymaj je w bezpiecznym miejscu (Vault, sekret CI). Nigdy nie commituj do repo.
            </p>

            {/* POST /analyze */}
            <H id="analyze">Uruchom analizę</H>
            <Endpoint method="POST" path="/v1/analyze" />
            <p className="text-sm text-muted-foreground leading-relaxed">
              Uruchamia analizę widoczności AI dla podanej marki i zwraca gotowy wynik w tej samej odpowiedzi —
              synchronicznie, zwykle w 5–15 sekund (tyle co skan w aplikacji). Nie ma statusu pośredniego do odpytywania;
              jeśli masz skonfigurowany webhook na <code className="font-data text-foreground bg-muted px-1 rounded">analysis.completed</code>,
              dostaniesz też jego kopię tamtędy.
            </p>

            <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium mt-5 mb-1">Body</p>
            <CodeBlock lang="json">{`{
  "brand": "Tesla"
}`}</CodeBlock>

            <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium mt-5 mb-1">Request</p>
            <CodeBlock>{`curl -X POST https://www.presora.app/api/v1/analyze \\
  -H "Authorization: Bearer bb_live_..." \\
  -H "Content-Type: application/json" \\
  -d '{"brand":"Tesla"}'`}</CodeBlock>

            <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium mt-5 mb-1">Response 200</p>
            <CodeBlock lang="json">{`{
  "id": "3f6b1e2a-...",
  "brandName": "Tesla",
  "createdAt": "2026-06-10T14:32:11Z",
  "trustScore": 87,
  "authority": 85,
  "sentiment": 78,
  "accuracy": 73,
  "mentions": 70,
  "recency": 78,
  "sources": [
    {
      "model": "GPT-4o",
      "sentiment": "Positive",
      "association": "Tesla product",
      "confidence": 85
    }
  ]
}`}</CodeBlock>
            <p className="text-sm text-muted-foreground">
              Liczba modeli faktycznie odpytanych (a więc długość <code className="font-data text-foreground bg-muted px-1 rounded">sources</code>) zależy od Twojego planu — tak samo jak przy skanie w aplikacji.
            </p>

            {/* GET /analyses/{id} */}
            <H id="get-analysis">Pobierz wynik</H>
            <Endpoint method="GET" path="/v1/analyses?id={id}" />
            <p className="text-sm text-muted-foreground">
              Zwraca jedną wcześniej zapisaną analizę (tej samej struktury co odpowiedź <code className="font-data text-foreground bg-muted px-1 rounded">POST /analyze</code>) — tylko jeśli należy do konta, którego kluczem się autoryzujesz.
            </p>
            <CodeBlock>{`curl "https://www.presora.app/api/v1/analyses?id=3f6b1e2a-..." \\
  -H "Authorization: Bearer bb_live_..."`}</CodeBlock>

            {/* GET /analyses */}
            <H id="list">Lista analiz</H>
            <Endpoint method="GET" path="/v1/analyses" />
            <p className="text-sm text-muted-foreground">
              Zwraca do 50 najnowszych analiz Twojego konta, najnowsze pierwsze. Bez stronicowania ani filtrów na razie —
              jeśli potrzebujesz więcej niż 50, napisz do nas.
            </p>
            <CodeBlock lang="json">{`{
  "analyses": [
    { "id": "3f6b1e2a-...", "brandName": "Tesla", "trustScore": 87, "...": "..." }
  ]
}`}</CodeBlock>

            {/* Webhooks */}
            <H id="webhooks">Webhooki</H>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Zarejestruj URL w panelu <Link to="/developers" className="text-primary hover:underline">Developers</Link> i
              wybierz zdarzenia. Wysyłamy POST z JSON-em i nagłówkiem <code className="font-data text-foreground bg-muted px-1 rounded">X-Presora-Signature</code>. Jeden strzał na próbę — jeśli endpoint nie odpowie 2xx (timeout 8s), dostarczenie jest oznaczane jako nieudane; zobaczysz to na liście "Recent deliveries" w panelu. Automatyczne ponawianie jeszcze nie jest wdrożone.
            </p>

            <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium mt-5 mb-1">Przykładowy payload</p>
            <CodeBlock lang="json">{`{
  "event": "analysis.completed",
  "timestamp": "2026-06-10T14:32:23Z",
  "data": {
    "id": "3f6b1e2a-...",
    "brandName": "Tesla",
    "trustScore": 87
  }
}`}</CodeBlock>

            {/* Events */}
            <H id="events">Dostępne zdarzenia</H>
            <div className="rounded-2xl border border-[hsl(var(--glass-border))] overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted/30 text-xs uppercase tracking-wider text-muted-foreground">
                    <th className="px-4 py-2 text-left font-medium">Event</th>
                    <th className="px-4 py-2 text-left font-medium">Kiedy wysyłany</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[hsl(var(--glass-border))]">
                  {[
                    ['analysis.completed', 'Analiza marki zakończona sukcesem'],
                    ['analysis.failed',    'Analiza nie powiodła się'],
                    ['sentiment.dropped',  'Sentyment AI spadł poniżej progu (default 60)'],
                    ['score.changed',      'Wynik widoczności zmienił się o ≥5 pkt vs poprzednia analiza'],
                  ].map(([ev, when]) => (
                    <tr key={ev}>
                      <td className="px-4 py-2"><code className="font-data text-primary">{ev}</code></td>
                      <td className="px-4 py-2 text-muted-foreground">{when}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Signature */}
            <H id="signature">Weryfikacja podpisu</H>
            <p className="text-sm text-muted-foreground">
              Każdy webhook zawiera nagłówek <code className="font-data text-foreground bg-muted px-1 rounded">X-Presora-Signature: sha256=…</code> — HMAC-SHA256 z surowego (nie sparsowanego) body żądania i sekretu tego webhooka, pokazanego raz przy jego utworzeniu w panelu Developers.
            </p>
            <CodeBlock lang="node">{`import crypto from 'node:crypto';

const verify = (rawBody, header, secret) => {
  const sig = header.replace(/^sha256=/, '');
  const expected = crypto
    .createHmac('sha256', secret)
    .update(rawBody)
    .digest('hex');
  return crypto.timingSafeEqual(
    Buffer.from(expected), Buffer.from(sig)
  );
};`}</CodeBlock>

            {/* Errors */}
            <H id="errors">Kody błędów</H>
            <div className="rounded-2xl border border-[hsl(var(--glass-border))] overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted/30 text-xs uppercase tracking-wider text-muted-foreground">
                    <th className="px-4 py-2 text-left font-medium w-20">Status</th>
                    <th className="px-4 py-2 text-left font-medium">Znaczenie</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[hsl(var(--glass-border))]">
                  {[
                    [400, 'Nieprawidłowe body lub brak wymaganego pola'],
                    [401, 'Brak, nieprawidłowy lub cofnięty klucz API'],
                    [404, 'Zasób nie istnieje lub nie należy do Twojego konta'],
                    [429, 'Przekroczony rate limit'],
                    [500, 'Błąd po naszej stronie — ponów żądanie'],
                  ].map(([s, m]) => (
                    <tr key={s}>
                      <td className="px-4 py-2"><code className="font-data font-medium text-foreground">{s}</code></td>
                      <td className="px-4 py-2 text-muted-foreground">{m}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Rate limits */}
            <H id="rate-limits">Limity szybkości</H>
            <p className="text-sm text-muted-foreground leading-relaxed">
              <code className="font-data text-foreground bg-muted px-1 rounded">POST /analyze</code> jest ograniczone do{' '}
              <strong className="text-foreground">10 żądań na minutę na konto</strong> (niezależnie od planu — to
              samo, co pilnuje w aplikacji ręczny skan), zwraca <code className="font-data text-foreground bg-muted px-1 rounded">429</code> po przekroczeniu.
              Miesięczny limit analiz jest ten sam co dla skanów w aplikacji i zależy od Twojego planu (zobacz{' '}
              <Link to="/pricing" className="text-primary hover:underline">cennik</Link>). Nagłówki{' '}
              <code className="font-data text-foreground bg-muted px-1 rounded">X-RateLimit-*</code> nie są jeszcze zwracane.
            </p>

            <div className="mt-12 rounded-2xl border border-primary/20 bg-primary/5 p-6 flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-foreground">Gotowy do integracji?</p>
                <p className="text-xs text-muted-foreground mt-0.5">Wygeneruj pierwszy klucz w 30 sekund.</p>
              </div>
              <Link
                to="/developers"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 whitespace-nowrap"
              >
                <Key className="w-4 h-4" /> Otwórz panel
              </Link>
            </div>
          </main>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ApiDocs;
