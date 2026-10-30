import Brand from "@/components/layout/Brand";
import NavList from "@/components/layout/NavList";
import { useAppSelector } from "@/hooks/redux";
import { cn } from "@/lib/utils";

export default function Sidebar() {
  const collapsed = useAppSelector((state) => state.ui.sidebarCollapsed);

  return (
    <aside
      className={cn(
        "hidden shrink-0 flex-col border-r border-border bg-surface transition-[width] duration-200 lg:flex",
        collapsed ? "w-16" : "w-64",
      )}
    >
      <div
        className={cn(
          "flex h-16 shrink-0 items-center border-b border-border px-4",
          collapsed && "justify-center px-0",
        )}
      >
        <Brand showText={!collapsed} />
      </div>
      <div className="no-scroll-y flex-1 overflow-y-auto p-3">
        <NavList collapsed={collapsed} />
      </div>
    </aside>
  );
}
