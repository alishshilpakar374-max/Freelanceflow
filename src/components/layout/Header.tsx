import { Menu, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { useLocation } from "react-router-dom";
import { navItems } from "@/components/layout/navigation";
import { openMobileNav, toggleSidebar } from "@/components/layout/uiSlice";
import Button from "@/components/ui/Button";
import ThemeToggle from "@/features/settings/theme/ThemeToggle";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import UserMenu from "@/features/auth/UserMenu";

export default function Header() {
  const dispatch = useAppDispatch();
  const collapsed = useAppSelector((state) => state.ui.sidebarCollapsed);
  const { pathname } = useLocation();

  const current = navItems.find(
    (item) =>
      pathname === item.to ||
      (item.to !== "/" && pathname.startsWith(`${item.to}/`)),
  );

  return (
    <header className="flex h-16 shrink-0 items-center gap-3 border-b border-border bg-surface px-4 sm:px-6">
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden"
        onClick={() => dispatch(openMobileNav())}
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" aria-hidden="true" />
      </Button>

      <Button
        variant="ghost"
        size="icon"
        className="hidden! lg:inline-flex!"
        onClick={() => dispatch(toggleSidebar())}
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        aria-expanded={!collapsed}
      >
        {collapsed ? (
          <PanelLeftOpen className="h-5 w-5" aria-hidden="true" />
        ) : (
          <PanelLeftClose className="h-5 w-5" aria-hidden="true" />
        )}
      </Button>

      <h1 className="text-lg font-semibold tracking-tight">
        {current?.label ?? "FreelanceFlow"}
      </h1>

      <div className="ml-auto flex items-center gap-3">
        <ThemeToggle />
        <UserMenu />
      </div>
    </header>
  );
}
