import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { FloatingCallButton } from "@/components/shared/floating-call-button";
import { StickyMobileCta } from "@/components/shared/sticky-mobile-cta";
import { AnnouncementBar } from "@/components/shared/announcement-bar";
import { SettingsProvider } from "@/features/settings/settings-provider";
import { getSiteConfig } from "@/features/settings/settings.service";
import { BrandStyle } from "@/features/theme/brand-style";

export default async function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Effective config = compile-time defaults merged with admin-edited settings.
  const settings = await getSiteConfig();

  return (
    <SettingsProvider settings={settings}>
      <BrandStyle theme={settings.theme} />
      <div className="flex min-h-screen flex-col">
        <AnnouncementBar />
        <Navbar />
        <main id="main" className="flex-1">
          {children}
        </main>
        <Footer settings={settings} />
        <FloatingCallButton />
        <StickyMobileCta />
      </div>
    </SettingsProvider>
  );
}
