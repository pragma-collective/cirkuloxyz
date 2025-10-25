import type { Route } from "./+types/wallet";
import { useNavigate } from "react-router";
import { AuthenticatedLayout } from "~/components/layouts/authenticated-layout";
import { WalletAddressDisplay } from "~/components/wallet/wallet-address-display";
import { AssetBalanceHero } from "~/components/wallet/asset-balance-hero";
import { ActionButtonGrid } from "~/components/wallet/action-button-grid";
import { TransactionList } from "~/components/wallet/transaction-list";
import { useWalletBalances } from "~/hooks/use-wallet-balances";
import { useTransactions } from "~/hooks/use-transactions";
import { useAuth } from "~/context/auth-context";
import { Home, Compass, PlusCircle, Wallet, User } from "lucide-react";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Wallet - Xersha" },
    {
      name: "description",
      content: "Manage your crypto wallet, view balances, and transaction history",
    },
  ];
}

export default function WalletPage() {
  const navigate = useNavigate();
  const { user, login } = useAuth();
  const { balances, isLoading: balancesLoading } = useWalletBalances();
  const { transactions, isLoading: transactionsLoading } = useTransactions(5);

  const walletAddress = user?.walletAddress;
  const isConnected = !!walletAddress;

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
      <div className="min-h-screen bg-white">
        {/* Wallet Address Section */}
        <WalletAddressDisplay
          address={walletAddress || null}
          isConnected={isConnected}
          onConnect={login}
        />

        {/* Asset Balances Hero Section */}
        <AssetBalanceHero balances={balances} isLoading={balancesLoading} />

        {/* Action Buttons */}
        <ActionButtonGrid isConnected={isConnected} />

        {/* Transaction History */}
        <TransactionList
          transactions={transactions}
          isLoading={transactionsLoading}
          hasBalance={balances ? parseFloat(balances.total) > 0 : false}
        />
      </div>
    </AuthenticatedLayout>
  );
}
