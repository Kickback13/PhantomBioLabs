import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";
import { CartRoot } from "@/components/cart/cart-root";
import { AgeGate, ageGateScript } from "@/components/layout/age-gate";
import { AnnouncementBar } from "@/components/layout/announcement-bar";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { JsonLd } from "@/components/seo/json-ld";
import { defaultOgImage, robotsFor } from "@/lib/seo";
import { SITE_ORIGIN, site } from "@/lib/site";
import { organizationSchema, websiteSchema } from "@/lib/structured-data";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

// Pages set their own title, description, canonical and Open Graph through pageMetadata() in
// src/lib/seo.ts. These are the fallbacks for anything that doesn't.
export const metadata: Metadata = {
  metadataBase: new URL(SITE_ORIGIN),
  title: { default: site.name, template: `%s | ${site.name}` },
  description: site.description,
  applicationName: site.name,
  openGraph: {
    type: "website",
    siteName: site.name,
    locale: "en_US",
    images: [{ url: defaultOgImage(), width: 1200, height: 630, alt: site.name }],
  },
  twitter: { card: "summary_large_image", images: [defaultOgImage()] },
  // Stay out of search results until launch day, when NEXT_PUBLIC_ALLOW_INDEXING=true is set in Vercel.
  robots: robotsFor(),
};

export const viewport: Viewport = {
  themeColor: "#060509",
  colorScheme: "dark",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" suppressHydrationWarning className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: ageGateScript }} />
      </head>
      <body className="flex min-h-dvh flex-col">
        <JsonLd data={[organizationSchema(), websiteSchema()]} />
        <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[200] focus:rounded-lg focus:bg-violet-500 focus:px-4 focus:py-2">
          Skip to content
        </a>
        <CartRoot>
          <AnnouncementBar />
          <SiteHeader />
          <main id="main" className="flex-1">
            {children}
          </main>
          <SiteFooter />
        </CartRoot>
        <AgeGate />
        <Toaster
          theme="dark"
          position="bottom-center"
          toastOptions={{ className: "!bg-ink-900 !border-line-strong !text-foreground !rounded-xl" }}
        />
      </body>
    </html>
  );
}
