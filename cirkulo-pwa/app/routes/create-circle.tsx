import { useState, useEffect, useMemo, type ChangeEvent, type FocusEvent, type FormEvent, type ReactNode } from "react";
import type { Route } from "./+types/create-circle";
import { useNavigate } from "react-router";
import { XershaLogo } from "app/components/xersha-logo";
import { Button } from "app/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "app/components/ui/card";
import {
  CheckCircle2,
  Loader2,
  AlertCircle,
  Users,
  Target,
  RefreshCw,
  PiggyBank,
  Calendar,
  CalendarDays,
  ArrowLeft,
} from "lucide-react";
import { cn } from "app/lib/utils";
import { useDynamicContext } from "@dynamic-labs/sdk-react-core";
import { useAuth } from "app/context/auth-context";
import { useCreateLensGroup } from "app/hooks/create-lens-group";
import { useSaveCircle } from "~/hooks/use-save-circle";
import { xershaFactoryAbi, getXershaFactoryAddress } from "app/lib/abi";
import { parseEther, decodeEventLog } from "viem";
import { citreaTestnet } from "app/lib/wagmi";
import { useWriteContract, useWaitForTransactionReceipt, useSwitchChain } from "wagmi";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Create Circle - Xersha" },
    {
      name: "description",
      content: "Create a new savings circle with your friends",
    },
  ];
}

// Form field validation errors
interface FormErrors {
  name?: string;
  description?: string;
  circleType?: string;
  contributionSchedule?: string;
  contributionAmount?: string;
  goalAmount?: string;
  endDate?: string;
}

// Form data interface
interface FormData {
  name: string;
  description: string;
  circleType: "contribution" | "rotating" | "fundraising" | "";
  contributionSchedule: "weekly" | "biweekly" | "monthly" | "";
  contributionAmount: string;
  goalAmount: string;
  endDate: string;
}

