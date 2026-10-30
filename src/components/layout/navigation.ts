import {
  Briefcase,
  CalendarCheck,
  Columns3,
  LayoutDashboard,
  Settings,
  Sparkles,
  TrendingUp,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface NavItem {
  label: string;
  to: string;
  icon: LucideIcon;
}

export const navItems: NavItem[] = [
  { label: "Dashboard", to: "/", icon: LayoutDashboard },
  { label: "Leads", to: "/leads", icon: Users },
  { label: "Pipeline", to: "/pipeline", icon: Columns3 },
  { label: "Follow-ups", to: "/follow-ups", icon: CalendarCheck },
  { label: "Projects", to: "/projects", icon: Briefcase },
  { label: "AI Outreach", to: "/ai-outreach", icon: Sparkles },
  { label: "Reports", to: "/reports", icon: TrendingUp },
  { label: "Settings", to: "/settings", icon: Settings },
];
