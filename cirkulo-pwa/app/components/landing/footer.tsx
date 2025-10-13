import { Link } from "react-router";
import { XershaLogo } from "app/components/xersha-logo";
import { Github, Twitter, Mail } from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    product: [
      { label: "How it works", href: "#how-it-works" },
      { label: "Use cases", href: "#use-cases" },
      { label: "Pricing", href: "/pricing" },
      { label: "FAQ", href: "/faq" }
    ],
    company: [
      { label: "About us", href: "/about" },
      { label: "Blog", href: "/blog" },
      { label: "Careers", href: "/careers" },
      { label: "Contact", href: "/contact" }
    ],
    legal: [
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms of Service", href: "/terms" },
      { label: "Security", href: "/security" },
      { label: "Compliance", href: "/compliance" }
    ]
  };

  const socialLinks = [
    { icon: Twitter, href: "https://twitter.com/xersha", label: "Twitter" },
    { icon: Github, href: "https://github.com/xersha", label: "GitHub" },
    { icon: Mail, href: "mailto:hello@xersha.com", label: "Email" }
  ];

  return (
    <footer className="bg-neutral-900 text-neutral-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        {/* Top section */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
          {/* Brand column */}
          <div className="lg:col-span-2">
            <div className="mb-4">
              <XershaLogo size="md" className="[&_span]:text-white [&_span:last-child]:text-neutral-400" />
            </div>
            <p className="text-neutral-400 mb-6 max-w-xs">
              Making saving a social adventure. Turn your financial goals into shared milestones with friends.
            </p>
            {/* Social links */}
            <div className="flex gap-4">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="size-10 rounded-full bg-neutral-800 hover:bg-primary-600 flex items-center justify-center transition-colors"
                    aria-label={social.label}
                  >
                    <Icon className="size-5" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Product links */}
          <div>
            <h3 className="font-semibold text-white mb-4">Product</h3>
            <ul className="space-y-3">
              {footerLinks.product.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-neutral-400 hover:text-primary-400 transition-colors text-sm"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Company links */}
          <div>
            <h3 className="font-semibold text-white mb-4">Company</h3>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.href}
                    className="text-neutral-400 hover:text-primary-400 transition-colors text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal links */}
          <div>
            <h3 className="font-semibold text-white mb-4">Legal</h3>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.href}
                    className="text-neutral-400 hover:text-primary-400 transition-colors text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom section */}
        <div className="pt-8 border-t border-neutral-800">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-neutral-400 text-sm">
              © {currentYear} Xersha. Made with ❤️ for friend groups everywhere.
            </p>
            <div className="flex items-center gap-4 text-sm text-neutral-400">
              <span>Powered by</span>
              <a href="https://citrea.xyz" target="_blank" rel="noopener noreferrer" className="text-primary-400 hover:text-primary-300 font-semibold">
                Citrea
              </a>
              <span>•</span>
              <a href="https://dynamic.xyz" target="_blank" rel="noopener noreferrer" className="text-primary-400 hover:text-primary-300 font-semibold">
                Dynamic.xyz
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
