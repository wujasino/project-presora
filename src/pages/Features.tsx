import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MessageSquare, Clock, Sparkles, TrendingUp, ArrowRight } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';

/* Moved off the landing page so the long-scroll story stays focused on the
   product's core loop (scan → score → fix); these two go deeper on "how it
   actually works day to day" and "how it compares", which a visitor who
   wants that level of detail can reach from the navbar instead. */

const Features = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-28">
        {/* ── Chat-based setup ────────────────────────────────────────── */}
        <section className="py-16 px-4 border-b border-[hsl(var(--glass-border))]">
          <div className="max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-10"
            >
              <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs badge rounded-lg mb-4 font-data uppercase tracking-wider">
                <MessageSquare className="w-3 h-3" /> No forms
              </span>
              <h1 className="text-3xl sm:text-4xl font-display text-foreground mb-3">
                Set up monitoring by just saying it
              </h1>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                No settings screens, no cron syntax, no checkbox matrix. Describe what you
                want watched in a sentence and Presora sets it up.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="grid md:grid-cols-2 gap-4 items-start"
            >
              <div className="rounded-2xl border border-[hsl(var(--glass-border))] bg-card/60 backdrop-blur-xl p-5 space-y-3">
                <div className="flex justify-end">
                  <div className="max-w-[85%] rounded-2xl rounded-br-sm bg-primary text-primary-foreground px-4 py-2.5 text-sm">
                    Watch my brand weekly on ChatGPT and Claude, and tell me if my score drops
                  </div>
                </div>
                <div className="flex justify-start">
                  <div className="max-w-[85%] rounded-2xl rounded-bl-sm bg-muted/60 text-foreground px-4 py-2.5 text-sm">
                    Done. Scanning every Monday across ChatGPT and Claude — you'll get an
                    alert if the score falls more than 5 points.
                  </div>
                </div>
                <div className="flex items-center gap-2 pt-1 text-xs text-muted-foreground">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  Monitor active · next scan Monday
                </div>
              </div>

              <div className="space-y-4">
                {[
                  { Icon: Clock, title: 'Any schedule, in plain words', desc: '"every Monday", "twice a month", "first of the quarter" — no cron, no dropdowns.' },
                  { Icon: Sparkles, title: 'Pick models by naming them', desc: 'Say which assistants matter to you and only those get queried.' },
                  { Icon: TrendingUp, title: 'Alerts you describe, not configure', desc: 'Tell it what counts as bad news and it watches for exactly that.' },
                ].map(({ Icon, title, desc }) => (
                  <div key={title} className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                      <Icon className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">{title}</p>
                      <p className="text-sm text-muted-foreground leading-relaxed mt-0.5">{desc}</p>
                    </div>
                  </div>
                ))}
                <Link
                  to="/automations"
                  className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline pt-1"
                >
                  See how automations work <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ── Comparison table ─────────────────────────────────────────── */}
        <section className="py-24 px-4">
          <div className="max-w-5xl mx-auto">
            <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
              <span className="inline-block px-3 py-1 text-xs badge rounded-lg mb-4 font-data uppercase tracking-wider">
                Comparison
              </span>
              <h2 className="text-3xl sm:text-4xl font-display text-foreground mb-3">
                Presora vs. other AI visibility tools
              </h2>
              <p className="text-sm text-muted-foreground max-w-lg mx-auto">
                Every AI visibility tracker will show you a score. Here's what's actually different about how Presora gets there.
              </p>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}>
              <div className="overflow-x-auto rounded-2xl border border-[hsl(var(--glass-border))]">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[hsl(var(--glass-border))]">
                      <th className="text-left px-6 py-4 text-muted-foreground font-medium text-xs uppercase tracking-wider w-[35%]">Feature</th>
                      <th className="px-6 py-4 text-center">
                        <div className="flex flex-col items-center gap-1">
                          <span className="text-xs text-muted-foreground/50">Typical AI tracker</span>
                        </div>
                      </th>
                      <th className="px-6 py-4 text-center bg-primary/5 border-x border-primary/20">
                        <div className="flex flex-col items-center gap-1">
                          <span className="font-bold text-primary">Presora</span>
                          <span className="text-[10px] text-primary/60 font-normal">AI-native</span>
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { feature: 'Visibility across ChatGPT, Claude, Gemini',    others: true,  bb: true  },
                      { feature: 'AI Visibility Score (0–100)',                  others: true,  bb: true  },
                      { feature: 'Raw model answers behind every metric',        others: false, bb: true  },
                      { feature: 'Set up monitoring by chatting, not forms',     others: false, bb: true  },
                      { feature: 'Competitor comparison in AI answers',          others: 'varies', bb: true  },
                      { feature: 'Free plan with real usage (no trial only)',    others: 'varies', bb: true  },
                    ].map((row, i) => (
                      <tr key={i} className={`border-b border-[hsl(var(--glass-border))] last:border-0 ${i % 2 === 0 ? '' : 'bg-muted/10'}`}>
                        <td className="px-6 py-3.5 text-sm text-foreground">{row.feature}</td>
                        <td className="px-6 py-3.5 text-center">
                          {typeof row.others === 'boolean' ? (
                            row.others
                              ? <span className="text-emerald-400 text-base">✓</span>
                              : <span className="text-muted-foreground/30 text-base">—</span>
                          ) : (
                            <span className="text-sm text-muted-foreground">{row.others}</span>
                          )}
                        </td>
                        <td className="px-6 py-3.5 text-center bg-primary/5 border-x border-primary/20">
                          {typeof row.bb === 'boolean' ? (
                            row.bb
                              ? <span className="text-primary text-base font-bold">✓</span>
                              : <span className="text-muted-foreground/30 text-base">—</span>
                          ) : (
                            <span className="text-sm font-semibold text-primary">{row.bb}</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-center text-xs text-muted-foreground/40 mt-4">
                Most AI visibility trackers stop at a score. Presora shows the exact question we asked and the answer we got back, so you can check it yourself.
              </p>
            </motion.div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Features;
