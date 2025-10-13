import { Link } from "react-router";
import { Button } from "app/components/ui/button";
import { Users, ArrowRight } from "lucide-react";

export function FinalCTA() {
  return (
    <section className="py-20 md:py-32 bg-gradient-to-br from-primary-500 via-primary-600 to-secondary-600 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Emoji decoration */}
        <div className="flex items-center justify-center gap-4 mb-8 text-4xl md:text-5xl">
          <span className="animate-bounce">🎯</span>
          <span className="animate-bounce delay-100">💰</span>
          <span className="animate-bounce delay-200">🎉</span>
        </div>

        {/* Heading */}
        <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
          Ready to start saving together?
        </h2>

        {/* Subtext */}
        <p className="text-lg sm:text-xl text-white/90 mb-8 max-w-2xl mx-auto">
          Join thousands of friend groups turning their goals into shared adventures.
          No credit card required. Get started in 2 minutes.
        </p>

        {/* CTA buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
          <Button asChild size="lg" variant="outline" className="bg-white text-primary-600 hover:bg-white/90 hover:text-primary-700 border-0 text-base px-8">
            <Link to="/login">
              <Users className="size-5" />
              Create your first circle
              <ArrowRight className="size-5" />
            </Link>
          </Button>
        </div>

        {/* Trust indicators */}
        <div className="flex flex-wrap items-center justify-center gap-6 text-white/80 text-sm">
          <div className="flex items-center gap-2">
            <svg className="size-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            <span>No credit card required</span>
          </div>
          <div className="flex items-center gap-2">
            <svg className="size-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            <span>Setup takes 2 minutes</span>
          </div>
          <div className="flex items-center gap-2">
            <svg className="size-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            <span>Free to get started</span>
          </div>
        </div>
      </div>
    </section>
  );
}
