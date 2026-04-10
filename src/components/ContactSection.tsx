import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ArrowRight, Mail, MapPin, Phone } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const publicEmail = import.meta.env.VITE_PUBLIC_CONTACT_EMAIL?.trim();

const ContactSection = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    const name = String(data.get("name") ?? "").trim();
    const email = String(data.get("email") ?? "").trim();
    const company = String(data.get("company") ?? "").trim();
    const message = String(data.get("message") ?? "").trim();

    setLoading(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, company, message }),
      });
      const payload = (await res.json().catch(() => ({}))) as { error?: string; details?: string };

      if (!res.ok) {
        const base = payload.error ?? "Something went wrong. Please try again or email us directly.";
        toast({
          variant: "destructive",
          title: "Could not send",
          description: payload.details ? `${base} (${payload.details})` : base,
        });
        return;
      }

      toast({ title: "Message sent!", description: "We'll get back to you within 24 hours." });
      form.reset();
    } catch {
      toast({
        variant: "destructive",
        title: "Could not send",
        description: "Network error. Check your connection or email us directly.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="contact" className="section-padding relative">
      <div className="absolute right-0 bottom-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      
      <div className="container relative">
        <div className="grid lg:grid-cols-2 gap-16">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <span className="text-primary font-display text-sm font-semibold tracking-[0.2em] uppercase">Get In Touch</span>
            <h2 className="text-4xl md:text-5xl font-display font-extrabold mt-4 mb-6">
              Let's Build <span className="gold-gradient-text">Something Great</span>
            </h2>
            <p className="text-muted-foreground text-lg leading-relaxed mb-10">
              Book a free consultation and discover how Bubble Barrel can transform your IT infrastructure.
            </p>

            <div className="space-y-6">
              {[
                ...(publicEmail
                  ? [{ icon: Mail, label: publicEmail, href: `mailto:${publicEmail}` as const }]
                  : []),
                { icon: Phone, label: "+234(803) 767-4195", href: "tel:+2348037674195" },
                { icon: MapPin, label: "Available Worldwide" },
              ].map(({ icon: Icon, label, href }) => (
                <div key={label} className="flex items-center gap-4">
                  <div className="p-3 rounded-lg bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  {href ? (
                    <a href={href} className="text-foreground/80 hover:text-primary transition-colors">
                      {label}
                    </a>
                  ) : (
                    <span className="text-foreground/80">{label}</span>
                  )}
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            <form onSubmit={handleSubmit} className="glass-card rounded-lg p-8 space-y-5">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Name</label>
                  <Input name="name" placeholder="John Doe" required className="bg-secondary border-border focus:border-primary" />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Email</label>
                  <Input name="email" type="email" placeholder="john@company.com" required className="bg-secondary border-border focus:border-primary" />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Company</label>
                <Input name="company" placeholder="Your Company" className="bg-secondary border-border focus:border-primary" />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">How can we help?</label>
                <Textarea name="message" placeholder="Tell us about your project..." rows={5} required className="bg-secondary border-border focus:border-primary resize-none" />
              </div>
              <Button variant="hero" size="lg" className="w-full" type="submit" disabled={loading}>
                {loading ? "Sending..." : "Book a Consultation"}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
