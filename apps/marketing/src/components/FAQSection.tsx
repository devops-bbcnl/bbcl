import { motion } from "framer-motion";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const faqs = [
  { q: "What industries do you serve?", a: "We work across finance, healthcare, retail, SaaS, and more. Our solutions are tailored to your industry's unique requirements and compliance standards." },
  { q: "How long does a typical project take?", a: "Timelines vary by scope. A website might take 4-6 weeks, while a full cloud migration could span 3-6 months. We provide detailed timelines during our initial consultation." },
  { q: "Do you offer ongoing support?", a: "Absolutely. All our plans include post-launch support, and our Growth and Enterprise tiers offer continuous managed IT services with SLA-backed response times." },
  { q: "What's your approach to cybersecurity?", a: "We take a defense-in-depth approach — multiple layers of security from network to application level, combined with continuous monitoring, regular audits, and incident response planning." },
  { q: "Can you work with our existing tech stack?", a: "Yes. We're technology-agnostic and experienced with virtually every major platform, framework, and cloud provider. We'll assess what you have and recommend the best path forward." },
  { q: "How do you handle data privacy and compliance?", a: "Compliance is baked into our process. Whether it's GDPR, HIPAA, SOC 2, or PCI-DSS, we ensure your systems meet all required standards from day one." },
];

const FAQSection = () => {
  return (
    <section id="faq" className="section-padding">
      <div className="container max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-primary font-display text-sm font-semibold tracking-[0.2em] uppercase">FAQ</span>
          <h2 className="text-4xl md:text-5xl font-display font-extrabold mt-4">
            Got <span className="gold-gradient-text">Questions?</span>
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Accordion type="single" collapsible className="space-y-3">
            {faqs.map((faq, i) => (
              <AccordionItem key={i} value={`faq-${i}`} className="glass-card rounded-lg border-none px-6">
                <AccordionTrigger className="text-left font-display font-semibold hover:text-primary transition-colors py-5 hover:no-underline">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed pb-5">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  );
};

export default FAQSection;
