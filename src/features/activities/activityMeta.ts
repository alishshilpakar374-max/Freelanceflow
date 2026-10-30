import { Mail, MessageSquare, Phone, StickyNote, Users } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { ActivityType } from "@/types";

export const activityIcons: Record<ActivityType, LucideIcon> = {
  call: Phone,
  email: Mail,
  message: MessageSquare,
  meeting: Users,
  note: StickyNote,
};
