import { useEffect } from "react";
import { Outlet } from "react-router-dom";
import { THEME_STORAGE_KEY } from "@/features/settings/theme/themeSlice";
import { useAuthListener } from "@/features/auth/useAuthListener";
import { useAppSelector } from "@/hooks/redux";

export default function RootLayout() {
  const mode = useAppSelector((state) => state.theme.mode);

  useAuthListener();

  useEffect(() => {
    const root = document.documentElement;
    const media = window.matchMedia("(prefers-color-scheme: dark)");

    const apply = () => {
      const isDark = mode === "dark" || (mode === "system" && media.matches);
      root.classList.toggle("dark", isDark);
    };

    apply();

    try {
      localStorage.setItem(THEME_STORAGE_KEY, mode);
    } catch {
      // storage unavailable, theme just won't persist
    }

    if (mode !== "system") return undefined;

    media.addEventListener("change", apply);
    return () => media.removeEventListener("change", apply);
  }, [mode]);

  return (
    <div className="no-scroll-y">
      <Outlet />
    </div>
  );
}
