import type { Route } from "./+types/login";
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
import { useAuth } from "app/context/auth-context";
import { Wallet, TrendingUp, Shield, Loader2, Users } from "lucide-react";

export function meta({}: Route.MetaArgs) {
	return [
		{ title: "Login - Xersha" },
		{
			name: "description",
			content: "Save money together with your friends on Xersha",
		},
	];
}

export default function Login() {
	const navigate = useNavigate();
	const { login, isLoading } = useAuth();

	const handleSignIn = async () => {
		try {
			// Await authentication completion
			const user = await login();

			// Navigate based on Lens account status
			//if (!user.hasLensAccount) {
			//	// User has Dynamic wallet but no Lens account → onboarding
			//	navigate("/onboarding");
			//} else {
			//	// User has both Dynamic wallet and Lens account → dashboard
			//	navigate("/dashboard");
			//}
		} catch (error) {
			console.error("Sign in failed:", error);
		}
	};

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
				<div className="w-full max-w-md space-y-8">
					{/* Logo and branding */}
					<div className="flex flex-col items-center space-y-2">
						<XershaLogo size="lg" />
					</div>

					{/* Login card */}
					<Card className="border-0 shadow-2xl bg-white/90 backdrop-blur-sm">
						<CardHeader className="space-y-2">
							<CardTitle className="text-2xl font-bold text-center text-neutral-900">
								Welcome to Xersha
							</CardTitle>
							<CardDescription className="text-center text-base text-neutral-600">
								Transform saving into a shared adventure
							</CardDescription>
						</CardHeader>

						<CardContent className="space-y-6">
							{/* Value propositions */}
							<div className="space-y-3">
								<ValueProp
									icon={<Users className="size-5" />}
									text="Save with your trusted circle"
								/>
								<ValueProp
									icon={<TrendingUp className="size-5" />}
									text="Earn yields on your savings"
								/>
								<ValueProp
									icon={<Shield className="size-5" />}
									text="Secured by smart contracts"
								/>
							</div>

							{/* Login button */}
							<div className="pt-4">
								<Button
									size="lg"
									className="w-full text-base"
									onClick={handleSignIn}
									disabled={isLoading}
								>
									{isLoading ? (
										<>
											<Loader2 className="size-5 animate-spin" />
											Signing in...
										</>
									) : (
										<>
											<Wallet className="size-5" />
											Sign In
										</>
									)}
								</Button>
							</div>

							{/* Powered by indicator */}
							<div className="flex items-center justify-center gap-2 pt-2">
								<span className="text-xs text-neutral-500">Powered by</span>
								<span className="text-xs font-semibold text-primary-600">
									Dynamic.xyz
								</span>
								<span className="text-xs text-neutral-400">•</span>
								<span className="text-xs font-semibold text-primary-600">
									Citrea
								</span>
							</div>
						</CardContent>

						<CardFooter className="flex flex-col space-y-2 text-center">
							<p className="text-xs text-neutral-500">
								By continuing, you agree to our{" "}
								<a
									href="/terms"
									className="text-primary-600 hover:text-primary-700 underline"
								>
									Terms of Service
								</a>{" "}
								and{" "}
								<a
									href="/privacy"
									className="text-primary-600 hover:text-primary-700 underline"
								>
									Privacy Policy
								</a>
							</p>
						</CardFooter>
					</Card>

					{/* Trust indicators */}
					<div className="flex flex-col items-center space-y-3">
						<div className="flex items-center gap-2 text-sm text-neutral-600">
							<Shield className="size-4 text-success-600" />
							<span>Bank-level security with blockchain transparency</span>
						</div>
						<div className="flex flex-wrap justify-center gap-4 text-xs text-neutral-500">
							<span>• No hidden fees</span>
							<span>• Full transparency</span>
							<span>• Your keys, your crypto</span>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

// Helper component for value propositions
function ValueProp({ icon, text }: { icon: React.ReactNode; text: string }) {
	return (
		<div className="flex items-center gap-3 text-neutral-700">
			<div className="flex size-10 items-center justify-center rounded-lg bg-primary-100 text-primary-600">
				{icon}
			</div>
			<span className="text-sm font-medium">{text}</span>
		</div>
	);
}
