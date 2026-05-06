import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Receipt,
  BarChart3,
  FileText,
  Shield,
  Wallet,
  PiggyBank,
  Target,
  Bell,
  Globe,
  Users,
  Smartphone,
  CheckCircle2,
  TrendingUp,
  CreditCard,
  ChevronRight,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

/* ─── Intersection Observer ─── */
function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setInView(true); obs.disconnect(); } },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, inView };
}

/* ─── Data ─── */
const valueProps = [
  {
    icon: Wallet,
    title: "Have Perfect Control",
    description: "Over all your cash expenses, bank accounts, and wallets — with multi-currency support for BND, MYR, SGD, and USD.",
    color: "bg-emerald-500",
    lightBg: "bg-emerald-50",
  },
  {
    icon: BarChart3,
    title: "Get a Quick Overview",
    description: "See your total income, expenses, and net profit at a glance with beautiful charts and category breakdowns.",
    color: "bg-pink-500",
    lightBg: "bg-pink-50",
  },
  {
    icon: Target,
    title: "Use Smart Budgets",
    description: "Set monthly budget limits by category to save money for what matters — a new car, vacation, or growing your business.",
    color: "bg-sky-500",
    lightBg: "bg-sky-50",
  },
];

const steps = [
  {
    num: "1",
    title: "Track every transaction",
    points: [
      "Add income and expenses with one tap — categorize by type automatically.",
      "Snap a photo of your receipt and attach it to any transaction.",
      "Support for BND, MYR, SGD, and USD currencies built-in.",
    ],
    image: "/images/brunei-business.jpg",
  },
  {
    num: "2",
    title: "Understand your financial habits",
    points: [
      "Analyze your finances with beautiful, simple, and easy to understand charts. No complicated Excel sheets.",
      "See where your money goes and where it comes from every month.",
      "See whether you spend less than you earn — in one place, at a glance.",
    ],
    image: "/images/kampong-ayer.jpg",
  },
  {
    num: "3",
    title: "Make your spending stress-free",
    points: [
      "Set budgets for each category and watch your progress in real-time.",
      "Create savings goals and track contributions toward your target.",
      "Generate professional invoices and send them to clients instantly.",
    ],
    image: "/images/rainforest.jpg",
  },
];

const features = [
  { icon: Receipt, title: "Digital Receipts", desc: "Upload and store photos/screenshots of receipts digitally. Never lose a receipt again." },
  { icon: FileText, title: "Professional Invoices", desc: "Create, send, and track invoices with line items, tax calculation, and printable view." },
  { icon: PiggyBank, title: "Savings Goals", desc: "Set goals and track your savings progress. Perfect for planning big purchases." },
  { icon: Globe, title: "Multiple Currencies", desc: "Seamlessly manage finances in BND, MYR, SGD, and USD. Built for Brunei businesses." },
  { icon: Bell, title: "Budget Alerts", desc: "Set monthly spending limits by category. Know exactly when you're close to your budget." },
  { icon: Users, title: "Contact Management", desc: "Keep track of customers, vendors, and business contacts all in one place." },
  { icon: Shield, title: "Secure & Private", desc: "Your financial data is encrypted and private. Only you have access to your information." },
  { icon: Smartphone, title: "Works Everywhere", desc: "Fully responsive design works on desktop, tablet, and mobile. Manage finances anywhere." },
  { icon: TrendingUp, title: "Financial Reports", desc: "P&L statements, monthly trends, category breakdowns — all the reports you need." },
];

const stats = [
  { value: "9+", label: "Powerful Features" },
  { value: "4", label: "Currencies Supported" },
  { value: "100%", label: "Bruneian Made" },
  { value: "Free", label: "To Get Started" },
];