export default function CreateCircle() {
  const navigate = useNavigate();
  const { primaryWallet } = useDynamicContext();
  const { sessionClient } = useAuth();
  const { createGroup, isCreating, error: groupCreationError } = useCreateLensGroup();
  const saveCircleMutation = useSaveCircle();

  // Wagmi hooks for contract interaction
  const { writeContractAsync } = useWriteContract();
  const { switchChainAsync } = useSwitchChain();
  const [poolDeploymentTxHash, setPoolDeploymentTxHash] = useState<`0x${string}` | undefined>();
  const { data: txReceipt, isLoading: isWaitingForTx } = useWaitForTransactionReceipt({
    hash: poolDeploymentTxHash,
  });

  // Store lens group address for later use in API call
  const [lensGroupAddress, setLensGroupAddress] = useState<string | undefined>();

  // Form state
  const [formData, setFormData] = useState<FormData>({
    name: "",
    description: "",
    circleType: "",
    contributionSchedule: "monthly", // Default to monthly
    contributionAmount: "",
    goalAmount: "",
    endDate: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [touchedFields, setTouchedFields] = useState<Set<keyof FormData>>(
    new Set()
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Validation functions
  const validateName = (value: string): string | undefined => {
    if (!value.trim()) {
      return "Circle name is required";
    }
    if (value.trim().length < 3) {
      return "Circle name must be at least 3 characters";
    }
    if (value.trim().length > 50) {
      return "Circle name must be no more than 50 characters";
    }
    return undefined;
  };

  const validateDescription = (value: string): string | undefined => {
    if (!value.trim()) {
      return "Description is required";
    }
    if (value.trim().length < 10) {
      return "Description must be at least 10 characters";
    }
    if (value.trim().length > 200) {
      return "Description must be no more than 200 characters";
    }
    return undefined;
  };

  const validateCircleType = (value: string): string | undefined => {
    if (!value) {
      return "Please select a circle type";
    }
    return undefined;
  };

  const validateContributionSchedule = (value: string): string | undefined => {
    // Always valid for now (default to monthly)
    return undefined;
  };

  const validateContributionAmount = (value: string, circleType: string): string | undefined => {
    // Only required for rotating circles
    if (circleType !== "rotating") return undefined;

    if (!value || value.trim() === "") {
      return "Contribution amount is required for rotating circles";
    }

    const amount = parseFloat(value);
    if (isNaN(amount) || amount <= 0) {
      return "Contribution amount must be greater than 0";
    }

    return undefined;
  };

  const validateGoalAmount = (value: string, circleType: string): string | undefined => {
    // Only required for fundraising circles
    if (circleType !== "fundraising") return undefined;

    if (!value || value.trim() === "") {
      return "Fundraising goal is required";
    }

    const amount = parseFloat(value);
    if (isNaN(amount) || amount <= 0) {
      return "Goal amount must be greater than 0";
    }

    return undefined;
  };

  const validateEndDate = (value: string, circleType: string): string | undefined => {
    // Only required for fundraising circles
    if (circleType !== "fundraising") return undefined;

    if (!value) {
      return "Deadline is required for fundraising circles";
    }

    const selectedDate = new Date(value);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const maxDate = new Date(today);
    maxDate.setFullYear(maxDate.getFullYear() + 2);

    if (selectedDate < tomorrow) {
      return "Deadline must be at least tomorrow";
    }

    if (selectedDate > maxDate) {
      return "Deadline cannot be more than 2 years from today";
    }

    return undefined;
  };

  // Validate single field
  const validateField = (
    fieldName: keyof FormData,
    value: string
  ): string | undefined => {
    switch (fieldName) {
      case "name":
        return validateName(value);
      case "description":
        return validateDescription(value);
      case "circleType":
        return validateCircleType(value);
      case "contributionSchedule":
        return validateContributionSchedule(value);
      case "contributionAmount":
        return validateContributionAmount(value, formData.circleType);
      case "goalAmount":
        return validateGoalAmount(value, formData.circleType);
      case "endDate":
        return validateEndDate(value, formData.circleType);
      default:
        return undefined;
    }
  };

  // Handle input field change
  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    const fieldName = name as keyof FormData;

    setFormData((prev) => ({
      ...prev,
      [fieldName]: value,
    }));

    // Clear error for this field if it exists
    if (errors[fieldName]) {
      setErrors((prev) => ({
        ...prev,
        [fieldName]: undefined,
      }));
    }
  };

  // Handle radio button change
  const handleRadioChange = (
    fieldName: "circleType" | "contributionSchedule",
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      [fieldName]: value,
    }));

    // Clear error for this field if it exists
    if (errors[fieldName]) {
      setErrors((prev) => ({
        ...prev,
        [fieldName]: undefined,
      }));
    }

    // Mark field as touched
    setTouchedFields((prev) => new Set(prev).add(fieldName));
  };

  // Handle field blur
  const handleBlur = (
    e: FocusEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    const fieldName = name as keyof FormData;

    setTouchedFields((prev) => new Set(prev).add(fieldName));

    const error = validateField(fieldName, value);
    setErrors((prev) => ({
      ...prev,
      [fieldName]: error,
    }));
  };

  // Validate all fields
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {
      name: validateName(formData.name),
      description: validateDescription(formData.description),
      circleType: validateCircleType(formData.circleType),
      contributionSchedule: validateContributionSchedule(formData.contributionSchedule),
      contributionAmount: validateContributionAmount(formData.contributionAmount, formData.circleType),
      goalAmount: validateGoalAmount(formData.goalAmount, formData.circleType),
      endDate: validateEndDate(formData.endDate, formData.circleType),
    };

    setErrors(newErrors);
    setTouchedFields(
      new Set(["name", "description", "circleType", "contributionSchedule", "contributionAmount", "goalAmount", "endDate"])
    );

    // Check if there are any errors
    return !Object.values(newErrors).some((error) => error !== undefined);
  };

  // Handle form submission
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    // Validate form
    if (!validateForm()) {
      return;
    }

    // Check if we have a session client and wallet
    if (!sessionClient) {
      setErrors((prev) => ({
        ...prev,
        name: "Authentication required. Please refresh the page.",
      }));
      return;
    }

    if (!primaryWallet) {
      setErrors((prev) => ({
        ...prev,
        name: "Wallet not connected. Please connect your wallet.",
      }));
      return;
    }

    setIsSubmitting(true);

    try {
      console.log("[CreateCircle] Creating Lens group with data:", {
        name: formData.name.trim(),
        description: formData.description.trim(),
        circleType: formData.circleType,
        contributionSchedule: formData.contributionSchedule,
        contributionAmount: formData.contributionAmount,
        goalAmount: formData.goalAmount,
        endDate: formData.endDate,
      });

      // Get wallet client for transaction signing
      // @ts-expect-error - getWalletClient exists at runtime but not in type definition
      const walletClient = await primaryWallet.getWalletClient();

      // Debug wallet address format and try alternative methods
      console.log("[CreateCircle] Full wallet debug:", {
        address: primaryWallet.address,
        walletConnector: primaryWallet.connector?.name,
        walletType: primaryWallet.connector?.key,
      });

      // Try to get address from wallet client if direct address fails
      let walletAddress = primaryWallet.address;
      
      if (!walletAddress || walletAddress.length !== 42) {
        // Try to get address from wallet client
        try {
          // @ts-expect-error - getWalletClient exists at runtime but not in type definition
          const client = await primaryWallet.getWalletClient();
          if (client?.account?.address) {
            walletAddress = client.account.address;
            console.log("[CreateCircle] Using address from wallet client:", walletAddress);
          }
        } catch (error) {
          console.error("[CreateCircle] Error getting address from wallet client:", error);
        }
      }

      // Validate wallet address format
      if (!walletAddress || walletAddress.length !== 42 || !walletAddress.startsWith('0x')) {
        console.error("[CreateCircle] Invalid wallet address:", walletAddress);
        setErrors((prev) => ({
          ...prev,
          name: "Invalid wallet address. Please reconnect your wallet.",
        }));
        setIsSubmitting(false);
        return;
      }

      // Create Lens group
      const result = await createGroup({
        name: formData.name.trim(),
        description: formData.description.trim(),
        ownerAddress: walletAddress,
        sessionClient,
        walletClient,
      });

      if (!result.success) {
        setErrors((prev) => ({
          ...prev,
          name: result.error || "Failed to create group",
        }));
        setIsSubmitting(false);
        return;
      }

      console.log("[CreateCircle] Group created successfully:", {
        transactionHash: result.transactionHash,
        groupAddress: result.groupAddress,
      });

      if (!result.groupAddress) return;

      // Store lens group address for later use in API call
      setLensGroupAddress(result.groupAddress);

      // Call XershaFactory to create pool based on circle type
      try {
        const factoryAddress = getXershaFactoryAddress();
        console.log("[CreateCircle] Factory address:", factoryAddress);
        console.log("[CreateCircle] Circle type:", formData.circleType);

        // Switch to Citrea network using wagmi
        // NOTE: DONT REMOVE YET FOR FURTHER TESTING (jhuds)
        console.log("[CreateCircle] Switching to Citrea Testnet using wagmi...");
        await switchChainAsync({ chainId: citreaTestnet.id });
        console.log("[CreateCircle] Chain switched to Citrea");

        let txHash;

        // Determine which contract function to call based on circle type
        if (formData.circleType === "contribution") {
          console.log("[CreateCircle] Creating Savings Pool...");
          txHash = await writeContractAsync({
            address: factoryAddress,
            abi: xershaFactoryAbi,
            functionName: "createSavingsPool",
            args: [result.groupAddress, formData.name.trim()],
            chain: citreaTestnet,
            chainId: citreaTestnet.id,
          });
        }

        else if (formData.circleType === "rotating") {
          // Convert USD to wei (assuming mock USD token with 18 decimals)
          const contributionInWei = parseEther(formData.contributionAmount);
          console.log("[CreateCircle] Creating ROSCA Pool with contribution:", formData.contributionAmount, "USD");

          txHash = await writeContractAsync({
            address: factoryAddress,
            abi: xershaFactoryAbi,
            functionName: "createROSCA",
            args: [result.groupAddress, formData.name.trim(), contributionInWei],
            chain: citreaTestnet,
            chainId: citreaTestnet.id,
          });
        }

        else if (formData.circleType === "fundraising") {
          // Convert USD to wei
          const goalInWei = parseEther(formData.goalAmount);

          // Convert endDate to unix timestamp (as bigint)
          const deadline = BigInt(Math.floor(new Date(formData.endDate).getTime() / 1000));

          console.log("[CreateCircle] Creating Donation Pool with goal:", formData.goalAmount, "USD, deadline:", formData.endDate);

          // Beneficiary is the circle creator (primaryWallet.address)
          txHash = await writeContractAsync({
            address: factoryAddress,
            abi: xershaFactoryAbi,
            functionName: "createDonationPool",
            args: [
              result.groupAddress,
              formData.name.trim(),
              primaryWallet.address as `0x${string}`, // beneficiary
              goalInWei,
              deadline
            ],
            chain: citreaTestnet,
            chainId: citreaTestnet.id,
          });
        }

        console.log("[CreateCircle] Transaction sent:", txHash);
        console.log("[CreateCircle] Pool creation transaction submitted successfully");

        // Store transaction hash to trigger receipt watching
        setPoolDeploymentTxHash(txHash);
        // Note: We'll wait for the receipt in the useEffect below
        // Do NOT set isSuccess here - wait for pool address from receipt

      } catch (contractError) {
        console.error("[CreateCircle] XershaFactory call failed:", contractError);
        setErrors((prev) => ({
          ...prev,
          name: contractError instanceof Error ? contractError.message : "Failed to create pool",
        }));
        setIsSubmitting(false);
        return;
      }

      // Note: Success state will be set after receiving pool address from transaction receipt
      // Navigation will happen in useEffect after pool address is retrieved

    } catch (error) {
      console.error("[CreateCircle] Group creation failed:", error);
      setErrors((prev) => ({
        ...prev,
        name: error instanceof Error ? error.message : "Failed to create group",
      }));
      setIsSubmitting(false);
    }
  };

  // Character count for description
  const descriptionCharCount = formData.description.length;
  const descriptionMaxChars = 200;

  // Get minimum and maximum dates for date picker
  const minDate = useMemo(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split("T")[0];
  }, []);

  const maxDate = useMemo(() => {
    const twoYearsFromNow = new Date();
    twoYearsFromNow.setFullYear(twoYearsFromNow.getFullYear() + 2);
    return twoYearsFromNow.toISOString().split("T")[0];
  }, []);

  // Handle transaction receipt and extract pool address
  useEffect(() => {
    if (txReceipt && poolDeploymentTxHash && lensGroupAddress) {
      console.log("[CreateCircle] Transaction confirmed! Receipt:", txReceipt);

      // Extract pool address from PoolCreated event in logs
      const processReceipt = async () => {
        try {
          const poolCreatedLog = txReceipt.logs.find((log) => {
            try {
              const decoded = decodeEventLog({
                abi: xershaFactoryAbi,
                data: log.data,
                topics: log.topics,
              });
              return decoded.eventName === "PoolCreated";
            } catch {
              return false;
            }
          });

          if (poolCreatedLog) {
            const decoded = decodeEventLog({
              abi: xershaFactoryAbi,
              data: poolCreatedLog.data,
              topics: poolCreatedLog.topics,
            });

            if (decoded.eventName === "PoolCreated") {
              const poolAddress = decoded.args.poolAddress;
              console.log("[CreateCircle] Pool deployed at:", poolAddress);

              // Save circle to database before setting success
              console.log("[CreateCircle] Saving circle to database...");

              try {
                await saveCircleMutation.mutateAsync({
                  circleName: formData.name.trim(),
                  poolAddress: poolAddress as string,
                  lensGroupAddress,
                  poolDeploymentTxHash,
                  circleType: formData.circleType as "contribution" | "rotating" | "fundraising",
                });

                console.log("[CreateCircle] Circle saved to database successfully");
              } catch (saveError) {
                console.error("[CreateCircle] Failed to save circle to database:", saveError);
                setErrors((prev) => ({
                  ...prev,
                  name: saveError instanceof Error
                    ? `Circle created but failed to save configuration: ${saveError.message}`
                    : "Circle created but failed to save configuration",
                }));
                setIsSubmitting(false);
                return;
              }

              // Now we can set success and navigate to circle detail
              setIsSuccess(true);

              // Navigate to circle detail page after 2 seconds
              setTimeout(() => {
                navigate(`/circle/${lensGroupAddress}`);
              }, 2000);
            }
          } else {
            console.error("[CreateCircle] PoolCreated event not found in transaction logs");
            setErrors((prev) => ({
              ...prev,
              name: "Pool created but couldn't extract pool address from transaction",
            }));
            setIsSubmitting(false);
          }
        } catch (error) {
          console.error("[CreateCircle] Failed to process pool deployment:", error);
          setErrors((prev) => ({
            ...prev,
            name: error instanceof Error ? error.message : "Failed to process pool deployment",
          }));
          setIsSubmitting(false);
        }
      };

      processReceipt();
    }
  }, [txReceipt, poolDeploymentTxHash, lensGroupAddress, navigate, sessionClient, formData]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 relative overflow-hidden">
      {/* Decorative background blobs */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -left-20 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/3 -right-32 w-[500px] h-[500px] bg-secondary-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 left-1/4 w-96 h-96 bg-primary-400/10 rounded-full blur-3xl" />
      </div>

      {/* Main content */}
      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-2xl space-y-6">
          {/* Logo */}
          <div className="flex flex-col items-center space-y-2">
            <XershaLogo size="md" />
          </div>

          {/* Back button */}
          <div className="flex justify-start">
            <Button
              variant="ghost"
              onClick={() => navigate("/dashboard")}
              disabled={isSubmitting || isSuccess}
              className="text-neutral-700 hover:text-neutral-900"
            >
              <ArrowLeft className="size-5 mr-2" />
              Back to Dashboard
            </Button>
          </div>

          {/* Create Circle card */}
          <Card className="border-0 shadow-2xl bg-white/90 backdrop-blur-sm">
            <CardHeader className="space-y-2">
              <CardTitle className="text-2xl font-bold text-center text-neutral-900">
                Create a New Circle
              </CardTitle>
              <CardDescription className="text-center text-base text-neutral-600">
                Start saving together with friends towards a shared goal
              </CardDescription>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Circle Name */}
                <FormField
                  label="Circle Name"
                  name="name"
                  type="text"
                  placeholder="e.g., Summer Vacation Fund"
                  value={formData.name}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touchedFields.has("name") ? errors.name : undefined}
                  icon={<Users className="size-5" />}
                  required
                  disabled={isSubmitting || isSuccess}
                />

                {/* Description */}
                <FormField
                  label="Description"
                  name="description"
                  type="textarea"
                  placeholder="What are you saving for?"
                  value={formData.description}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={
                    touchedFields.has("description")
                      ? errors.description
                      : undefined
                  }
                  icon={<Target className="size-5" />}
                  required
                  disabled={isSubmitting || isSuccess}
                  helperText={
                    <span
                      className={cn(
                        "text-xs",
                        descriptionCharCount > descriptionMaxChars
                          ? "text-error-600"
                          : "text-neutral-500"
                      )}
                    >
                      {descriptionCharCount}/{descriptionMaxChars} characters
                    </span>
                  }
                />

                {/* Circle Type */}
                <RadioGroupField
                  label="Circle Type"
                  name="circleType"
                  value={formData.circleType}
                  onChange={(value) => handleRadioChange("circleType", value)}
                  error={
                    touchedFields.has("circleType")
                      ? errors.circleType
                      : undefined
                  }
                  required
                  disabled={isSubmitting || isSuccess}
                  options={[
                    {
                      value: "contribution",
                      label: "Contribution",
                      description: "Everyone contributes to a shared savings goal",
                      icon: <PiggyBank className="size-5 text-primary-600" />,
                      badge: { text: "Private", variant: "private" },
                    },
                    {
                      value: "rotating",
                      label: "Rotating",
                      description: "Members take turns receiving the pooled amount (30-day cycles)",
                      icon: <RefreshCw className="size-5 text-primary-600" />,
                      badge: { text: "Private", variant: "private" },
                    },
                    {
                      value: "fundraising",
                      label: "Fundraising",
                      description: "Public fundraiser with a goal and deadline",
                      icon: <Target className="size-5 text-primary-600" />,
                      badge: { text: "Public", variant: "public" },
                    },
                  ]}
                />

                {/* Contribution Amount - Only for rotating circles */}
                {formData.circleType === "rotating" && (
                  <FormField
                    label="Contribution Amount"
                    name="contributionAmount"
                    type="number"
                    placeholder="e.g., 100"
                    value={formData.contributionAmount}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={
                      touchedFields.has("contributionAmount")
                        ? errors.contributionAmount
                        : undefined
                    }
                    icon={<PiggyBank className="size-5" />}
                    required
                    disabled={isSubmitting || isSuccess}
                    helperText="Amount each member contributes per 30-day cycle (in USD)"
                  />
                )}

                {/* Goal Amount - Only for fundraising circles */}
                {formData.circleType === "fundraising" && (
                  <FormField
                    label="Fundraising Goal"
                    name="goalAmount"
                    type="number"
                    placeholder="e.g., 5000"
                    value={formData.goalAmount}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={
                      touchedFields.has("goalAmount")
                        ? errors.goalAmount
                        : undefined
                    }
                    icon={<Target className="size-5" />}
                    required
                    disabled={isSubmitting || isSuccess}
                    helperText="Target amount to raise (in USD)"
                  />
                )}

                {/* Contribution Schedule - Only for rotating circles */}
                {formData.circleType === "rotating" && (
                  <RadioGroupField
                    label="Contribution Schedule"
                    name="contributionSchedule"
                    value={formData.contributionSchedule}
                    onChange={(value) =>
                      handleRadioChange("contributionSchedule", value)
                    }
                    error={
                      touchedFields.has("contributionSchedule")
                        ? errors.contributionSchedule
                        : undefined
                    }
                    required
                    disabled={true} // Disabled for now - contract uses fixed 30-day cycles
                    options={[
                      {
                        value: "weekly",
                        label: "Weekly",
                        description: "Contribute every week (for future use)",
                        icon: <Calendar className="size-5 text-neutral-400" />,
                      },
                      {
                        value: "biweekly",
                        label: "Bi-weekly",
                        description: "Contribute every 2 weeks (for future use)",
                        icon: <CalendarDays className="size-5 text-neutral-400" />,
                      },
                      {
                        value: "monthly",
                        label: "Monthly",
                        description: "Currently fixed at 30-day cycles (default)",
                        icon: <Calendar className="size-5 text-primary-600" />,
                      },
                    ]}
                  />
                )}

                {/* Deadline - Only for fundraising circles */}
                {formData.circleType === "fundraising" && (
                  <FormField
                    label="Deadline"
                    name="endDate"
                    type="date"
                    placeholder=""
                    value={formData.endDate}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touchedFields.has("endDate") ? errors.endDate : undefined}
                    icon={<CalendarDays className="size-5" />}
                    required
                    disabled={isSubmitting || isSuccess}
                    min={minDate}
                    max={maxDate}
                    helperText="When should fundraising end?"
                  />
                )}

                {/* Submit button */}
                <Button
                  type="submit"
                  size="lg"
                  className={cn(
                    "w-full text-base transition-all duration-200",
                    isSuccess &&
                      "bg-success-600 hover:bg-success-600 active:bg-success-600"
                  )}
                  disabled={isSubmitting || isSuccess || isWaitingForTx || !sessionClient}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="size-5 animate-spin" />
                      {isWaitingForTx ? "Deploying pool contract..." : "Creating Group on Lens..."}
                    </>
                  ) : isSuccess ? (
                    <>
                      <CheckCircle2 className="size-5" />
                      Circle Created!
                    </>
                  ) : !sessionClient ? (
                    "Waiting for authentication..."
                  ) : (
                    "Create Circle"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Trust indicator */}
          <div className="flex justify-center">
            <div className="flex items-center gap-2 text-sm text-neutral-600">
              <CheckCircle2 className="size-4 text-success-600" />
              <span>Powered by Bitcoin for transparent savings</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Form Field Component
