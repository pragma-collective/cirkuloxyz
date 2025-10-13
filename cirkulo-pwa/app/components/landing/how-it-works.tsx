import { UserPlus, Target, TrendingUp } from "lucide-react";

export function HowItWorks() {
  const steps = [
    {
      number: "1",
      icon: UserPlus,
      title: "Create a circle",
      description: "Invite your friends, roommates, or anyone you trust. It takes just a minute to get started.",
      color: "primary"
    },
    {
      number: "2",
      icon: Target,
      title: "Set your goal",
      description: "Vacation fund? Emergency savings? Choose what you're saving for and how—Bitcoin, digital dollars, or other assets. Your circle, your choice.",
      color: "secondary"
    },
    {
      number: "3",
      icon: TrendingUp,
      title: "Watch it grow",
      description: "Everyone contributes on their own schedule. Celebrate milestones and cheer each other on!",
      color: "success"
    }
  ];

  return (
    <section id="how-it-works" className="py-20 md:py-32 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-neutral-900 mb-4">
            Three steps to saving smarter
          </h2>
          <p className="text-lg text-neutral-600">
            No confusing setup, no complicated terms. Just you, your friends, and your goals.
          </p>
        </div>

        {/* Steps */}
        <div className="grid md:grid-cols-3 gap-8 md:gap-12 relative">
          {/* Connection lines (desktop only) */}
          <div className="hidden md:block absolute top-24 left-0 right-0 h-0.5 bg-gradient-to-r from-primary-200 via-secondary-200 to-success-200 -z-10" />

          {steps.map((step) => {
            const Icon = step.icon;
            const colorClasses = {
              primary: {
                bg: "bg-primary-100",
                text: "text-primary-600",
                border: "border-primary-200",
                gradient: "from-primary-500 to-primary-600"
              },
              secondary: {
                bg: "bg-secondary-100",
                text: "text-secondary-600",
                border: "border-secondary-200",
                gradient: "from-secondary-500 to-secondary-600"
              },
              success: {
                bg: "bg-success-100",
                text: "text-success-600",
                border: "border-success-200",
                gradient: "from-success-500 to-success-600"
              }
            }[step.color];

            return (
              <div key={step.number} className="relative">
                {/* Step card */}
                <div className="text-center space-y-4">
                  {/* Icon circle */}
                  <div className="relative inline-flex">
                    <div className={`size-20 rounded-full bg-gradient-to-br ${colorClasses.gradient} flex items-center justify-center shadow-lg`}>
                      <Icon className="size-10 text-white" strokeWidth={2} />
                    </div>
                    {/* Step number badge */}
                    <div className={`absolute -top-2 -right-2 size-8 rounded-full bg-white border-2 ${colorClasses.border} flex items-center justify-center font-bold ${colorClasses.text} text-sm shadow-md`}>
                      {step.number}
                    </div>
                  </div>

                  {/* Text content */}
                  <div>
                    <h3 className="text-xl font-bold text-neutral-900 mb-2">
                      {step.title}
                    </h3>
                    <p className="text-neutral-600">
                      {step.description}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom CTA hint */}
        <div className="text-center mt-16">
          <p className="text-neutral-600">
            Ready to get started?{" "}
            <a href="/login" className="text-primary-600 hover:text-primary-700 font-semibold underline">
              Create your first circle
            </a>
          </p>
        </div>
      </div>
    </section>
  );
}
