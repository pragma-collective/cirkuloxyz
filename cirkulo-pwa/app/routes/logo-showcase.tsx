import type { Route } from "./+types/logo-showcase";
import { Button } from "app/components/ui/button";
import { Card } from "app/components/ui/card";
import { Check } from "lucide-react";
import {
  UnityCirclesIcon,
  UnityCirclesHorizontal,
  UnityCirclesFull,
  UnityCirclesInfo
} from "app/components/logos/unity-circles";
import {
  SavingsBloomIcon,
  SavingsBloomHorizontal,
  SavingsBloomFull,
  SavingsBloomInfo
} from "app/components/logos/savings-bloom";
import {
  ConnectedXIcon,
  ConnectedXHorizontal,
  ConnectedXFull,
  ConnectedXInfo
} from "app/components/logos/connected-x";
import {
  MomentumWaveIcon,
  MomentumWaveHorizontal,
  MomentumWaveFull,
  MomentumWaveInfo
} from "app/components/logos/momentum-wave";
import {
  SparkCircleIcon,
  SparkCircleHorizontal,
  SparkCircleFull,
  SparkCircleInfo
} from "app/components/logos/spark-circle";
import {
  CosmicUnityIcon,
  CosmicUnityHorizontal,
  CosmicUnityFull,
  CosmicUnityInfo
} from "app/components/logos/cosmic-unity";
import {
  GoldenAbundanceIcon,
  GoldenAbundanceHorizontal,
  GoldenAbundanceFull,
  GoldenAbundanceInfo
} from "app/components/logos/golden-abundance";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Xersha Logo Showcase" },
    { name: "description", content: "Explore logo concepts for Xersha" },
  ];
}

const logos = [
  {
    name: UnityCirclesInfo.name,
    info: UnityCirclesInfo,
    Icon: UnityCirclesIcon,
    Horizontal: UnityCirclesHorizontal,
    Full: UnityCirclesFull,
  },
  {
    name: SparkCircleInfo.name,
    info: SparkCircleInfo,
    Icon: SparkCircleIcon,
    Horizontal: SparkCircleHorizontal,
    Full: SparkCircleFull,
  },
  {
    name: CosmicUnityInfo.name,
    info: CosmicUnityInfo,
    Icon: CosmicUnityIcon,
    Horizontal: CosmicUnityHorizontal,
    Full: CosmicUnityFull,
  },
  {
    name: GoldenAbundanceInfo.name,
    info: GoldenAbundanceInfo,
    Icon: GoldenAbundanceIcon,
    Horizontal: GoldenAbundanceHorizontal,
    Full: GoldenAbundanceFull,
  },
  {
    name: ConnectedXInfo.name,
    info: ConnectedXInfo,
    Icon: ConnectedXIcon,
    Horizontal: ConnectedXHorizontal,
    Full: ConnectedXFull,
  },
  {
    name: MomentumWaveInfo.name,
    info: MomentumWaveInfo,
    Icon: MomentumWaveIcon,
    Horizontal: MomentumWaveHorizontal,
    Full: MomentumWaveFull,
  },
];

