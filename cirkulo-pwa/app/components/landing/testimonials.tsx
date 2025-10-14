import { Card, CardContent } from "app/components/ui/card";
import { Star } from "lucide-react";

export function Testimonials() {
  const testimonials = [
    {
      name: "Sarah & the Squad",
      goal: "Bali Trip Fund",
      amount: "$6,000",
      quote: "We saved $6K for our dream vacation in just 8 months! Seeing everyone's contributions made it so much more motivating than saving alone.",
      avatar: "🏄‍♀️",
      color: "from-primary-400 to-primary-600"
    },
    {
      name: "The Martinez Roommates",
      goal: "House Down Payment",
      amount: "$15,000",
      quote: "Living together made us want to BUY together. Xersha helped us stay organized and accountable. Now we're homeowners! 🏡",
      avatar: "🏠",
      color: "from-secondary-400 to-secondary-600"
    },
    {
      name: "Alex's Emergency Fund Club",
      goal: "Safety Net Savings",
      amount: "$10,000",
      quote: "Building an emergency fund felt less scary when we did it together. We all hit our 6-month goal and celebrated as a group!",
      avatar: "🛡️",
      color: "from-success-400 to-success-600"
    }
  ];

  return (
    <section className="py-20 md:py-32 bg-gradient-to-br from-primary-50/30 to-secondary-50/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="flex items-center justify-center gap-1 mb-4">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="size-6 fill-warning-500 text-warning-500" />
            ))}
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-neutral-900 mb-4">
            Real people, real savings
          </h2>
          <p className="text-lg text-neutral-600">
            See how friend groups are turning their dreams into reality with Xersha.
          </p>
        </div>

        {/* Testimonials grid */}
        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial) => (
            <Card key={testimonial.name} className="border-2 hover:shadow-xl transition-all">
              <CardContent className="p-6 space-y-4">
                {/* Avatar and info */}
                <div className="flex items-center gap-4">
                  <div className={`size-16 rounded-full bg-gradient-to-br ${testimonial.color} flex items-center justify-center text-3xl shadow-lg`}>
                    {testimonial.avatar}
                  </div>
                  <div>
                    <h3 className="font-bold text-neutral-900">{testimonial.name}</h3>
                    <p className="text-sm text-neutral-600">{testimonial.goal}</p>
                  </div>
                </div>

                {/* Amount saved */}
                <div className="py-3 px-4 bg-gradient-to-r from-primary-50 to-secondary-50 rounded-xl border border-primary-200">
                  <p className="text-sm text-neutral-600">Saved together</p>
                  <p className="text-2xl font-bold text-neutral-900">{testimonial.amount}</p>
                </div>

                {/* Quote */}
                <blockquote className="text-neutral-700 italic leading-relaxed">
                  "{testimonial.quote}"
                </blockquote>

                {/* Stars */}
                <div className="flex gap-1 pt-2">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="size-4 fill-warning-500 text-warning-500" />
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Bottom social proof */}
        <div className="mt-16 text-center">
          <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 px-4 sm:px-8 py-4 bg-white rounded-2xl shadow-lg border border-neutral-200 w-full sm:w-auto sm:inline-flex">
            <div className="text-center w-full sm:w-auto">
              <div className="text-3xl font-bold text-primary-600">1,000+</div>
              <div className="text-sm text-neutral-600">Circles created</div>
            </div>
            <div className="w-px h-12 bg-neutral-200 hidden sm:block" />
            <div className="text-center w-full sm:w-auto">
              <div className="text-3xl font-bold text-primary-600">$2M+</div>
              <div className="text-sm text-neutral-600">Saved together</div>
            </div>
            <div className="w-px h-12 bg-neutral-200 hidden sm:block" />
            <div className="text-center w-full sm:w-auto">
              <div className="text-3xl font-bold text-primary-600">95%</div>
              <div className="text-sm text-neutral-600">Goal success rate</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
