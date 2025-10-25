import type { Route } from "./+types/wallet.receive";
import { useNavigate } from "react-router";
import { AuthenticatedLayout } from "~/components/layouts/authenticated-layout";
import { Button } from "~/components/ui/button";
import { ArrowLeft } from "lucide-react";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Receive - Wallet - Xersha" },
    {
      name: "description",
      content: "Receive cryptocurrency to your wallet",
    },
  ];
}

export default function WalletReceivePage() {
  const navigate = useNavigate();

  return (
    <AuthenticatedLayout
      notificationCount={3}
      onNotificationClick={() => console.log("Notifications clicked")}
      onProfileClick={() => navigate("/profile")}
      onNewContribution={() => console.log("New contribution clicked")}
    >
      <div className="min-h-screen bg-white">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white border-b border-stone-200 px-4 py-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/wallet")}
              className="p-2 hover:bg-stone-100 rounded-lg transition-colors"
              aria-label="Go back to wallet"
            >
              <ArrowLeft className="size-5 text-stone-600" />
            </button>
            <h1 className="text-lg font-semibold text-stone-900">Receive</h1>
          </div>
        </div>

        {/* Coming Soon Message */}
        <div className="max-w-2xl mx-auto px-4 py-16 text-center">
          <div className="text-6xl mb-6">🚧</div>
          <h2 className="text-2xl font-bold text-stone-900 mb-3">
            Coming Soon
          </h2>
          <p className="text-stone-600 mb-8">
            The receive feature is currently under development. You'll be able to
            generate QR codes and share your wallet address soon!
          </p>
          <Button
            onClick={() => navigate("/wallet")}
            variant="outline"
          >
            Back to Wallet
          </Button>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
