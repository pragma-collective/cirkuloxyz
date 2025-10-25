import type { Route } from "./+types/home";
import { Navigation } from "app/components/landing/navigation";
import { HeroSection } from "app/components/landing/hero-section";
import { HowItWorks } from "app/components/landing/how-it-works";
import { UseCases } from "app/components/landing/use-cases";
import { FeaturesSection } from "app/components/landing/features-section";
import { CryptoValueSection } from "app/components/landing/crypto-value-section";
import { SocialFeedShowcase } from "app/components/landing/social-feed-showcase";
import { TrustSection } from "app/components/landing/trust-section";
import { Testimonials } from "app/components/landing/testimonials";
import { FinalCTA } from "app/components/landing/final-cta";
import { Footer } from "app/components/landing/footer";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Xersha - Your Circle, Your Bank" },
    {
      name: "description",
      content:
        "Save in Bitcoin with your closest friends. Take control of your money together, access global financial opportunities, and build wealth without traditional banks.",
    },
    {
      name: "keywords",
      content: "bitcoin savings, group savings, save with friends, DeFi, social finance, savings circles, your circle your bank, borderless finance",
    },
    // Open Graph tags for social sharing
    { property: "og:title", content: "Xersha - Your Circle, Your Bank" },
    {
      property: "og:description",
      content: "Save in Bitcoin together. Access global finance, your circle is your bank. Reach your goals faster with friends.",
    },
    { property: "og:type", content: "website" },
    // Twitter Card tags
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: "Xersha - Your Circle, Your Bank" },
    {
      name: "twitter:description",
      content: "Save in Bitcoin together. Access global finance, your circle is your bank. Reach your goals faster with friends.",
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

        {/* Crypto value proposition - why Bitcoin makes us better */}
        <CryptoValueSection />

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
