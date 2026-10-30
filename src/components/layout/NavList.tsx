import { NavLink } from "react-router-dom";
import { navItems } from "@/components/layout/navigation";
import { cn } from "@/lib/utils";

interface NavListProps {
  collapsed?: boolean;
  onNavigate?: () => void;
}

export default function NavList({
  collapsed = false,
  onNavigate,
}: NavListProps) {
  return (
    <nav aria-label="Main">
      <ul className="flex flex-col gap-1">
        {navItems.map(({ label, to, icon: Icon }) => (
          <li key={to}>
            <NavLink
              to={to}
              end={to === "/"}
              onClick={onNavigate}
              title={collapsed ? label : undefined}
              className={({ isActive }) =>
                cn(
                  "flex h-10 items-center gap-3 rounded-lg px-3 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted hover:bg-surface-muted hover:text-foreground",
                  collapsed && "justify-center px-0",
                )
              }
            >
              <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
              <span className={cn(collapsed && "sr-only")}>{label}</span>
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
