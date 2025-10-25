import { ArrowUp, ArrowDown, Plus } from "lucide-react";
import { useNavigate } from "react-router";
import { ActionButton } from "./action-button";
import { cn } from "~/lib/utils";

export interface ActionButtonGridProps {
  isConnected: boolean;
  className?: string;
}

export function ActionButtonGrid({
  isConnected,
  className,
}: ActionButtonGridProps) {
  const navigate = useNavigate();

  const handleSend = () => {
    if (!isConnected) {
      alert("Please connect your wallet first");
      return;
    }
    navigate("/wallet/send");
  };

  const handleReceive = () => {
    if (!isConnected) {
      alert("Please connect your wallet first");
      return;
    }
    navigate("/wallet/receive");
  };

  const handleOnRamp = () => {
    navigate("/wallet/on-ramp");
  };

  return (
    <div
      className={cn(
        "px-4 py-6 bg-white border-b border-stone-200",
        className
      )}
    >
      <div className="grid grid-cols-3 gap-3">
        <ActionButton
          icon={ArrowUp}
          label="Send"
          onClick={handleSend}
          disabled={!isConnected}
          iconColor="text-orange-600"
        />
        <ActionButton
          icon={ArrowDown}
          label="Receive"
          onClick={handleReceive}
          disabled={!isConnected}
          iconColor="text-purple-600"
        />
        <ActionButton
          icon={Plus}
          label="On-ramp"
          onClick={handleOnRamp}
          iconColor="text-green-600"
        />
      </div>
    </div>
  );
}
