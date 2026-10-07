import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { ContactForm } from '@/components/ui/contact-form';

const Contact = () => (
  <div className="min-h-screen bg-background">
    <Navbar />
    <main className="pt-28 pb-20 px-4 max-w-4xl mx-auto">
      <p className="text-xs font-semibold tracking-wider uppercase text-primary mb-3">Contact</p>
      <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-4 text-balance">
        Talk to us
      </h1>
      <p className="text-base text-muted-foreground leading-relaxed mb-10 max-w-2xl">
        Questions about the product, an Enterprise plan, or a bug you've hit — this reaches a real
        person, not a ticket queue.
      </p>
      <ContactForm />
    </main>
    <Footer />
  </div>
);

export default Contact;
