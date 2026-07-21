"use client";

import * as React from "react";
import { ThemeProvider } from "next-themes";
import { Toaster } from "sonner";
import { useAuthStore } from "@/store/auth";
import { ServiceWorkerRegister } from "@/components/ServiceWorkerRegister";

function AuthBootstrap() {
  const fetchMe = useAuthStore((s) => s.fetchMe);
  React.useEffect(() => {
    fetchMe();
  }, [fetchMe]);
  return null;
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <AuthBootstrap />
      <ServiceWorkerRegister />
      {children}
      <Toaster position="top-center" richColors closeButton />
    </ThemeProvider>
  );
}
