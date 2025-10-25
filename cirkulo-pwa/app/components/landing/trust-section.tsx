import { Shield, Eye, Check, Key, Coins } from "lucide-react";

export function TrustSection() {
  const trustItems = [
    {
      icon: Shield,
      title: "Bank-level security",
      description: "Your money is protected with the same security standards used by major financial institutions."
    },
    {
      icon: Key,
      title: "Your circle, your bank",
      description: "You hold the keys, you control your funds. True financial independence—no intermediaries, no gatekeepers, just you and your circle."
    },
    {
      icon: Eye,
      title: "Transparent by design",
      description: "Built on Bitcoin technology, every transaction is permanently recorded and visible to your circle. No fine print, no surprises—just honest, open savings."
    },
    {
      icon: Coins,
      title: "Bitcoin secure",
      description: "Protected by the same technology securing over $1 trillion worldwide. Your savings benefit from Bitcoin's proven 15-year track record."
    },
    {
      icon: Check,
      title: "No hidden fees",
      description: "What you see is what you get. No surprise charges, no fine print. Just honest, simple saving."
    }
  ];

  return (
    <section className="py-20 md:py-32 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center justify-center size-20 rounded-full bg-gradient-to-br from-success-500 to-success-600 mb-6">
            <Shield className="size-10 text-white" strokeWidth={2} />
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-neutral-900 mb-4">
            Your money, secured and protected
          </h2>
          <p className="text-lg text-neutral-600">
            We take security seriously so you can focus on reaching your goals, not worrying about safety.
          </p>
        </div>

        {/* Trust items grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-8">
          {trustItems.map((item) => {
            const Icon = item.icon;

            return (
              <div key={item.title} className="text-center space-y-4">
                {/* Icon */}
                <div className="inline-flex items-center justify-center size-16 rounded-2xl bg-success-100 text-success-600 mb-2">
                  <Icon className="size-8" strokeWidth={2} />
                </div>

                {/* Content */}
                <div>
                  <h3 className="font-bold text-lg text-neutral-900 mb-2">
                    {item.title}
                  </h3>
                  <p className="text-neutral-600 text-sm leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom reassurance */}
        <div className="mt-16 p-8 bg-gradient-to-r from-success-50 to-primary-50 rounded-3xl border border-success-200">
          <div className="max-w-3xl mx-auto text-center space-y-4">
            <p className="text-lg font-semibold text-neutral-900">
              Trusted by thousands of friend groups
            </p>
            <p className="text-neutral-600">
              Xersha combines Bitcoin's proven security (protecting over $1 trillion worldwide) with easy-to-use social savings.
              Save without borders, make your circle your bank, and access global financial opportunities—all while enjoying the accountability
              and motivation of saving with friends.
            </p>
            <div className="flex items-center justify-center gap-4 pt-4 flex-wrap">
              <div className="flex items-center gap-2 text-sm text-neutral-700">
                <Check className="size-5 text-success-600" />
                <span>Bitcoin secured</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-neutral-700">
                <Check className="size-5 text-success-600" />
                <span>Non-custodial (you control it)</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-neutral-700">
                <Check className="size-5 text-success-600" />
                <span>End-to-end encrypted</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-neutral-700">
                <Check className="size-5 text-success-600" />
                <span>Regularly audited</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
