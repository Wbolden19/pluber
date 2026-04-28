import { Button } from "@/components/ui/button";
import { useNavigate } from "@tanstack/react-router";
import {
  BadgeCheck,
  Building2,
  ChevronRight,
  MapPin,
  Shield,
  Star,
  Zap,
} from "lucide-react";
import { motion } from "motion/react";
import { ServiceCategoryBadge } from "../components/ServiceCategoryBadge";
import { SERVICE_CATEGORIES } from "../types";
import type { ServiceCategory } from "../types";

const SAMPLE_JOBS = [
  {
    title: "Front lawn needs mowing",
    category: "LawnMowing" as ServiceCategory,
    budget: "$45",
    address: "Brooklyn, NY",
    status: "Open",
  },
  {
    title: "Driveway snow removal",
    category: "SnowPlowing" as ServiceCategory,
    budget: "$80",
    address: "Queens, NY",
    status: "Open",
  },
  {
    title: "Hedge trimming along fence",
    category: "BushTrimming" as ServiceCategory,
    budget: "$60",
    address: "Hoboken, NJ",
    status: "Accepted",
  },
];

const FEATURES = [
  {
    icon: Shield,
    title: "Escrow Protection",
    description:
      "Payment held in escrow. Only released when both parties confirm the job is done.",
    accent: "text-accent",
    bg: "bg-accent/10",
  },
  {
    icon: MapPin,
    title: "Radius-Based Matching",
    description:
      "Workers get pinged within their radius. The more jobs you complete, the wider your reach.",
    accent: "text-primary",
    bg: "bg-primary/10",
  },
  {
    icon: BadgeCheck,
    title: "Verified Workers",
    description:
      "ID verification, proof of insurance, and liability waivers required before any worker goes live.",
    accent: "text-chart-5",
    bg: "bg-chart-5/10",
  },
  {
    icon: Building2,
    title: "Enterprise Dispatch",
    description:
      "Need a fleet for a big job? Subcontract our verified workers to your project site.",
    accent: "text-chart-3",
    bg: "bg-chart-3/10",
  },
];