/* ─── Landing Page ─── */
export function LandingPage() {
  const heroObs = useInView(0.1);
  const valuesObs = useInView();
  const stepsObs = useInView(0.05);
  const featuresObs = useInView();
  const bruneiObs = useInView();
  const ctaObs = useInView();

  return (
    <div className="flex flex-col overflow-x-hidden bg-white">

      {/* ═══ HERO ═══ */}
      <section ref={heroObs.ref} className="relative pt-16 pb-20 lg:pt-24 lg:pb-28 blob-bg overflow-hidden">
        {/* Subtle decorative shapes */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-gradient-to-br from-primary/5 to-transparent -translate-y-1/2 translate-x-1/4" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-gradient-to-tr from-amber-500/5 to-transparent translate-y-1/3 -translate-x-1/4" />

        <div className="container max-w-6xl mx-auto relative">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
            {/* Left: Text */}
            <div className="flex-1 text-center lg:text-left">
              <div className={`${heroObs.inView ? "animate-fade-in-up" : "opacity-0"}`}>
                <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary mb-6">
                  🇧🇳 Made in Brunei Darussalam
                </div>
              </div>

              <h1 className={`text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.1] text-foreground ${heroObs.inView ? "animate-fade-in-up delay-100" : "opacity-0"}`}>
                The Only App That Gets Your
                {" "}
                <span className="text-gradient">Money Into Shape</span>
              </h1>

              <p className={`mt-6 text-lg sm:text-xl text-muted-foreground max-w-lg mx-auto lg:mx-0 leading-relaxed ${heroObs.inView ? "animate-fade-in-up delay-200" : "opacity-0"}`}>
                Track income & expenses, store receipts digitally, create invoices, set budgets, and generate reports — all built for Brunei SMEs.
              </p>

              <div className={`mt-8 flex flex-col sm:flex-row gap-3 justify-center lg:justify-start ${heroObs.inView ? "animate-fade-in-up delay-300" : "opacity-0"}`}>
                <Button size="lg" className="text-base px-8 py-6 shadow-lg shadow-primary/20" asChild>
                  <Link to="/signup">
                    Get Started Free <ArrowRight className="ml-2 size-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="text-base px-8 py-6" asChild>
                  <Link to="/login">
                    Sign In <ChevronRight className="ml-1 size-4" />
                  </Link>
                </Button>
              </div>
            </div>

            {/* Right: App mockup in browser frame */}
            <div className={`flex-1 w-full max-w-xl ${heroObs.inView ? "animate-fade-in-up delay-300" : "opacity-0"}`}>
              <div className="relative">
                {/* Browser chrome frame */}
                <div className="rounded-xl shadow-2xl shadow-black/10 border border-gray-200 overflow-hidden bg-white">
                  {/* Browser bar */}
                  <div className="flex items-center gap-2 px-4 py-2.5 bg-gray-50 border-b border-gray-200">
                    <div className="flex gap-1.5">
                      <div className="size-3 rounded-full bg-red-400" />
                      <div className="size-3 rounded-full bg-amber-400" />
                      <div className="size-3 rounded-full bg-green-400" />
                    </div>
                    <div className="flex-1 mx-4">
                      <div className="bg-white rounded-md px-3 py-1 text-xs text-gray-400 border border-gray-200 text-center">
                        kira.app/dashboard
                      </div>
                    </div>
                  </div>
                  {/* Dashboard preview content */}
                  <div className="p-4 sm:p-6 bg-gradient-to-br from-gray-50 to-white">
                    <div className="grid grid-cols-3 gap-3 mb-4">
                      <div className="bg-white rounded-lg p-3 border border-gray-100 shadow-sm">
                        <div className="text-xs text-gray-500 mb-1">Income</div>
                        <div className="text-sm sm:text-base font-bold text-emerald-600">+$12,450</div>
                        <div className="flex items-center gap-1 mt-1">
                          <TrendingUp className="size-3 text-emerald-500" />
                          <span className="text-[10px] text-emerald-600">+12%</span>
                        </div>
                      </div>
                      <div className="bg-white rounded-lg p-3 border border-gray-100 shadow-sm">
                        <div className="text-xs text-gray-500 mb-1">Expenses</div>
                        <div className="text-sm sm:text-base font-bold text-rose-600">-$8,230</div>
                        <div className="flex items-center gap-1 mt-1">
                          <CreditCard className="size-3 text-rose-500" />
                          <span className="text-[10px] text-rose-600">14 txns</span>
                        </div>
                      </div>
                      <div className="bg-white rounded-lg p-3 border border-gray-100 shadow-sm">
                        <div className="text-xs text-gray-500 mb-1">Net Profit</div>
                        <div className="text-sm sm:text-base font-bold text-primary">+$4,220</div>
                        <div className="flex items-center gap-1 mt-1">
                          <PiggyBank className="size-3 text-primary" />
                          <span className="text-[10px] text-primary">BND</span>
                        </div>
                      </div>
                    </div>
                    {/* Mini chart bars */}
                    <div className="bg-white rounded-lg p-3 border border-gray-100 shadow-sm">
                      <div className="text-xs text-gray-500 mb-3 font-medium">Monthly Overview</div>
                      <div className="flex items-end gap-2 h-16">
                        {[40, 55, 35, 70, 50, 85, 65, 90, 75, 60, 80, 95].map((h, i) => (
                          <div key={i} className="flex-1 flex flex-col gap-0.5">
                            <div
                              className="rounded-sm w-full transition-all"
                              style={{
                                height: `${h * 0.6}px`,
                                backgroundColor: i === 11 ? "oklch(0.58 0.16 165)" : i >= 9 ? "oklch(0.58 0.16 165 / 0.6)" : "oklch(0.58 0.16 165 / 0.2)",
                              }}
                            />
                          </div>
                        ))}
                      </div>
                      <div className="flex justify-between mt-2">
                        <span className="text-[9px] text-gray-400">Jan</span>
                        <span className="text-[9px] text-gray-400">Jun</span>
                        <span className="text-[9px] text-gray-400">Dec</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Floating cards */}
                <div className="absolute -bottom-4 -left-4 bg-white rounded-lg shadow-lg border border-gray-100 p-3 animate-float hidden sm:block">
                  <div className="flex items-center gap-2">
                    <div className="size-8 rounded-full bg-emerald-100 flex items-center justify-center">
                      <CheckCircle2 className="size-4 text-emerald-600" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold">Receipt Saved</div>
                      <div className="text-[10px] text-gray-500">Kedai Kopi - $4.50</div>
                    </div>
                  </div>
                </div>
                <div className="absolute -top-2 -right-4 bg-white rounded-lg shadow-lg border border-gray-100 p-3 animate-float hidden sm:block" style={{ animationDelay: "1s" }}>
                  <div className="flex items-center gap-2">
                    <div className="size-8 rounded-full bg-amber-100 flex items-center justify-center">
                      <Target className="size-4 text-amber-600" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold">Goal: 78%</div>
                      <div className="text-[10px] text-gray-500">New Equipment</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ VALUE PROPS ═══ */}
      <section ref={valuesObs.ref} className="py-16 sm:py-20 bg-gray-50/50">
        <div className="container max-w-6xl mx-auto">
          <div className="grid sm:grid-cols-3 gap-6 lg:gap-8">
            {valueProps.map((vp, i) => (
              <div
                key={vp.title}
                className={`bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-md hover:-translate-y-1 transition-all duration-300 ${valuesObs.inView ? "animate-fade-in-up" : "opacity-0"}`}
                style={{ animationDelay: `${i * 0.12}s` }}
              >
                <div className={`size-14 rounded-2xl ${vp.color} flex items-center justify-center mb-5 shadow-sm`}>
                  <vp.icon className="size-7 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-2">{vp.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{vp.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ HOW IT WORKS — Step by Step ═══ */}
      <section ref={stepsObs.ref} className="py-20 sm:py-28">
        <div className="container max-w-6xl mx-auto">
          <div className={`text-center mb-16 ${stepsObs.inView ? "animate-fade-in-up" : "opacity-0"}`}>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight">
              How to Get Your{" "}
              <span className="text-gradient">Money Into Shape?</span>
            </h2>
          </div>

          <div className="space-y-20 lg:space-y-28">
            {steps.map((step, i) => {
              const isReversed = i % 2 === 1;
              return (
                <div
                  key={step.num}
                  className={`flex flex-col ${isReversed ? "lg:flex-row-reverse" : "lg:flex-row"} gap-10 lg:gap-16 items-center`}
                >
                  {/* Image side */}
                  <div className={`w-full lg:w-1/2 ${stepsObs.inView ? (isReversed ? "animate-slide-right" : "animate-slide-left") : "opacity-0"}`}
                    style={{ animationDelay: `${0.2 + i * 0.1}s` }}
                  >
                    <div className="relative">
                      {/* Big faded step number */}
                      <div className="absolute -top-8 -left-4 text-[120px] lg:text-[160px] font-extrabold text-gray-100 leading-none select-none -z-10">
                        {step.num}
                      </div>
                      <div className="relative overflow-hidden rounded-2xl shadow-lg">
                        <img
                          src={step.image}
                          alt={step.title}
                          className="w-full h-64 sm:h-80 object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                      </div>
                    </div>
                  </div>

                  {/* Text side */}
                  <div className={`w-full lg:w-1/2 ${stepsObs.inView ? (isReversed ? "animate-slide-left" : "animate-slide-right") : "opacity-0"}`}
                    style={{ animationDelay: `${0.35 + i * 0.1}s` }}
                  >
                    <div className="text-primary font-bold text-sm uppercase tracking-widest mb-2">
                      Step {step.num}
                    </div>
                    <h3 className="text-2xl sm:text-3xl font-extrabold mb-6 capitalize">
                      {step.title}
                    </h3>
                    <ul className="space-y-4">
                      {step.points.map((point, j) => (
                        <li key={j} className="flex items-start gap-3">
                          <CheckCircle2 className="size-5 text-primary mt-0.5 shrink-0" />
                          <span className="text-muted-foreground leading-relaxed">{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══ STATS BAR ═══ */}
      <section className="py-12 bg-gradient-to-r from-primary to-emerald-600">
        <div className="container max-w-5xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {stats.map((stat) => (
              <div key={stat.label}>
                <div className="text-3xl sm:text-4xl font-extrabold text-white">{stat.value}</div>
                <div className="text-sm text-white/70 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ FEATURES GRID ═══ */}
      <section ref={featuresObs.ref} className="py-20 sm:py-28 bg-gray-50/50">
        <div className="container max-w-6xl mx-auto">
          <div className={`text-center mb-14 ${featuresObs.inView ? "animate-fade-in-up" : "opacity-0"}`}>
            <p className="text-sm font-bold uppercase tracking-widest text-primary mb-3">
              Packed with Features
            </p>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight">
              Everything You Need,{" "}
              <span className="text-gradient">Nothing You Don't</span>
            </h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              From the markets of Gadong to the shops of Kiulap — Kira is built for how Brunei does business.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <div
                key={f.title}
                className={`group bg-white rounded-xl p-6 border border-gray-100 hover:shadow-md hover:border-primary/20 hover:-translate-y-0.5 transition-all duration-300 ${featuresObs.inView ? "animate-scale-in" : "opacity-0"}`}
                style={{ animationDelay: `${i * 0.06}s` }}
              >
                <div className="size-11 rounded-xl bg-primary/8 flex items-center justify-center mb-4 group-hover:bg-primary/15 transition-colors">
                  <f.icon className="size-5 text-primary" />
                </div>
                <h3 className="text-base font-bold mb-1.5">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ BRUNEI CULTURE SECTION ═══ */}
      <section ref={bruneiObs.ref} className="py-20 sm:py-28">
        <div className="container max-w-6xl mx-auto">
          <div className={`text-center mb-14 ${bruneiObs.inView ? "animate-fade-in-up" : "opacity-0"}`}>
            <p className="text-sm font-bold uppercase tracking-widest text-primary mb-3">
              Rooted in Brunei
            </p>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight">
              Built with Pride in{" "}
              <span className="text-gradient">Brunei Darussalam</span>
            </h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              Kira is designed specifically for Brunei SMEs — understanding our currency, our business culture, and our needs.
            </p>
          </div>

          <div className={`grid grid-cols-2 lg:grid-cols-3 gap-4 ${bruneiObs.inView ? "animate-scale-in delay-200" : "opacity-0"}`}>
            <div className="col-span-2 row-span-2 relative overflow-hidden rounded-2xl group">
              <img
                src="/images/hero-mosque.jpg"
                alt="Sultan Omar Ali Saifuddien Mosque"
                className="w-full h-full min-h-[300px] lg:min-h-[420px] object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <div className="absolute bottom-6 left-6 text-white">
                <p className="text-xs uppercase tracking-widest text-primary-foreground/80 mb-1">Iconic Landmark</p>
                <h3 className="text-xl sm:text-2xl font-bold">
                  Sultan Omar Ali Saifuddien Mosque
                </h3>
              </div>
            </div>
            <div className="relative overflow-hidden rounded-2xl group">
              <img
                src="/images/kampong-ayer.jpg"
                alt="Kampong Ayer Water Village"
                className="w-full h-full min-h-[180px] object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <div className="absolute bottom-4 left-4 text-white">
                <p className="text-[10px] uppercase tracking-widest text-white/70 mb-0.5">Heritage</p>
                <h3 className="text-sm sm:text-base font-bold">Kampong Ayer</h3>
              </div>
            </div>
            <div className="relative overflow-hidden rounded-2xl group">
              <img
                src="/images/rainforest.jpg"
                alt="Borneo Rainforest"
                className="w-full h-full min-h-[180px] object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <div className="absolute bottom-4 left-4 text-white">
                <p className="text-[10px] uppercase tracking-widest text-white/70 mb-0.5">Nature</p>
                <h3 className="text-sm sm:text-base font-bold">Borneo Rainforest</h3>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ CTA ═══ */}
      <section ref={ctaObs.ref} className="py-20 sm:py-24 bg-gradient-to-br from-primary/5 via-transparent to-amber-500/5">
        <div className={`container max-w-3xl mx-auto text-center ${ctaObs.inView ? "animate-fade-in-up" : "opacity-0"}`}>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight">
            Ready to Take Control of{" "}
            <span className="text-gradient">Your Finances?</span>
          </h2>
          <p className="mt-6 text-lg text-muted-foreground max-w-lg mx-auto">
            Join Brunei SME owners who trust Kira to manage their business finances with confidence and ease.
          </p>
          <Button
            size="lg"
            className="mt-10 text-lg px-10 py-7 shadow-lg shadow-primary/20"
            asChild
          >
            <Link to="/signup">
              Start Now — It's Free <ArrowRight className="ml-2 size-5" />
            </Link>
          </Button>
        </div>
      </section>

      {/* ═══ FOOTER ═══ */}
      <footer className="border-t bg-gray-50/50 py-12">
        <div className="container max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-xl bg-primary flex items-center justify-center shadow-sm">
                <span className="text-white font-bold text-lg">K</span>
              </div>
              <div>
                <span className="font-bold text-xl">Kira</span>
                <p className="text-xs text-muted-foreground">Financial Management for Brunei SMEs</p>
              </div>
            </div>

            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <span>🇧🇳 Made with pride in Brunei Darussalam</span>
            </div>

            <div className="text-sm text-center md:text-right">
              <p className="text-muted-foreground">© {new Date().getFullYear()} MahaKarya Digital</p>
              <p className="text-muted-foreground/60 text-xs mt-1">Empowering Brunei Businesses</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
