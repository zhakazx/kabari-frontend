import type { ComponentType, SVGProps } from "react";

import {
  IconBell,
  IconCalendar,
  IconChart,
  IconClipboardCheck,
  IconCoins,
  IconGift,
  IconLayers,
  IconReceipt,
  IconScan,
  IconUsers,
} from "@/components/ui/icons";
import type { IconName } from "@/components/shell/RoleNav";

type IconComponent = ComponentType<SVGProps<SVGSVGElement> & { size?: number }>;

export const ICON_REGISTRY: Record<IconName, IconComponent> = {
  bell: IconBell,
  calendar: IconCalendar,
  chart: IconChart,
  clipboardCheck: IconClipboardCheck,
  coins: IconCoins,
  gift: IconGift,
  layers: IconLayers,
  receipt: IconReceipt,
  scan: IconScan,
  users: IconUsers,
};