export default function LogoShowcase() {
  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <header className="bg-white border-b border-neutral-200 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold text-neutral-900 mb-2">
            Xersha Logo Concepts
          </h1>
          <p className="text-lg text-neutral-600">
            Six distinct approaches to represent community-powered savings
          </p>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Quick comparison grid */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-neutral-900 mb-8">Quick Comparison</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {logos.map((logo) => (
              <Card key={logo.name} className="p-8 text-center hover:shadow-lg transition-shadow">
                <div className="mb-4 flex items-center justify-center">
                  <logo.Icon size={80} />
                </div>
                <h3 className="font-bold text-neutral-900 mb-2">{logo.name}</h3>
                <p className="text-sm text-neutral-600 mb-4">{logo.info.concept}</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const element = document.getElementById(`logo-${logo.name.toLowerCase().replace(/\s+/g, '-')}`);
                    element?.scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  View Details
                </Button>
              </Card>
            ))}
          </div>
        </section>

        {/* Detailed logo sections */}
        {logos.map((logo, index) => (
          <section
            key={logo.name}
            id={`logo-${logo.name.toLowerCase().replace(/\s+/g, '-')}`}
            className="mb-20 scroll-mt-4"
          >
            <div className="mb-8">
              <div className="flex items-center gap-4 mb-4">
                <span className="size-10 rounded-full bg-primary-600 text-white flex items-center justify-center font-bold">
                  {index + 1}
                </span>
                <h2 className="text-3xl font-bold text-neutral-900">{logo.name}</h2>
              </div>
              <p className="text-lg text-neutral-700 mb-4">{logo.info.description}</p>
            </div>

            {/* Variations showcase */}
            <div className="grid lg:grid-cols-3 gap-6 mb-8">
              {/* Icon only */}
              <Card className="p-6">
                <h4 className="font-semibold text-neutral-900 mb-4">Icon Only</h4>
                <div className="bg-neutral-100 rounded-xl p-8 flex items-center justify-center">
                  <logo.Icon size={120} />
                </div>
                <p className="text-sm text-neutral-600 mt-4">
                  Perfect for app icon, favicon, and social media profiles
                </p>
              </Card>

              {/* Horizontal lockup */}
              <Card className="p-6">
                <h4 className="font-semibold text-neutral-900 mb-4">Horizontal Lockup</h4>
                <div className="bg-neutral-100 rounded-xl p-8 flex items-center justify-center">
                  <logo.Horizontal size={60} />
                </div>
                <p className="text-sm text-neutral-600 mt-4">
                  Ideal for website headers, email signatures, and horizontal layouts
                </p>
              </Card>

              {/* Full lockup */}
              <Card className="p-6">
                <h4 className="font-semibold text-neutral-900 mb-4">Full Lockup with Tagline</h4>
                <div className="bg-neutral-100 rounded-xl p-8 flex items-center justify-center">
                  <logo.Full size={64} />
                </div>
                <p className="text-sm text-neutral-600 mt-4">
                  Best for marketing materials and brand presentations
                </p>
              </Card>
            </div>

            {/* Scalability test */}
            <Card className="p-6 mb-8">
              <h4 className="font-semibold text-neutral-900 mb-4">Scalability Test</h4>
              <div className="flex items-end gap-6 justify-center bg-neutral-100 rounded-xl p-8">
                <div className="text-center">
                  <logo.Icon size={16} />
                  <p className="text-xs text-neutral-600 mt-2">16px</p>
                </div>
                <div className="text-center">
                  <logo.Icon size={24} />
                  <p className="text-xs text-neutral-600 mt-2">24px</p>
                </div>
                <div className="text-center">
                  <logo.Icon size={32} />
                  <p className="text-xs text-neutral-600 mt-2">32px</p>
                </div>
                <div className="text-center">
                  <logo.Icon size={48} />
                  <p className="text-xs text-neutral-600 mt-2">48px</p>
                </div>
                <div className="text-center">
                  <logo.Icon size={64} />
                  <p className="text-xs text-neutral-600 mt-2">64px</p>
                </div>
                <div className="text-center">
                  <logo.Icon size={96} />
                  <p className="text-xs text-neutral-600 mt-2">96px</p>
                </div>
                <div className="text-center">
                  <logo.Icon size={128} />
                  <p className="text-xs text-neutral-600 mt-2">128px</p>
                </div>
              </div>
            </Card>

            {/* Background variations */}
            <Card className="p-6 mb-8">
              <h4 className="font-semibold text-neutral-900 mb-4">Background Variations</h4>
              <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
                <div className="text-center">
                  <div className="bg-white border-2 border-neutral-200 rounded-xl p-6 flex items-center justify-center">
                    <logo.Icon size={60} />
                  </div>
                  <p className="text-xs text-neutral-600 mt-2">Light</p>
                </div>
                <div className="text-center">
                  <div className="bg-neutral-900 rounded-xl p-6 flex items-center justify-center">
                    <logo.Icon size={60} />
                  </div>
                  <p className="text-xs text-neutral-600 mt-2">Dark</p>
                </div>
                <div className="text-center">
                  <div className="bg-primary-600 rounded-xl p-6 flex items-center justify-center">
                    <logo.Icon size={60} />
                  </div>
                  <p className="text-xs text-neutral-600 mt-2">Orange</p>
                </div>
                <div className="text-center">
                  <div className="bg-secondary-600 rounded-xl p-6 flex items-center justify-center">
                    <logo.Icon size={60} />
                  </div>
                  <p className="text-xs text-neutral-600 mt-2">Purple</p>
                </div>
                <div className="text-center">
                  <div className="bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl p-6 flex items-center justify-center">
                    <logo.Icon size={60} />
                  </div>
                  <p className="text-xs text-neutral-600 mt-2">Gradient</p>
                </div>
              </div>
            </Card>

            {/* Strengths and details */}
            <div className="grid lg:grid-cols-2 gap-6">
              <Card className="p-6">
                <h4 className="font-semibold text-neutral-900 mb-4">Key Strengths</h4>
                <ul className="space-y-2">
                  {logo.info.strengths.map((strength, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <Check className="size-5 text-success-600 flex-shrink-0 mt-0.5" />
                      <span className="text-neutral-700">{strength}</span>
                    </li>
                  ))}
                </ul>
              </Card>

              <Card className="p-6">
                <h4 className="font-semibold text-neutral-900 mb-4">Design Details</h4>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium text-neutral-600">Concept</p>
                    <p className="text-neutral-900">{logo.info.concept}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-neutral-600">Color Palette</p>
                    <div className="flex gap-2 mt-1">
                      {logo.info.colors.map((color, i) => (
                        <span key={i} className="text-xs bg-neutral-100 px-2 py-1 rounded">
                          {color}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-neutral-600">Format</p>
                    <p className="text-neutral-900">Inline SVG, scalable vector</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-neutral-600">Accessibility</p>
                    <p className="text-neutral-900">WCAG AA compliant, semantic markup</p>
                  </div>
                </div>
              </Card>
            </div>
          </section>
        ))}

        {/* Voting section */}
        <section className="mt-20 mb-12">
          <Card className="p-8 bg-gradient-to-br from-primary-50 to-secondary-50 border-2 border-primary-200">
            <h2 className="text-2xl font-bold text-neutral-900 mb-4 text-center">
              Which logo speaks to you?
            </h2>
            <p className="text-neutral-700 text-center mb-6">
              Help us choose the perfect logo for Xersha
            </p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {logos.map((logo) => (
                <Button
                  key={logo.name}
                  variant="outline"
                  className="h-auto py-4 flex flex-col gap-2 bg-white hover:border-primary-600 hover:bg-primary-50"
                >
                  <logo.Icon size={48} />
                  <span className="font-semibold">{logo.name}</span>
                </Button>
              ))}
            </div>
          </Card>
        </section>
      </main>
    </div>
  );
}