interface FormFieldProps {
  label: string;
  name: string;
  type: "text" | "textarea" | "date" | "number";
  placeholder: string;
  value: string;
  onChange: (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
  onBlur: (e: FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  error?: string;
  icon?: ReactNode;
  required?: boolean;
  disabled?: boolean;
  helperText?: ReactNode;
  min?: string;
  max?: string;
  step?: string;
}

function FormField({
  label,
  name,
  type,
  placeholder,
  value,
  onChange,
  onBlur,
  error,
  icon,
  required = false,
  disabled = false,
  helperText,
  min,
  max,
  step,
}: FormFieldProps) {
  const hasError = !!error;

  const inputClasses = cn(
    "w-full rounded-lg border-2 bg-white px-4 text-neutral-900 placeholder:text-neutral-400 transition-all duration-200 outline-none",
    "focus:ring-[3px]",
    hasError
      ? "border-error-500 focus:border-error-500 focus:ring-error-500/20"
      : "border-neutral-300 focus:border-primary-500 focus:ring-primary-500/30",
    disabled && "opacity-60 cursor-not-allowed",
    type === "textarea" ? "py-3 min-h-[100px] resize-none" : "h-12",
    type === "date" && "cursor-pointer"
  );

  return (
    <div className="space-y-2">
      {/* Label */}
      <label htmlFor={name} className="block text-sm font-medium text-neutral-700">
        {label}
        {required && <span className="text-error-500 ml-1">*</span>}
      </label>

      {/* Input wrapper with icon */}
      <div className="relative">
        {icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none">
            {icon}
          </div>
        )}

        {type === "textarea" ? (
          <textarea
            id={name}
            name={name}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            onBlur={onBlur}
            disabled={disabled}
            className={cn(inputClasses, icon && "pl-12")}
            aria-invalid={hasError}
            aria-describedby={
              error ? `${name}-error` : helperText ? `${name}-helper` : undefined
            }
          />
        ) : (
          <input
            type={type}
            id={name}
            name={name}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            onBlur={onBlur}
            disabled={disabled}
            min={min}
            max={max}
            step={step}
            className={cn(inputClasses, icon && "pl-12")}
            aria-invalid={hasError}
            aria-describedby={
              error ? `${name}-error` : helperText ? `${name}-helper` : undefined
            }
          />
        )}

        {/* Error icon */}
        {hasError && type !== "date" && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-error-500">
            <AlertCircle className="size-5" />
          </div>
        )}
      </div>

      {/* Error message */}
      {error && (
        <p
          id={`${name}-error`}
          className="text-sm text-error-600 flex items-center gap-1.5"
        >
          <AlertCircle className="size-4 shrink-0" />
          {error}
        </p>
      )}

      {/* Helper text */}
      {!error && helperText && (
        <p id={`${name}-helper`} className="text-xs text-neutral-500">
          {helperText}
        </p>
      )}
    </div>
  );
}

