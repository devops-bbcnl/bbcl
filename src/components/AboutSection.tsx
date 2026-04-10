import { motion } from "framer-motion";
import { Target, Users, Zap, Award } from "lucide-react";

const stats = [
  { value: "50+", label: "Projects Delivered", icon: Target },
  { value: "98%", label: "Client Retention", icon: Users },
  { value: "24/7", label: "Support Available", icon: Zap },
  { value: "5+", label: "Years Experience", icon: Award },
];

const AboutSection = () => {
  return (
    <section id="about" className="section-padding relative">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/[0.02] to-transparent" />
      
      <div className="container relative">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <span className="text-primary font-display text-sm font-semibold tracking-[0.2em] uppercase">About Us</span>
            <h2 className="text-4xl md:text-5xl font-display font-extrabold mt-4 mb-6">
              Not Just Another <span className="gold-gradient-text">IT Company</span>
            </h2>
            <p className="text-muted-foreground text-lg leading-relaxed mb-6">
              Bubble Barrel was born from a simple belief: businesses deserve IT partners who think like founders. We don't just fix things — we build the technology foundation that lets you outpace your competition.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-8">
              Our team combines deep technical expertise with business acumen, delivering solutions that aren't just technically sound but strategically aligned. From startups to enterprises, we scale with you.
            </p>
            
            <div className="flex items-center gap-4">
              <div className="h-px flex-1 gold-gradient-bg opacity-30" />
              <span className="text-primary font-display text-sm font-semibold tracking-wider">Built Different</span>
              <div className="h-px flex-1 gold-gradient-bg opacity-30" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="grid grid-cols-2 gap-4"
          >
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.3 + i * 0.1 }}
                className="glass-card rounded-lg p-6 text-center hover:gold-border-glow transition-all duration-500"
              >
                <stat.icon className="h-6 w-6 text-primary mx-auto mb-3" />
                <div className="text-3xl font-display font-extrabold gold-gradient-text mb-1">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
