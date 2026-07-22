/**
 * Central icon registry.
 *
 * Config files reference icons by string key (so config stays serialisable and
 * CMS-friendly) and components resolve them through `iconMap`. Add new icons
 * here as needed.
 */
import {
  Wrench,
  Sparkles,
  Home,
  Zap,
  Droplets,
  Wind,
  Scissors,
  Brush,
  Stethoscope,
  Trees,
  Car,
  ShieldCheck,
  Clock,
  Phone,
  Mail,
  MapPin,
  Star,
  CheckCircle2,
  CalendarCheck,
  ClipboardList,
  Search,
  HandshakeIcon,
  Award,
  ThumbsUp,
  Timer,
  Gauge,
  Leaf,
  Hammer,
  PaintBucket,
  Truck,
  Users,
  BadgeCheck,
  Headphones,
  type LucideIcon,
} from "lucide-react";

export const iconMap = {
  wrench: Wrench,
  sparkles: Sparkles,
  home: Home,
  zap: Zap,
  droplets: Droplets,
  wind: Wind,
  scissors: Scissors,
  brush: Brush,
  stethoscope: Stethoscope,
  trees: Trees,
  car: Car,
  shield: ShieldCheck,
  clock: Clock,
  phone: Phone,
  mail: Mail,
  mapPin: MapPin,
  star: Star,
  check: CheckCircle2,
  calendar: CalendarCheck,
  clipboard: ClipboardList,
  search: Search,
  handshake: HandshakeIcon,
  award: Award,
  thumbsUp: ThumbsUp,
  timer: Timer,
  gauge: Gauge,
  leaf: Leaf,
  hammer: Hammer,
  paint: PaintBucket,
  truck: Truck,
  users: Users,
  badge: BadgeCheck,
  headphones: Headphones,
} satisfies Record<string, LucideIcon>;

export type IconKey = keyof typeof iconMap;

export function getIcon(key: IconKey): LucideIcon {
  return iconMap[key];
}
