import type { Route } from "./+types/wallet.transactions";
import { useNavigate } from "react-router";
import { AuthenticatedLayout } from "~/components/layouts/authenticated-layout";
import { TransactionList } from "~/components/wallet/transaction-list";
import { useTransactions } from "~/hooks/use-transactions";
import { useAuth } from "~/context/auth-context";
import { useWalletBalances } from "~/hooks/use-wallet-balances";
import { Home, Compass, PlusCircle, Wallet, User, ArrowLeft } from "lucide-react";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Transaction History - Xersha" },
    {
      name: "description",
      content: "View your complete transaction history",
    },
  ];
}

export default function WalletTransactionsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { balances } = useWalletBalances();
  const { transactions, isLoading } = useTransactions(); // No limit - fetch all

  const walletAddress = user?.walletAddress;

  return (
    <AuthenticatedLayout
      notificationCount={3}
      onNotificationClick={() => console.log("Notifications clicked")}
      onProfileClick={() => navigate("/profile")}
      onNewContribution={() => console.log("New contribution clicked")}
      navItems={[
        {
          icon: <Home className="size-6" />,
          label: "Home",
          to: "/dashboard",
        },
        {
          icon: <Compass className="size-6" />,
          label: "Explore",
          to: "/explore",
        },
        {
          icon: <PlusCircle className="size-6" />,
          label: "Add",
          onClick: () => navigate("/create-circle"),
        },
        {
          icon: <Wallet className="size-6" />,
          label: "Wallet",
          active: true,
          to: "/wallet",
        },
        {
          icon: <User className="size-6" />,
          label: "Profile",
          to: "/profile",
        },
      ]}
    >
      <div className="min-h-screen bg-stone-50">
        {/* Header with back navigation */}
        <div className="bg-white border-b border-stone-200">
          <div className="px-4 py-4 flex items-center gap-3">
            <button
              onClick={() => navigate("/wallet")}
              className="p-2 -ml-2 hover:bg-stone-100 rounded-full transition-colors"
              aria-label="Back to wallet"
            >
              <ArrowLeft className="size-5 text-stone-700" />
            </button>
            <div>
              <h1 className="text-xl font-semibold text-stone-900">
                Transaction History
              </h1>
              {walletAddress && (
                <p className="text-sm text-stone-600">
                  {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Full Transaction List */}
        <div className="mt-4">
          <TransactionList
            transactions={transactions}
            isLoading={isLoading}
            hasBalance={balances ? parseFloat(balances.total) > 0 : false}
            showViewAll={false}
            className="rounded-2xl overflow-hidden mx-4"
          />
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
