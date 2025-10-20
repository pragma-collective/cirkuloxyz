import * as React from "react";
import type { Route } from "./+types/onboarding";
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
import { ProfilePhotoUpload } from "app/components/ui/profile-photo-upload";
import { useAuth } from "app/context/auth-context";
import {
  CheckCircle2,
  Loader2,
  Info,
  AlertCircle,
  User,
  AtSign,
  FileText,
} from "lucide-react";
import { cn } from "app/lib/utils";
import { uploadToLensStorage } from "app/lib/lens-storage";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Complete Your Profile - Xersha" },
    {
      name: "description",
      content: "Create your Xersha profile to start saving with friends",
    },
  ];
}

// Form field validation errors
interface FormErrors {
  name?: string;
  lensUsername?: string;
  bio?: string;
  profilePhoto?: string;
}

// Form data interface
interface FormData {
  name: string;
  lensUsername: string;
  bio: string;
  profilePhoto: File | null;
}

export default function Onboarding() {
  const navigate = useNavigate();
  const { createProfile } = useAuth();

  // Form state
  const [formData, setFormData] = React.useState<FormData>({
    name: "",
    lensUsername: "",
    bio: "",
    profilePhoto: null,
  });

  const [errors, setErrors] = React.useState<FormErrors>({});
  const [touchedFields, setTouchedFields] = React.useState<Set<keyof FormData>>(
    new Set()
  );
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isSuccess, setIsSuccess] = React.useState(false);
  const [showTooltip, setShowTooltip] = React.useState(false);

  // Validation functions
  const validateName = (value: string): string | undefined => {
    if (!value.trim()) {
      return "Name is required";
    }
    if (value.trim().length < 2) {
      return "Name must be at least 2 characters";
    }
    if (!/^[a-zA-Z\s-]+$/.test(value)) {
      return "Name can only contain letters, spaces, and hyphens";
    }
    return undefined;
  };

  const validateLensUsername = (value: string): string | undefined => {
    if (!value.trim()) {
      return "Lens username is required";
    }
    if (value.trim().length < 3) {
      return "Username must be at least 3 characters";
    }
    if (value.trim().length > 26) {
      return "Username must be no more than 26 characters";
    }
    if (!/^[a-z0-9_]+$/.test(value)) {
      return "Username can only contain lowercase letters, numbers, and underscores";
    }
    return undefined;
  };

  const validateBio = (value: string): string | undefined => {
    if (value.length > 280) {
      return "Bio must be no more than 280 characters";
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
      case "lensUsername":
        return validateLensUsername(value);
      case "bio":
        return validateBio(value);
      default:
        return undefined;
    }
  };

  // Handle field change
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
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

  // Handle field blur
  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    const fieldName = name as keyof FormData;

    setTouchedFields((prev) => new Set(prev).add(fieldName));

    const error = validateField(fieldName, value);
    setErrors((prev) => ({
      ...prev,
      [fieldName]: error,
    }));
  };

  // Handle profile photo change
  const handleProfilePhotoChange = (file: File | null) => {
    setFormData((prev) => ({
      ...prev,
      profilePhoto: file,
    }));

    // Clear error if exists
    if (errors.profilePhoto) {
      setErrors((prev) => ({
        ...prev,
        profilePhoto: undefined,
      }));
    }
  };

  // Validate all fields
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {
      name: validateName(formData.name),
      lensUsername: validateLensUsername(formData.lensUsername),
      bio: validateBio(formData.bio),
    };

    setErrors(newErrors);
    setTouchedFields(new Set(["name", "lensUsername", "bio"]));

    // Check if there are any errors
    return !Object.values(newErrors).some((error) => error !== undefined);
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Upload profile photo if provided
      let profilePictureUri: string | undefined;
      if (formData.profilePhoto) {
        try {
          profilePictureUri = await uploadToLensStorage(formData.profilePhoto);
          console.log("[Onboarding] Profile photo uploaded:", profilePictureUri);
        } catch (uploadError) {
          console.error("[Onboarding] Photo upload failed:", uploadError);
          // Photo is optional, so we continue even if upload fails
          setErrors((prev) => ({
            ...prev,
            profilePhoto: "Photo upload failed. Continuing without photo.",
          }));
        }
      }

      // Create profile
      await createProfile({
        name: formData.name.trim(),
        lensUsername: formData.lensUsername.trim(),
        bio: formData.bio.trim() || undefined,
        picture: profilePictureUri,
      });

      // Show success state
      setIsSuccess(true);

      // Navigate to dashboard after 1.5 seconds
      setTimeout(() => {
        navigate("/dashboard");
      }, 1500);
    } catch (error) {
      console.error("Profile creation failed:", error);
      setIsSubmitting(false);
      // In a real app, you'd show an error message here
    }
  };

  // Character count for bio
  const bioCharCount = formData.bio.length;
  const bioMaxChars = 280;

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
        <div className="w-full max-w-md space-y-6">
          {/* Logo */}
          <div className="flex flex-col items-center space-y-2">
            <XershaLogo size="md" />
          </div>

          {/* Onboarding card */}
          <Card className="border-0 shadow-2xl bg-white/90 backdrop-blur-sm">
            <CardHeader className="space-y-2">
              <CardTitle className="text-2xl font-bold text-center text-neutral-900">
                Create Your Profile
              </CardTitle>
              <CardDescription className="text-center text-base text-neutral-600">
                Tell us about yourself to join the community
              </CardDescription>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Profile Photo field */}
                <ProfilePhotoUpload
                  value={formData.profilePhoto}
                  onChange={handleProfilePhotoChange}
                  error={errors.profilePhoto}
                  disabled={isSubmitting || isSuccess}
                />

                {/* Name field */}
                <FormField
                  label="Name"
                  name="name"
                  type="text"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touchedFields.has("name") ? errors.name : undefined}
                  icon={<User className="size-5" />}
                  required
                  disabled={isSubmitting || isSuccess}
                />

                {/* Lens username field */}
                <FormField
                  label="Lens Username"
                  name="lensUsername"
                  type="text"
                  placeholder="yourname"
                  value={formData.lensUsername}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={
                    touchedFields.has("lensUsername")
                      ? errors.lensUsername
                      : undefined
                  }
                  icon={<AtSign className="size-5" />}
                  required
                  disabled={isSubmitting || isSuccess}
                  helperText={
                    <span className="flex items-center gap-1">
                      Your unique identifier on Lens Protocol
                      <button
                        type="button"
                        className="relative inline-flex"
                        onMouseEnter={() => setShowTooltip(true)}
                        onMouseLeave={() => setShowTooltip(false)}
                        onClick={(e) => {
                          e.preventDefault();
                          setShowTooltip(!showTooltip);
                        }}
                      >
                        <Info className="size-3.5 text-info-600 hover:text-info-700 transition-colors" />
                        {showTooltip && (
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-neutral-900 text-white text-xs rounded-lg shadow-xl z-50">
                            <div className="space-y-1">
                              <p className="font-semibold">What is Lens Protocol?</p>
                              <p className="text-neutral-300">
                                Lens is a decentralized social graph that lets you own
                                your social identity and connections across apps.
                              </p>
                            </div>
                            {/* Tooltip arrow */}
                            <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px border-4 border-transparent border-t-neutral-900" />
                          </div>
                        )}
                      </button>
                    </span>
                  }
                />

                {/* Bio field */}
                <FormField
                  label="Bio"
                  name="bio"
                  type="textarea"
                  placeholder="Tell us a bit about yourself... (optional)"
                  value={formData.bio}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touchedFields.has("bio") ? errors.bio : undefined}
                  icon={<FileText className="size-5" />}
                  disabled={isSubmitting || isSuccess}
                  helperText={
                    <span
                      className={cn(
                        "text-xs",
                        bioCharCount > bioMaxChars
                          ? "text-error-600"
                          : "text-neutral-500"
                      )}
                    >
                      {bioCharCount}/{bioMaxChars} characters
                    </span>
                  }
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
                  disabled={isSubmitting || isSuccess}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="size-5 animate-spin" />
                      Minting Profile...
                    </>
                  ) : isSuccess ? (
                    <>
                      <CheckCircle2 className="size-5" />
                      Profile Created!
                    </>
                  ) : (
                    "Mint Profile"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Trust indicator */}
          <div className="flex justify-center">
            <div className="flex items-center gap-2 text-sm text-neutral-600">
              <CheckCircle2 className="size-4 text-success-600" />
              <span>Your profile is stored securely on-chain</span>
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
  type: "text" | "textarea";
  placeholder: string;
  value: string;
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
  onBlur: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  error?: string;
  icon?: React.ReactNode;
  required?: boolean;
  disabled?: boolean;
  helperText?: React.ReactNode;
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
}: FormFieldProps) {
  const hasError = !!error;

  const inputClasses = cn(
    "w-full rounded-lg border-2 bg-white px-4 text-neutral-900 placeholder:text-neutral-400 transition-all duration-200 outline-none",
    "focus:ring-[3px]",
    hasError
      ? "border-error-500 focus:border-error-500 focus:ring-error-500/20"
      : "border-neutral-300 focus:border-primary-500 focus:ring-primary-500/30",
    disabled && "opacity-60 cursor-not-allowed",
    type === "textarea" ? "py-3 min-h-[100px] resize-none" : "h-12"
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
            className={cn(inputClasses, icon && "pl-12")}
            aria-invalid={hasError}
            aria-describedby={
              error ? `${name}-error` : helperText ? `${name}-helper` : undefined
            }
          />
        )}

        {/* Error icon */}
        {hasError && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-error-500">
            <AlertCircle className="size-5" />
          </div>
        )}
      </div>

      {/* Error message */}
      {error && (
        <p id={`${name}-error`} className="text-sm text-error-600 flex items-center gap-1.5">
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
