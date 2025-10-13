import { Link } from "react-router";
import { Button } from "app/components/ui/button";
import { ArrowRight, Users, Sparkles } from "lucide-react";

export function HeroSection() {
  const scrollToHowItWorks = () => {
    document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 overflow-hidden pt-16">
      {/* Decorative background blobs */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-20 -left-20 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-1/3 -right-32 w-[500px] h-[500px] bg-secondary-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 left-1/4 w-96 h-96 bg-primary-400/10 rounded-full blur-3xl" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 md:pt-32 md:pb-24">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left column - Text content */}
          <div className="text-center lg:text-left space-y-8">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-100 text-primary-700 rounded-full text-sm font-medium">
              <Sparkles className="size-4" />
              <span>Powered by Bitcoin for transparent savings</span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-neutral-900 leading-tight">
              Save together,
              <br />
              <span className="text-primary-600">celebrate together</span>
            </h1>

            {/* Subheadline */}
            <p className="text-lg sm:text-xl text-neutral-700 max-w-2xl mx-auto lg:mx-0">
              Whether it's a beach trip with friends or an emergency fund with roommates,
              saving is better when you do it together. Track progress, cheer each other on,
              and reach your goals faster.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Button asChild size="lg" className="text-base">
                <Link to="/login">
                  <Users className="size-5" />
                  Start your first circle
                </Link>
              </Button>

              <Button
                variant="outline"
                size="lg"
                className="text-base"
                onClick={scrollToHowItWorks}
              >
                See how it works
                <ArrowRight className="size-5" />
              </Button>
            </div>

            {/* Social proof */}
            <div className="flex items-center gap-4 justify-center lg:justify-start text-sm text-neutral-600">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="size-8 rounded-full bg-gradient-to-br from-primary-400 to-secondary-400 border-2 border-white"
                  />
                ))}
              </div>
              <span>Join 1,000+ friend groups saving together</span>
            </div>
          </div>

          {/* Right column - Visual mockup */}
          <div className="relative">
            {/* Phone mockup with savings circle */}
            <div className="relative max-w-sm mx-auto">
              {/* Main card */}
              <div className="bg-white rounded-3xl shadow-2xl p-6 space-y-6 border border-neutral-200">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="size-12 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-bold text-lg">
                      🏖️
                    </div>
                    <div>
                      <h3 className="font-semibold text-neutral-900">Bali Squad Trip</h3>
                      <p className="text-sm text-neutral-600">6 friends</p>
                    </div>
                  </div>
                </div>

                {/* Progress */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-neutral-600">$3,240 of $6,000</span>
                    <span className="font-semibold text-primary-600">54%</span>
                  </div>
                  <div className="h-3 bg-neutral-100 rounded-full overflow-hidden">
                    <div className="h-full w-[54%] bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full" />
                  </div>
                </div>

                {/* Activity feed */}
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-primary-50 rounded-lg">
                    <div className="size-8 rounded-full bg-gradient-to-br from-secondary-400 to-secondary-600" />
                    <div className="flex-1">
                      <p className="text-sm text-neutral-900"><span className="font-semibold">Sarah</span> added $200</p>
                      <p className="text-xs text-neutral-600">Just now</p>
                    </div>
                    <span className="text-lg">🎉</span>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-neutral-50 rounded-lg">
                    <div className="size-8 rounded-full bg-gradient-to-br from-primary-400 to-primary-600" />
                    <div className="flex-1">
                      <p className="text-sm text-neutral-900"><span className="font-semibold">Mike</span> added $150</p>
                      <p className="text-xs text-neutral-600">2 hours ago</p>
                    </div>
                    <span className="text-lg">🔥</span>
                  </div>
                </div>

                {/* Action button */}
                <Button className="w-full" size="lg">
                  Add your contribution
                </Button>
              </div>

              {/* Floating celebration card */}
              <div className="absolute -right-4 top-1/4 bg-white rounded-2xl shadow-xl p-4 border border-neutral-200 rotate-6 max-w-[160px]">
                <div className="text-center space-y-2">
                  <div className="text-3xl">🎯</div>
                  <p className="text-xs font-semibold text-neutral-900">Halfway there!</p>
                  <p className="text-xs text-neutral-600">Keep it up!</p>
                </div>
              </div>

              {/* Floating contribution card */}
              <div className="absolute -left-4 bottom-1/4 bg-white rounded-2xl shadow-xl p-4 border border-neutral-200 -rotate-6 max-w-[160px]">
                <div className="text-center space-y-2">
                  <div className="text-3xl">💰</div>
                  <p className="text-xs font-semibold text-neutral-900">$540/month</p>
                  <p className="text-xs text-neutral-600">Avg. contribution</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom wave decoration */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
          <path
            d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 80C1200 80 1320 70 1380 65L1440 60V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z"
            fill="white"
          />
        </svg>
      </div>
    </section>
  );
}
