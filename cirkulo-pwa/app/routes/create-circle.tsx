import { useState, useEffect, useMemo, type ChangeEvent, type FocusEvent, type FormEvent, type ReactNode } from "react";
import type { Route } from "./+types/create-circle";
import { useNavigate } from "react-router";
import { XershaLogo } from "app/components/xersha-logo";
import { Button } from "app/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
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
import { lensClient } from "app/lib/lens";
import { xershaFactoryAbi, getXershaFactoryAddress } from "app/lib/abi";
import { encodeFunctionData } from "viem";

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
  savingType?: string;
  contributionSchedule?: string;
  endDate?: string;
}

// Form data interface
interface FormData {
  name: string;
  description: string;
  savingType: "rotating" | "contribution" | "";
  contributionSchedule: "weekly" | "bi-weekly" | "monthly" | "";
  endDate: string;
}

export default function CreateCircle() {
  const navigate = useNavigate();
  const { primaryWallet } = useDynamicContext();
  const { sessionClient } = useAuth();
  const { createGroup, isCreating, error: groupCreationError } = useCreateLensGroup();

  // Form state
  const [formData, setFormData] = useState<FormData>({
    name: "",
    description: "",
    savingType: "",
    contributionSchedule: "",
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

  const validateSavingType = (value: string): string | undefined => {
    if (!value) {
      return "Please select a saving type";
    }
    return undefined;
  };

  const validateContributionSchedule = (value: string): string | undefined => {
    if (!value) {
      return "Please select a contribution schedule";
    }
    return undefined;
  };

  const validateEndDate = (value: string): string | undefined => {
    if (!value) {
      return "End date is required";
    }

    const selectedDate = new Date(value);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const maxDate = new Date(today);
    maxDate.setFullYear(maxDate.getFullYear() + 2);

    if (selectedDate < tomorrow) {
      return "End date must be at least tomorrow";
    }

    if (selectedDate > maxDate) {
      return "End date cannot be more than 2 years from today";
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
      case "savingType":
        return validateSavingType(value);
      case "contributionSchedule":
        return validateContributionSchedule(value);
      case "endDate":
        return validateEndDate(value);
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
    fieldName: "savingType" | "contributionSchedule",
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
      savingType: validateSavingType(formData.savingType),
      contributionSchedule: validateContributionSchedule(
        formData.contributionSchedule
      ),
      endDate: validateEndDate(formData.endDate),
    };

    setErrors(newErrors);
    setTouchedFields(
      new Set(["name", "description", "savingType", "contributionSchedule", "endDate"])
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
        savingType: formData.savingType,
        contributionSchedule: formData.contributionSchedule,
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
      */

      // TEMPORARY: Mock group address for testing XershaFactory
      const result = {
        success: true,
        groupAddress: "0x1234567890123456789012345678901234567890" as `0x${string}`,
      };
      console.log("[CreateCircle] Using mock group address for testing:", result.groupAddress);

      // TEST: Call XershaFactory.createSavingsPool
      try {
        console.log("[CreateCircle] Calling XershaFactory.createSavingsPool...");

        const factoryAddress = getXershaFactoryAddress();
        console.log("[CreateCircle] Factory address:", factoryAddress);

        // Encode the function call data
        const data = encodeFunctionData({
          abi: xershaFactoryAbi,
          functionName: "createSavingsPool",
          args: [result.groupAddress, formData.name.trim()],
        });

        // Send transaction using wallet client
        const txHash = await walletClient.sendTransaction({
          to: factoryAddress,
          data,
          chain: walletClient.chain,
          account: walletClient.account,
        });

        console.log("[CreateCircle] Transaction sent:", txHash);
        console.log("[CreateCircle] Waiting for confirmation...");

        // Wait for transaction receipt
        const receipt = await walletClient.waitForTransactionReceipt({ hash: txHash });

        console.log("[CreateCircle] Transaction confirmed!");
        console.log("[CreateCircle] Block number:", receipt.blockNumber);
        console.log("[CreateCircle] Gas used:", receipt.gasUsed);
        console.log("[CreateCircle] Status:", receipt.status);

        // Look for PoolCreated event in logs
        if (receipt.logs && receipt.logs.length > 0) {
          console.log("[CreateCircle] Event logs:", receipt.logs);
          // The first topic is the event signature, second is circleId, third is poolAddress
          const poolCreatedLog = receipt.logs[0];
          if (poolCreatedLog && poolCreatedLog.topics && poolCreatedLog.topics.length >= 3) {
            // Extract pool address from indexed parameter (topic[2])
            const poolAddress = `0x${poolCreatedLog.topics[2]?.slice(-40)}`;
            console.log("[CreateCircle] Pool created at address:", poolAddress);
          }
        }
      } catch (contractError) {
        console.error("[CreateCircle] XershaFactory call failed:", contractError);
        setErrors((prev) => ({
          ...prev,
          name: contractError instanceof Error ? contractError.message : "Failed to create pool",
        }));
        setIsSubmitting(false);
        return;
      }

      // Show success state
      setIsSuccess(true);

      // Navigate to dashboard after 2 seconds
      setTimeout(() => {
        navigate("/dashboard");
      }, 2000);
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

                {/* Saving Type */}
                <RadioGroupField
                  label="Saving Type"
                  name="savingType"
                  value={formData.savingType}
                  onChange={(value) => handleRadioChange("savingType", value)}
                  error={
                    touchedFields.has("savingType")
                      ? errors.savingType
                      : undefined
                  }
                  required
                  disabled={isSubmitting || isSuccess}
                  options={[
                    {
                      value: "rotating",
                      label: "Rotating",
                      description:
                        "Members take turns receiving the pooled amount",
                      icon: <RefreshCw className="size-5 text-primary-600" />,
                    },
                    {
                      value: "contribution",
                      label: "Contribution",
                      description: "Everyone contributes to a shared goal",
                      icon: <PiggyBank className="size-5 text-primary-600" />,
                    },
                  ]}
                />

                {/* Contribution Schedule */}
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
                  disabled={isSubmitting || isSuccess}
                  options={[
                    {
                      value: "weekly",
                      label: "Weekly",
                      description: "Contributions every week",
                      icon: <Calendar className="size-5 text-primary-600" />,
                    },
                    {
                      value: "bi-weekly",
                      label: "Bi-weekly",
                      description: "Contributions every 2 weeks",
                      icon: <Calendar className="size-5 text-primary-600" />,
                    },
                    {
                      value: "monthly",
                      label: "Monthly",
                      description: "Contributions every month",
                      icon: <Calendar className="size-5 text-primary-600" />,
                    },
                  ]}
                />

                {/* End Date */}
                <FormField
                  label="End Date"
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
                  helperText="When should this circle end?"
                />

                {/* Submit button */}
                <Button
                  type="submit"
                  size="lg"
                  className={cn(
                    "w-full text-base transition-all duration-200",
                    isSuccess &&
                      "bg-success-600 hover:bg-success-600 active:bg-success-600"
                  )}
                  disabled={isSubmitting || isSuccess || !sessionClient}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="size-5 animate-spin" />
                      Creating Group on Lens...
                    </>
                  ) : isSuccess ? (
                    <>
                      <CheckCircle2 className="size-5" />
                      Group Created!
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
  type: "text" | "textarea" | "date";
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
              <div className="font-medium text-neutral-900">{option.label}</div>
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
