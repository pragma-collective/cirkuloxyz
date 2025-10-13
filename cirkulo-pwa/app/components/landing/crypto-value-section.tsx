import { Card } from "app/components/ui/card";
import { Eye, Key, Sparkles, ArrowRight } from "lucide-react";

export function CryptoValueSection() {
  const benefits = [
    {
      icon: Eye,
      title: "See everything, always",
      description: "Every contribution is recorded on Bitcoin's transparent ledger. No hidden fees, no mystery charges—just complete visibility for your entire circle.",
      color: "primary" as const
    },
    {
      icon: Key,
      title: "Your keys, your money",
      description: "Only you can access your contributions. Not banks, not us, not anyone. Bitcoin technology gives you true ownership of your savings.",
      color: "secondary" as const
    },
    {
      icon: Sparkles,
      title: "Choose your asset",
      description: "Start with Bitcoin, try stablecoins (digital dollars that don't fluctuate), or explore other options as you learn. Your circle decides together.",
      color: "success" as const
    }
  ];

  const colorClasses = {
    primary: { bg: "bg-primary-100", text: "text-primary-600", hover: "hover:border-primary-300" },
    secondary: { bg: "bg-secondary-100", text: "text-secondary-600", hover: "hover:border-secondary-300" },
    success: { bg: "bg-success-100", text: "text-success-600", hover: "hover:border-success-300" }
  };

  return (
    <section className="relative py-20 md:py-32 bg-gradient-to-br from-primary-50 via-white to-secondary-50 overflow-hidden">
      {/* Decorative background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -right-20 w-96 h-96 bg-warning-400/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-primary-400/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-warning-100 text-warning-700 rounded-full text-sm font-medium mb-6">
            <Sparkles className="size-4" />
            <span>Powered by Bitcoin technology</span>
          </div>

          {/* Headline */}
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-neutral-900 mb-4">
            Your money, upgraded
          </h2>

          {/* Subheadline */}
          <p className="text-lg text-neutral-600">
            Xersha uses Bitcoin to give your group savings superpowers that traditional banks can't match.
          </p>
        </div>

        {/* Benefits grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {benefits.map((benefit) => {
            const Icon = benefit.icon;
            const classes = colorClasses[benefit.color];

            return (
              <Card key={benefit.title} className={`p-8 hover:shadow-xl transition-all group border-2 ${classes.hover}`}>
                {/* Icon */}
                <div className={`size-14 rounded-2xl ${classes.bg} ${classes.text} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                  <Icon className="size-7" strokeWidth={2} />
                </div>

                {/* Content */}
                <h3 className="font-bold text-xl text-neutral-900 mb-3">
                  {benefit.title}
                </h3>
                <p className="text-neutral-600 leading-relaxed">
                  {benefit.description}
                </p>
              </Card>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div className="text-center">
          <a
            href="#"
            className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 font-semibold transition-colors"
          >
            How does this work?
            <ArrowRight className="size-4" />
          </a>
        </div>
      </div>
    </section>
  );
}
