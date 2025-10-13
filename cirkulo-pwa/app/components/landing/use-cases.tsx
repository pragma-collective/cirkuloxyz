import { Card } from "app/components/ui/card";
import { Button } from "app/components/ui/button";
import { Plane, Home, Shield, TrendingUp, Heart, Gift } from "lucide-react";
import { Link } from "react-router";

export function UseCases() {
  const cases = [
    {
      emoji: "🏖️",
      icon: Plane,
      title: "Group vacation fund",
      description: "Beach trip with the squad? Everyone chips in, and you all track progress together.",
      color: "primary"
    },
    {
      emoji: "🏠",
      icon: Home,
      title: "Roommate house fund",
      description: "Saving for a new place or splitting rent? Keep everything transparent and organized.",
      color: "secondary"
    },
    {
      emoji: "🛡️",
      icon: Shield,
      title: "Emergency savings club",
      description: "Build a safety net together. Because unexpected things happen to all of us.",
      color: "success"
    },
    {
      emoji: "📈",
      icon: TrendingUp,
      title: "Investment learning group",
      description: "Learn about investing with friends. Start small, grow your confidence together.",
      color: "primary"
    },
    {
      emoji: "❤️",
      icon: Heart,
      title: "Community fundraiser",
      description: "Rally your community around a cause. Track donations and celebrate impact together.",
      color: "error"
    },
    {
      emoji: "🎁",
      icon: Gift,
      title: "Birthday gift pool",
      description: "Planning an epic gift for a friend? Pool money with others for something special.",
      color: "warning"
    }
  ];

  return (
    <section className="py-20 md:py-32 bg-gradient-to-br from-neutral-50 to-primary-50/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-neutral-900 mb-4">
            Save for what matters
          </h2>
          <p className="text-lg text-neutral-600">
            Whatever your goal, Xersha makes it easy to get there together.
          </p>
        </div>

        {/* Use case grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {cases.map((useCase) => {
            const Icon = useCase.icon;
            const colorClasses = {
              primary: {
                bg: "bg-primary-100",
                text: "text-primary-600",
                hover: "hover:border-primary-300"
              },
              secondary: {
                bg: "bg-secondary-100",
                text: "text-secondary-600",
                hover: "hover:border-secondary-300"
              },
              success: {
                bg: "bg-success-100",
                text: "text-success-600",
                hover: "hover:border-success-300"
              },
              error: {
                bg: "bg-error-100",
                text: "text-error-600",
                hover: "hover:border-error-300"
              },
              warning: {
                bg: "bg-warning-100",
                text: "text-warning-600",
                hover: "hover:border-warning-300"
              }
            }[useCase.color];

            return (
              <Card
                key={useCase.title}
                className={`p-6 transition-all duration-300 hover:shadow-lg cursor-pointer group ${colorClasses.hover}`}
              >
                <div className="space-y-4">
                  {/* Icon */}
                  <div className="flex items-center justify-between">
                    <div className={`size-14 rounded-2xl ${colorClasses.bg} ${colorClasses.text} flex items-center justify-center text-2xl group-hover:scale-110 transition-transform`}>
                      {useCase.emoji}
                    </div>
                    <Icon className={`size-6 ${colorClasses.text} opacity-60`} />
                  </div>

                  {/* Content */}
                  <div>
                    <h3 className="font-bold text-lg text-neutral-900 mb-2">
                      {useCase.title}
                    </h3>
                    <p className="text-neutral-600 text-sm leading-relaxed">
                      {useCase.description}
                    </p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div className="text-center">
          <p className="text-neutral-600 mb-6">
            Or create your own custom circle for any goal you have in mind.
          </p>
          <Button asChild size="lg">
            <Link to="/login">Start your circle</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
