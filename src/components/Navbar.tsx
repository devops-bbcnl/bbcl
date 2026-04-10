import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import logo from "@/assets/logo.png";

const navItems = ["Services", "About", "FAQ", "Contact"];

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollTo = (id: string) => {
    document.getElementById(id.toLowerCase())?.scrollIntoView({ behavior: "smooth" });
    setMobileOpen(false);
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled ? "bg-background/90 backdrop-blur-xl border-b border-primary/10 py-3" : "bg-transparent py-5"}`}>
      <div className="container flex items-center justify-between">
        <a href="#" className="flex items-center gap-3 group" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
          <img src={logo} alt="Bubble Barrel" className="h-10 w-10 transition-transform duration-300 group-hover:rotate-12" />
          <span className="font-display font-bold text-xl gold-gradient-text">Bubble Barrel</span>
        </a>

        <div className="hidden lg:flex items-center gap-8">
          {navItems.map((item) => (
            <button key={item} onClick={() => scrollTo(item)} className="text-sm text-foreground/70 hover:text-primary transition-colors duration-300 font-medium tracking-wide">
              {item}
            </button>
          ))}
        </div>

        <div className="hidden lg:block">
          <Button variant="hero" size="lg" onClick={() => scrollTo("Contact")}>
            Book a Consultation
          </Button>
        </div>

        <button className="lg:hidden text-foreground" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {mobileOpen && (
        <div className="lg:hidden absolute top-full left-0 right-0 bg-background/95 backdrop-blur-xl border-b border-primary/10 py-6 px-6 flex flex-col gap-4 animate-fade-in">
          {navItems.map((item) => (
            <button key={item} onClick={() => scrollTo(item)} className="text-left text-foreground/70 hover:text-primary transition-colors py-2 font-medium">
              {item}
            </button>
          ))}
          <Button variant="hero" onClick={() => scrollTo("Contact")} className="mt-2">
            Book a Consultation
          </Button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
