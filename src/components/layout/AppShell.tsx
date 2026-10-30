import { Outlet } from "react-router-dom";
import Header from "@/components/layout/Header";
import MobileNav from "@/components/layout/MobileNav";
import Sidebar from "@/components/layout/Sidebar";
import ToastViewport from "@/components/layout/ToastViewport";

export default function AppShell() {
  return (
    <div className="flex h-dvh overflow-hidden">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground"
      >
        Skip to content
      </a>

      <Sidebar />
      <MobileNav />

      <div className="flex min-w-0 flex-1 flex-col">
        <Header />
        <main
          id="main-content"
          tabIndex={-1}
          className="relative flex-1 overflow-y-auto p-4 outline-none sm:p-6 lg:p-8"
        >
          <Outlet />
        </main>
      </div>

      <ToastViewport />
    </div>
  );
}
