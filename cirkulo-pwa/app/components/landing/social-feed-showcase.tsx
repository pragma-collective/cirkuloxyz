export function SocialFeedShowcase() {
  return (
    <section className="py-20 md:py-32 bg-gradient-to-br from-secondary-50/30 to-primary-50/30 relative overflow-hidden">
      {/* Decorative blob */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary-400/10 rounded-full blur-3xl" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left column - Text content */}
          <div className="space-y-6 lg:order-1">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-neutral-900">
              It's like a group chat for your goals
            </h2>
            <p className="text-lg text-neutral-600 leading-relaxed">
              Every contribution is a moment to celebrate. See when your friends add funds,
              react with emojis, and cheer each other on toward your shared goal.
            </p>

            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="size-12 rounded-full bg-primary-500/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl">👥</span>
                </div>
                <div>
                  <h3 className="font-semibold text-neutral-900 mb-1">See everyone's progress</h3>
                  <p className="text-neutral-600 text-sm">Track who's contributed and keep everyone accountable (in a fun way!).</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="size-12 rounded-full bg-secondary-500/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl">💬</span>
                </div>
                <div>
                  <h3 className="font-semibold text-neutral-900 mb-1">React and comment</h3>
                  <p className="text-neutral-600 text-sm">Drop emojis, leave notes, and keep the energy high with every milestone.</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="size-12 rounded-full bg-success-500/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl">🎉</span>
                </div>
                <div>
                  <h3 className="font-semibold text-neutral-900 mb-1">Celebrate together</h3>
                  <p className="text-neutral-600 text-sm">Hit a milestone? Everyone gets notified. Time to party!</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right column - Feed mockup */}
          <div className="lg:order-2 relative">
            <div className="bg-white rounded-3xl shadow-2xl p-6 max-w-md mx-auto border border-neutral-200">
              {/* Feed header */}
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-neutral-100">
                <div>
                  <h3 className="font-bold text-neutral-900">Circle Activity</h3>
                  <p className="text-sm text-neutral-600">What's happening</p>
                </div>
                <div className="size-10 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-bold">
                  6
                </div>
              </div>

              {/* Feed items */}
              <div className="space-y-4">
                {/* Milestone celebration */}
                <div className="bg-gradient-to-r from-primary-50 to-secondary-50 rounded-2xl p-4 border-2 border-primary-200">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="text-3xl">🎯</div>
                    <div>
                      <p className="font-semibold text-neutral-900">Milestone reached!</p>
                      <p className="text-xs text-neutral-600">Just now</p>
                    </div>
                  </div>
                  <p className="text-sm text-neutral-700 mb-2">
                    Your circle hit <span className="font-bold">75%</span> of your goal! 🎉
                  </p>
                  <div className="flex gap-2">
                    <span className="text-lg">❤️</span>
                    <span className="text-lg">🔥</span>
                    <span className="text-lg">🎊</span>
                    <span className="text-xs text-neutral-600 self-center">+3 others</span>
                  </div>
                </div>

                {/* Contribution */}
                <div className="flex items-start gap-3 p-4 bg-neutral-50 rounded-xl">
                  <div className="size-10 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm text-neutral-900">
                      <span className="font-semibold">Sarah M.</span> added <span className="font-semibold text-primary-600">$250</span>
                    </p>
                    <p className="text-xs text-neutral-600 mt-1">2 hours ago</p>
                    <p className="text-sm text-neutral-700 mt-2 italic">"Let's gooo! Can't wait for Bali!"</p>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-lg">🎉</span>
                    <span className="text-lg">💪</span>
                  </div>
                </div>

                {/* Another contribution */}
                <div className="flex items-start gap-3 p-4 bg-neutral-50 rounded-xl">
                  <div className="size-10 rounded-full bg-gradient-to-br from-secondary-400 to-secondary-600 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm text-neutral-900">
                      <span className="font-semibold">Mike J.</span> added <span className="font-semibold text-primary-600">$200</span>
                    </p>
                    <p className="text-xs text-neutral-600 mt-1">5 hours ago</p>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-lg">✨</span>
                  </div>
                </div>

                {/* Comment */}
                <div className="flex items-start gap-3 p-4 bg-primary-50 rounded-xl">
                  <div className="size-10 rounded-full bg-gradient-to-br from-success-400 to-success-600 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm text-neutral-900">
                      <span className="font-semibold">Emma L.</span> commented
                    </p>
                    <p className="text-xs text-neutral-600 mt-1">Yesterday</p>
                    <p className="text-sm text-neutral-700 mt-2 italic">"Only $1,500 to go! We got this! 🚀"</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating reaction bubbles */}
            <div className="absolute -top-4 -right-4 bg-white rounded-full size-16 shadow-lg flex items-center justify-center text-3xl animate-bounce">
              🎉
            </div>
            <div className="absolute top-1/3 -left-4 bg-white rounded-full size-14 shadow-lg flex items-center justify-center text-2xl animate-bounce delay-100">
              ❤️
            </div>
            <div className="absolute -bottom-4 right-1/4 bg-white rounded-full size-12 shadow-lg flex items-center justify-center text-xl animate-bounce delay-200">
              ✨
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
