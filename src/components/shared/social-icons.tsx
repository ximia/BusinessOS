import { Facebook, Instagram, Linkedin, Youtube, Twitter } from "lucide-react";
import type { SocialLink } from "@/types/content";

// Lucide doesn't ship TikTok/Google marks; fall back to a labelled dot.
const icons: Record<SocialLink["platform"], React.ComponentType<{ className?: string }>> = {
  facebook: Facebook,
  instagram: Instagram,
  linkedin: Linkedin,
  youtube: Youtube,
  x: Twitter,
  tiktok: () => <span className="text-[11px] font-bold">TT</span>,
  google: () => <span className="text-[11px] font-bold">G</span>,
};

export function SocialIcons({ links }: { links: SocialLink[] }) {
  return (
    <div className="flex items-center gap-2">
      {links.map((link) => {
        const Icon = icons[link.platform];
        return (
          <a
            key={link.platform}
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={link.platform}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-primary/40 hover:bg-accent hover:text-foreground"
          >
            <Icon className="h-[18px] w-[18px]" />
          </a>
        );
      })}
    </div>
  );
}