export function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative min-h-[calc(100vh-4rem)] flex items-center bg-background overflow-hidden">
        {/* Background image with overlay */}
        <div className="absolute inset-0 z-0">
          <img
            src="/assets/generated/hero-pluber.dim_1200x600.jpg"
            alt=""
            className="w-full h-full object-cover opacity-25"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/80 to-background" />
        </div>

        {/* Decorative glows */}
        <div className="absolute top-1/4 -left-32 w-64 h-64 bg-accent/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 -right-32 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 py-24 grid lg:grid-cols-2 gap-12 items-center">
          {/* Left: copy */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="inline-flex items-center gap-2 bg-accent/10 border border-accent/20 rounded-full px-3 py-1 text-xs font-medium text-accent mb-6">
                <Zap className="w-3.5 h-3.5" />
                Your neighborhood, on demand
              </div>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="font-display font-bold text-5xl sm:text-6xl lg:text-7xl leading-none tracking-tight mb-6"
            >
              Get it done, <span className="text-accent">your way.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-muted-foreground text-lg sm:text-xl max-w-lg mb-10 leading-relaxed"
            >
              Post a job, set your price, and local pros come to you. Lawn
              mowing, snow plowing, pressure washing — Pluber connects
              homeowners with verified workers in minutes.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-wrap gap-3"
            >
              <Button
                size="lg"
                className="btn-accent text-base px-8 gap-2 shadow-elevated"
                onClick={() => navigate({ to: "/login" })}
                data-ocid="hero-cta-post-job"
              >
                Post a Job
                <ChevronRight className="w-4 h-4" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="text-base px-8 gap-2 border-primary/30 text-primary hover:bg-primary/10"
                onClick={() => navigate({ to: "/login" })}
                data-ocid="hero-cta-find-work"
              >
                Find Work
                <ChevronRight className="w-4 h-4" />
              </Button>
            </motion.div>

            {/* Trust indicators */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="flex items-center gap-6 mt-10 text-sm text-muted-foreground"
            >
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-chart-4 text-chart-4" />
                <span>4.9 avg rating</span>
              </div>
              <div className="flex items-center gap-1">
                <Shield className="w-4 h-4 text-accent" />
                <span>Escrow protected</span>
              </div>
              <div className="flex items-center gap-1">
                <BadgeCheck className="w-4 h-4 text-primary" />
                <span>Verified workers</span>
              </div>
            </motion.div>
          </div>

          {/* Right: live job cards */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-col gap-3"
          >
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
              Live jobs nearby
            </p>
            {SAMPLE_JOBS.map((job, i) => (
              <motion.div
                key={job.title}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.1 }}
                className="card-base p-4"
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="font-semibold text-sm font-display">
                    {job.title}
                  </span>
                  <span className="text-accent font-bold text-sm shrink-0">
                    {job.budget}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <ServiceCategoryBadge category={job.category} size="sm" />
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {job.address}
                  </span>
                </div>
              </motion.div>
            ))}
            <Button
              variant="ghost"
              size="sm"
              className="text-primary hover:text-primary/80 gap-1 self-end"
              onClick={() => navigate({ to: "/login" })}
              data-ocid="hero-view-all-jobs"
            >
              View all open jobs <ChevronRight className="w-3.5 h-3.5" />
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Service Categories */}
      <section className="bg-muted/30 border-y border-border py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-10"
          >
            <h2 className="font-display font-bold text-3xl mb-3">
              What can Pluber do for you?
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              From weekly lawn care to one-time snow removal — if it needs
              doing, Pluber has a pro for it.
            </p>
          </motion.div>
          <div className="flex flex-wrap justify-center gap-3">
            {SERVICE_CATEGORIES.map((cat, i) => (
              <motion.div
                key={cat.value}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
              >
                <ServiceCategoryBadge category={cat.value} size="md" />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-background py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <h2 className="font-display font-bold text-3xl sm:text-4xl mb-4">
              Built for trust, speed, and fairness
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto text-lg">
              Pluber isn't just a marketplace. It's a system that protects
              everyone involved.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURES.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="card-base p-6"
              >
                <div
                  className={`w-10 h-10 rounded-xl ${feature.bg} flex items-center justify-center mb-4`}
                >
                  <feature.icon className={`w-5 h-5 ${feature.accent}`} />
                </div>
                <h3 className="font-display font-semibold text-base mb-2">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="bg-muted/30 border-y border-border py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <h2 className="font-display font-bold text-3xl sm:text-4xl mb-4">
              How Pluber works
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-12">
            {/* Homeowner */}
            <div>
              <h3 className="font-display font-semibold text-xl mb-6 flex items-center gap-2">
                <span className="w-7 h-7 rounded-full bg-accent/20 text-accent text-sm font-bold flex items-center justify-center">
                  H
                </span>
                For Homeowners
              </h3>
              {[
                { step: 1, text: "Sign up and add your address" },
                {
                  step: 2,
                  text: "Post a job — describe the task and set your budget",
                },
                { step: 3, text: "A worker accepts and shows up" },
                {
                  step: 4,
                  text: "Both confirm completion, escrow releases, tip if you want",
                },
              ].map((item, i) => (
                <motion.div
                  key={item.step}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-start gap-4 mb-5"
                >
                  <span className="w-8 h-8 rounded-full bg-card border border-border text-sm font-bold font-display flex items-center justify-center shrink-0 text-accent">
                    {item.step}
                  </span>
                  <p className="text-foreground pt-1">{item.text}</p>
                </motion.div>
              ))}
            </div>

            {/* Worker */}
            <div>
              <h3 className="font-display font-semibold text-xl mb-6 flex items-center gap-2">
                <span className="w-7 h-7 rounded-full bg-primary/20 text-primary text-sm font-bold flex items-center justify-center">
                  W
                </span>
                For Workers
              </h3>
              {[
                { step: 1, text: "Apply: submit ID and proof of insurance" },
                {
                  step: 2,
                  text: "Select your service expertise and set your radius",
                },
                { step: 3, text: "Get pinged when jobs appear near you" },
                {
                  step: 4,
                  text: "Accept, complete, get paid. More jobs = bigger radius",
                },
              ].map((item, i) => (
                <motion.div
                  key={item.step}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-start gap-4 mb-5"
                >
                  <span className="w-8 h-8 rounded-full bg-card border border-border text-sm font-bold font-display flex items-center justify-center shrink-0 text-primary">
                    {item.step}
                  </span>
                  <p className="text-foreground pt-1">{item.text}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-background py-20 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="w-16 h-16 rounded-2xl bg-accent/15 border border-accent/30 flex items-center justify-center mx-auto mb-6">
              <Zap className="w-8 h-8 text-accent" />
            </div>
            <h2 className="font-display font-bold text-3xl sm:text-4xl mb-4">
              Ready to get started?
            </h2>
            <p className="text-muted-foreground text-lg mb-8">
              Join Pluber today — post your first job or sign up as a worker and
              start earning.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Button
                size="lg"
                className="btn-accent text-base px-8 gap-2 shadow-elevated"
                onClick={() => navigate({ to: "/login" })}
                data-ocid="bottom-cta-post-job"
              >
                Post a Job <ChevronRight className="w-4 h-4" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="text-base px-8 gap-2 border-primary/30 text-primary hover:bg-primary/10"
                onClick={() => navigate({ to: "/login" })}
                data-ocid="bottom-cta-find-work"
              >
                Become a Worker <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
