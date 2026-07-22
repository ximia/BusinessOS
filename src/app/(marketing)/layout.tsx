import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { FloatingCallButton } from "@/components/shared/floating-call-button";
import { SettingsProvider } from "@/features/settings/settings-provider";
import { getSiteConfig } from "@/features/settings/settings.service";

export default async function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Effective config = compile-time defaults merged with admin-edited settings.
  const settings = await getSiteConfig();

  return (
    <SettingsProvider settings={settings}>
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <main id="main" className="flex-1">
          {children}
        </main>
        <Footer settings={settings} />
        <FloatingCallButton />
      </div>
    </SettingsProvider>
  );
}
