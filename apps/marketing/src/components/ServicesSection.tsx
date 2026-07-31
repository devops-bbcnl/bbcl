import { motion } from "framer-motion";
import { Code, Shield, Cloud, Headphones, ArrowUpRight } from "lucide-react";

const services = [
  {
    icon: Code,
    title: "Web & App Development",
    description: "Custom-built websites, web applications, and mobile apps engineered for performance, scalability, and stunning UX.",
    features: ["React / Next.js", "Mobile Apps", "E-Commerce", "API Development"],
  },
  {
    icon: Headphones,
    title: "IT Consulting & Support",
    description: "Proactive managed IT services, helpdesk support, and strategic consulting to keep your operations running seamlessly.",
    features: ["24/7 Helpdesk", "Infrastructure", "IT Strategy", "Hardware Setup"],
  },
  {
    icon: Shield,
    title: "Cybersecurity",
    description: "Comprehensive security solutions from penetration testing to compliance audits — protecting your digital assets around the clock.",
    features: ["Pen Testing", "Compliance", "SIEM", "Incident Response"],
  },
  {
    icon: Cloud,
    title: "Cloud & DevOps",
    description: "Seamless cloud migrations, CI/CD pipelines, and infrastructure automation on AWS, Azure, and GCP.",
    features: ["Cloud Migration", "CI/CD", "Kubernetes", "IaC"],
  },
];

const ServicesSection = () => {
  return (
    <section id="services" className="section-padding relative overflow-hidden">
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      
      <div className="container relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <span className="text-primary font-display text-sm font-semibold tracking-[0.2em] uppercase">What We Do</span>
          <h2 className="text-4xl md:text-5xl font-display font-extrabold mt-4 mb-6">
            Services That <span className="gold-gradient-text">Drive Results</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            Four pillars of IT excellence, each designed to solve real business problems.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6">
          {services.map((service, i) => (
            <motion.div
              key={service.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.15 }}
              className="group glass-card rounded-lg p-8 hover:gold-border-glow transition-all duration-500 cursor-pointer"
            >
              <div className="flex items-start justify-between mb-6">
                <div className="p-3 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                  <service.icon className="h-6 w-6" />
                </div>
                <ArrowUpRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-all duration-300 group-hover:translate-x-1 group-hover:-translate-y-1" />
              </div>
              
              <h3 className="text-xl font-display font-bold mb-3">{service.title}</h3>
              <p className="text-muted-foreground mb-6 leading-relaxed">{service.description}</p>
              
              <div className="flex flex-wrap gap-2">
                {service.features.map((f) => (
                  <span key={f} className="text-xs px-3 py-1 rounded-full bg-secondary text-muted-foreground border border-border">
                    {f}
                  </span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
