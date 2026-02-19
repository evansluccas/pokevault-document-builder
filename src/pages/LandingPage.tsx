import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ScanLine, TrendingUp, FolderOpen, FileSpreadsheet, ArrowRight } from "lucide-react";
import heroBg from "@/assets/hero-bg.jpg";

const features = [
  {
    icon: ScanLine,
    title: "AI Card Scanner",
    description: "Snap a photo and instantly identify any Pokémon card — name, set, number, and condition.",
  },
  {
    icon: TrendingUp,
    title: "eBay Market Pricing",
    description: "See the last 5 sold prices from eBay for any card. Always know what your collection is worth.",
  },
  {
    icon: FolderOpen,
    title: "Smart Collections",
    description: "Organize cards into custom collections. Share public links with friends and buyers.",
  },
  {
    icon: FileSpreadsheet,
    title: "Excel Import",
    description: "Migrate your existing spreadsheet in minutes with intelligent column mapping.",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="container mx-auto flex items-center justify-between h-16 px-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg gradient-accent flex items-center justify-center">
              <span className="text-accent-foreground font-bold text-sm">PV</span>
            </div>
            <span className="text-lg font-bold text-foreground">PokéVault</span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login">
              <Button variant="ghost" size="sm">Log In</Button>
            </Link>
            <Link to="/signup">
              <Button variant="hero" size="sm">Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative pt-16 overflow-hidden">
        <div className="gradient-hero min-h-[85vh] flex items-center">
          {/* Background image with overlay */}
          <div className="absolute inset-0 opacity-20">
            <img src={heroBg} alt="" className="w-full h-full object-cover" />
          </div>
          <div className="relative container mx-auto px-4 py-20 md:py-32">
            <div className="max-w-2xl animate-fade-in">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent/20 text-accent-foreground text-sm font-medium mb-6">
                <ScanLine className="w-4 h-4" />
                AI-Powered Collection Management
              </div>
              <h1 className="text-4xl md:text-6xl font-bold text-primary-foreground leading-tight mb-6">
                Your Pokémon collection,{" "}
                <span className="text-gradient">intelligently managed.</span>
              </h1>
              <p className="text-lg md:text-xl text-primary-foreground/70 mb-10 max-w-lg">
                Catalog, value, and organize your cards with AI scanning, real-time eBay pricing, and professional-grade tools.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link to="/signup">
                  <Button variant="hero" size="lg" className="text-base gap-2">
                    Start Collecting Free
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
                <Link to="/login">
                  <Button variant="hero-outline" size="lg" className="text-base">
                    Sign In
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 md:py-28">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Everything a collector needs
            </h2>
            <p className="text-lg text-muted-foreground max-w-md mx-auto">
              From casual binders to serious portfolios — PokéVault scales with your collection.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, i) => (
              <div
                key={feature.title}
                className="glass-elevated rounded-xl p-6 hover:shadow-lg transition-shadow animate-fade-in"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div className="w-12 h-12 rounded-xl gradient-accent flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-accent-foreground" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 gradient-hero">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
            Ready to vault your collection?
          </h2>
          <p className="text-primary-foreground/70 text-lg mb-8 max-w-md mx-auto">
            Join collectors who trust PokéVault to manage and value their cards.
          </p>
          <Link to="/signup">
            <Button variant="hero" size="lg" className="text-base gap-2">
              Create Free Account
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-border">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded gradient-accent flex items-center justify-center">
              <span className="text-accent-foreground font-bold text-xs">PV</span>
            </div>
            <span className="text-sm font-semibold text-foreground">PokéVault</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © 2026 PokéVault. Not affiliated with The Pokémon Company.
          </p>
        </div>
      </footer>
    </div>
  );
}
