import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { FloatingCallButton } from "@/components/shared/floating-call-button";
import { StickyMobileCta } from "@/components/shared/sticky-mobile-cta";
import { AnnouncementBar } from "@/components/shared/announcement-bar";
import { SettingsProvider } from "@/features/settings/settings-provider";
import { getSiteConfig } from "@/features/settings/settings.service";
import { isInMaintenance } from "@/features/agency-connection/maintenance";
import { BrandStyle } from "@/features/theme/brand-style";

export default async function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Effective config = compile-time defaults merged with admin-edited settings.
  const settings = await getSiteConfig();

  // Maintenance mode (toggled by Agency OS). Fail-safe: false on any error.
  if (await isInMaintenance()) {
    return (
      <>
        <BrandStyle theme={settings.theme} />
        <main className="flex min-h-screen flex-col items-center justify-center gap-3 p-8 text-center">
          <h1 className="text-2xl font-semibold">{settings.companyName}</h1>
          <p className="max-w-md text-muted-foreground">
            We&apos;re making some improvements and will be back shortly. Thanks
            for your patience.
          </p>
        </main>
      </>
    );
  }

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