// Radio Group Field Component
interface RadioOption {
  value: string;
  label: string;
  description: string;
  icon?: ReactNode;
  badge?: {
    text: string;
    variant: "private" | "public";
  };
}

interface RadioGroupFieldProps {
  label: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  options: RadioOption[];
}

function RadioGroupField({
  label,
  name,
  value,
  onChange,
  error,
  required = false,
  disabled = false,
  options,
}: RadioGroupFieldProps) {
  const hasError = !!error;

  return (
    <div className="space-y-3">
      {/* Label */}
      <label className="block text-sm font-medium text-neutral-700">
        {label}
        {required && <span className="text-error-500 ml-1">*</span>}
      </label>

      {/* Radio options */}
      <div className="space-y-3">
        {options.map((option) => (
          <label
            key={option.value}
            className={cn(
              "flex items-start gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all duration-200",
              value === option.value
                ? "border-primary-500 bg-primary-50/50 ring-[3px] ring-primary-500/30"
                : hasError
                ? "border-error-300 hover:border-error-400"
                : "border-neutral-300 hover:border-neutral-400",
              disabled && "opacity-60 cursor-not-allowed"
            )}
          >
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={value === option.value}
              onChange={(e) => onChange(e.target.value)}
              disabled={disabled}
              className="mt-0.5 size-4 text-primary-600 border-neutral-300 focus:ring-2 focus:ring-primary-500 focus:ring-offset-0 cursor-pointer disabled:cursor-not-allowed"
              aria-invalid={hasError}
              aria-describedby={error ? `${name}-error` : undefined}
            />
            {option.icon && (
              <div className="mt-0.5 shrink-0">
                {option.icon}
              </div>
            )}
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <div className="font-medium text-neutral-900">{option.label}</div>
                {option.badge && (
                  <span
                    className={cn(
                      "px-2 py-0.5 text-xs font-medium rounded-full",
                      option.badge.variant === "public"
                        ? "bg-success-100 text-success-700"
                        : "bg-neutral-100 text-neutral-700"
                    )}
                  >
                    {option.badge.text}
                  </span>
                )}
              </div>
              <div className="text-sm text-neutral-600 mt-0.5">
                {option.description}
              </div>
            </div>
          </label>
        ))}
      </div>

      {/* Error message */}
      {error && (
        <p
          id={`${name}-error`}
          className="text-sm text-error-600 flex items-center gap-1.5"
        >
          <AlertCircle className="size-4 shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
}
