import { Link } from 'react-router-dom';
import { ShieldCheck, Smile, Target, AtSign, Clock, ArrowRight } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';

const DIMENSIONS = [
  { Icon: ShieldCheck, name: 'Authority', desc: 'How often authoritative, trusted sources back up mentions of the brand.' },
  { Icon: Smile, name: 'Sentiment', desc: 'How positively AI models describe the brand.' },
  { Icon: Target, name: 'Accuracy', desc: 'Whether model outputs about the brand are factually correct.' },
  { Icon: AtSign, name: 'Mentions', desc: 'How often the brand comes up at all in relevant prompts.' },
  { Icon: Clock, name: 'Recency', desc: "Whether models' knowledge of the brand is current." },
];

const About = () => (
  <div className="min-h-screen bg-background">
    <Navbar />
    <main className="pt-28 pb-20 px-4 max-w-3xl mx-auto">
      <p className="text-xs font-semibold tracking-wider uppercase text-primary mb-3">About Presora</p>
      <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-6 text-balance">
        Presora measures how AI models see your brand
      </h1>
      <p className="text-base text-muted-foreground leading-relaxed mb-4">
        Presora is a SaaS tool, founded in 2024, that checks whether ChatGPT, Claude, Gemini,
        Perplexity, Mistral and Llama recommend a brand — or its competitors. As more people ask
        AI assistants directly instead of searching, a brand's visibility inside model answers
        matters as much as its search-engine ranking. This category of work is often called{' '}
        <strong className="text-foreground font-semibold">GEO</strong> (Generative Engine
        Optimization) or <strong className="text-foreground font-semibold">AIO</strong> (AI
        Optimization).
      </p>
      <p className="text-base text-muted-foreground leading-relaxed mb-10">
        A scan runs a brand through multiple foundation models in parallel and scores the result
        across 5 dimensions, ready in about 15 seconds.
      </p>

      <h2 className="text-lg font-semibold text-foreground mb-4">The 5 dimensions</h2>
      <div className="grid sm:grid-cols-2 gap-3 mb-12">
        {DIMENSIONS.map(({ Icon, name, desc }) => (
          <div key={name} className="rounded-xl border border-border bg-card/60 p-4">
            <div className="flex items-center gap-2 mb-1.5">
              <Icon className="w-4 h-4 text-primary shrink-0" />
              <span className="text-sm font-semibold text-foreground">{name}</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
          </div>
        ))}
      </div>

      <h2 className="text-lg font-semibold text-foreground mb-3">Who it's for</h2>
      <p className="text-base text-muted-foreground leading-relaxed mb-10">
        Agencies tracking AI visibility for clients, brand and marketing teams monitoring their
        own presence in generative search, and freelancers who need a fast, credible read on how
        a company shows up in AI answers.
      </p>

      <h2 className="text-lg font-semibold text-foreground mb-3">Company</h2>
      <p className="text-base text-muted-foreground leading-relaxed mb-10">
        Presora is an independently operated SaaS product. Get in touch at{' '}
        <a href="mailto:contact.presora@gmail.com" className="text-primary hover:underline">
          contact.presora@gmail.com
        </a>
        . See the <Link to="/regulamin" className="text-primary hover:underline">terms of service</Link>{' '}
        and <Link to="/polityka-prywatnosci" className="text-primary hover:underline">privacy policy</Link>{' '}
        for details on how the product and your data are handled.
      </p>

      <Link
        to="/brand-visibility"
        className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
      >
        Run a free scan of your brand <ArrowRight className="w-4 h-4" />
      </Link>
    </main>
    <Footer />
  </div>
);

export default About;
