import logo from "@/assets/logo.png";

const Footer = () => {
  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <footer className="border-t border-border py-16 px-6">
      <div className="container">
        <div className="grid md:grid-cols-4 gap-12 mb-12">
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <img src={logo} alt="Bubble Barrel" className="h-10 w-10" />
              <span className="font-display font-bold text-xl gold-gradient-text">Bubble Barrel</span>
            </div>
            <p className="text-muted-foreground max-w-sm leading-relaxed">
              Your end-to-end IT partner. We build, secure, and scale the technology that powers your business.
            </p>
          </div>

          <div>
            <h4 className="font-display font-bold mb-4 text-sm tracking-wider uppercase">Services</h4>
            <div className="space-y-2">
              {["Web & App Dev", "IT Consulting", "Cybersecurity", "Cloud & DevOps"].map((s) => (
                <button key={s} onClick={() => scrollTo("services")} className="block text-sm text-muted-foreground hover:text-primary transition-colors">
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-display font-bold mb-4 text-sm tracking-wider uppercase">Company</h4>
            <div className="space-y-2">
              {[
                { label: "About", id: "about" },
                { label: "FAQ", id: "faq" },
                { label: "Contact", id: "contact" },
              ].map((item) => (
                <button key={item.id} onClick={() => scrollTo(item.id)} className="block text-sm text-muted-foreground hover:text-primary transition-colors">
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="border-t border-border pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Bubble Barrel. All rights reserved.
          </p>
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <a href="#" className="hover:text-primary transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-primary transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
