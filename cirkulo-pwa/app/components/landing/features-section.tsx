import { Card, CardContent } from "app/components/ui/card";
import { MessageCircle, Zap, PartyPopper } from "lucide-react";

export function FeaturesSection() {
  const features = [
    {
      icon: MessageCircle,
      title: "Social feed",
      description: "See every contribution, milestone, and celebration in real-time. Like a group chat, but for your goals.",
      visual: (
        <div className="space-y-2">
          <div className="flex items-center gap-2 p-2 bg-primary-50 rounded-lg">
            <div className="size-6 rounded-full bg-primary-400" />
            <span className="text-xs text-neutral-700">Alex added $100 🎉</span>
          </div>
          <div className="flex items-center gap-2 p-2 bg-neutral-50 rounded-lg">
            <div className="size-6 rounded-full bg-secondary-400" />
            <span className="text-xs text-neutral-700">Jamie added $75 ✨</span>
          </div>
          <div className="flex items-center gap-2 p-2 bg-success-50 rounded-lg">
            <div className="size-6 rounded-full bg-success-400" />
            <span className="text-xs text-neutral-700">Circle hit 50%! 🎯</span>
          </div>
        </div>
      )
    },
    {
      icon: Zap,
      title: "Automated contributions",
      description: "Set it and forget it. Schedule your contributions, and your circle grows on autopilot.",
      visual: (
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-gradient-to-r from-primary-50 to-secondary-50 rounded-xl">
            <div>
              <div className="text-sm font-semibold text-neutral-900">Weekly</div>
              <div className="text-xs text-neutral-600">Every Friday</div>
            </div>
            <div className="text-lg font-bold text-primary-600">$50</div>
          </div>
          <div className="text-center text-xs text-neutral-500">
            <div className="inline-flex items-center gap-1">
              <div className="size-2 rounded-full bg-success-500 animate-pulse" />
              <span>Next contribution in 2 days</span>
            </div>
          </div>
        </div>
      )
    },
    {
      icon: PartyPopper,
      title: "Milestone celebrations",
      description: "Hit 25%? 50%? Time to party! Your circle cheers you on with every achievement unlocked.",
      visual: (
        <div className="relative">
          <div className="bg-gradient-to-br from-primary-500 to-secondary-500 rounded-2xl p-6 text-center text-white">
            <div className="text-4xl mb-2">🎉</div>
            <div className="font-bold text-lg">Halfway there!</div>
            <div className="text-sm opacity-90">Your circle raised $3,000</div>
          </div>
          <div className="absolute -top-2 -right-2 text-2xl animate-bounce">✨</div>
          <div className="absolute -bottom-2 -left-2 text-2xl animate-bounce delay-100">🎊</div>
        </div>
      )
    }
  ];

  return (
    <section className="py-20 md:py-32 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-neutral-900 mb-4">
            Everything you need, nothing you don't
          </h2>
          <p className="text-lg text-neutral-600">
            We keep it simple so you can focus on what really matters: reaching your goals together.
          </p>
        </div>

        {/* Features grid */}
        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature) => {
            const Icon = feature.icon;

            return (
              <Card key={feature.title} className="border-2 hover:shadow-xl transition-all">
                <CardContent className="p-6 space-y-6">
                  {/* Icon */}
                  <div className="size-14 rounded-2xl bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center">
                    <Icon className="size-7 text-white" strokeWidth={2} />
                  </div>

                  {/* Text content */}
                  <div>
                    <h3 className="font-bold text-xl text-neutral-900 mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-neutral-600 leading-relaxed">
                      {feature.description}
                    </p>
                  </div>

                  {/* Visual mockup */}
                  <div className="pt-4 border-t border-neutral-100">
                    {feature.visual}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
