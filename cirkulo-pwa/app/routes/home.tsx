import type { Route } from "./+types/home";
import { Navigation } from "app/components/landing/navigation";
import { HeroSection } from "app/components/landing/hero-section";
import { HowItWorks } from "app/components/landing/how-it-works";
import { UseCases } from "app/components/landing/use-cases";
import { FeaturesSection } from "app/components/landing/features-section";
import { SocialFeedShowcase } from "app/components/landing/social-feed-showcase";
import { TrustSection } from "app/components/landing/trust-section";
import { Testimonials } from "app/components/landing/testimonials";
import { FinalCTA } from "app/components/landing/final-cta";
import { Footer } from "app/components/landing/footer";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Xersha - Save Together, Celebrate Together" },
    {
      name: "description",
      content:
        "Turn your financial goals into shared adventures. Join thousands of friend groups saving together for vacations, house funds, and more with Xersha.",
    },
    {
      name: "keywords",
      content: "group savings, save with friends, social finance, savings circles, group money, collective savings",
    },
    // Open Graph tags for social sharing
    { property: "og:title", content: "Xersha - Save Together, Celebrate Together" },
    {
      property: "og:description",
      content: "Make saving a social adventure. Join friend groups reaching their goals together.",
    },
    { property: "og:type", content: "website" },
    // Twitter Card tags
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: "Xersha - Save Together, Celebrate Together" },
    {
      name: "twitter:description",
      content: "Make saving a social adventure. Join friend groups reaching their goals together.",
    },
  ];
}

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <Navigation />

      {/* Main content */}
      <main>
        {/* Hero section with primary CTA */}
        <HeroSection />

        {/* How it works - 3 simple steps */}
        <HowItWorks />

        {/* Use cases - relatable savings scenarios */}
        <UseCases />

        {/* Features - social feed, automation, celebrations */}
        <FeaturesSection />

        {/* Social feed showcase - visual mockup */}
        <SocialFeedShowcase />

        {/* Trust & security - simplified, non-technical */}
        <TrustSection />

        {/* Testimonials - real success stories */}
        <Testimonials />

        {/* Final CTA - ready to start */}
        <FinalCTA />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
