import { useEffect } from "react";
import { X } from "lucide-react";
import Brand from "@/components/layout/Brand";
import NavList from "@/components/layout/NavList";
import { closeMobileNav } from "@/components/layout/uiSlice";
import Button from "@/components/ui/Button";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";

export default function MobileNav() {
  const dispatch = useAppDispatch();
  const open = useAppSelector((state) => state.ui.mobileNavOpen);

  useEffect(() => {
    if (!open) return undefined;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") dispatch(closeMobileNav());
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, dispatch]);

  if (!open) return null;

  const close = () => dispatch(closeMobileNav());

  return (
    <div className="fixed inset-0 z-40 lg:hidden">
      <div
        className="absolute inset-0 bg-slate-950/50"
        onClick={close}
        aria-hidden="true"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
        className="absolute inset-y-0 left-0 flex w-72 max-w-[85vw] flex-col bg-surface shadow-xl"
      >
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-border px-4">
          <Brand />
          <Button
            variant="ghost"
            size="icon"
            onClick={close}
            aria-label="Close menu"
            autoFocus
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </Button>
        </div>
        <div className="no-scroll-y flex-1 overflow-y-auto p-3">
          <NavList onNavigate={close} />
        </div>
      </div>
    </div>
  );
}
