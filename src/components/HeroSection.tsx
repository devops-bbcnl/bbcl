import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Shield, Code, Cloud } from "lucide-react";
import heroBg from "@/assets/hero-bg.jpg";
import logo from "@/assets/logo.png";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      <div className="absolute inset-0">
        <img src={heroBg} alt="" className="w-full h-full object-cover opacity-40" />
        <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/40 to-background" />
      </div>

      <div className="container relative z-10 pt-28 pb-20">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7 }}
              className="flex items-center gap-3 mb-8"
            >
              <div className="h-px w-12 gold-gradient-bg" />
              <span className="text-primary font-display text-sm font-semibold tracking-[0.2em] uppercase">
                Everything IT
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-5xl md:text-6xl lg:text-7xl font-display font-extrabold leading-[1.05] mb-6"
            >
              We Build the
              <br />
              <span className="gold-gradient-text">Digital Backbone</span>
              <br />
              of Your Business
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.4 }}
              className="text-lg text-muted-foreground max-w-lg mb-10 leading-relaxed"
            >
              From custom software to bulletproof cybersecurity — we deliver end-to-end IT solutions that scale with your ambitions.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.6 }}
              className="flex flex-wrap gap-4"
            >
              <Button variant="hero" size="lg" className="text-base px-8 py-6" onClick={() => document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" })}>
                Book a Free Consultation
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button variant="hero-outline" size="lg" className="text-base px-8 py-6" onClick={() => document.getElementById("services")?.scrollIntoView({ behavior: "smooth" })}>
                Explore Services
              </Button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.7, delay: 0.9 }}
              className="flex items-center gap-8 mt-14 text-sm text-muted-foreground"
            >
              {[
                { icon: Shield, text: "SOC 2 Ready" },
                { icon: Code, text: "50+ Projects" },
                { icon: Cloud, text: "99.9% Uptime" },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-2">
                  <Icon className="h-4 w-4 text-primary" />
                  <span>{text}</span>
                </div>
              ))}
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="hidden lg:flex items-center justify-center"
          >
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-primary/10 blur-3xl animate-gold-pulse" />
              <img src={logo} alt="Bubble Barrel" className="relative w-80 h-80 object-contain animate-float" />
            </div>
          </motion.div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-px gold-gradient-bg opacity-30" />
    </section>
  );
};

export default HeroSection;
