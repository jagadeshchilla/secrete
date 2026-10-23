import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import { AccessProvider } from "@/context/AccessContext";
import { AppStateProvider } from "@/context/AppStateContext";
import { ResourcesProvider } from "@/context/ResourcesContext";
import { IdeasProvider } from "@/context/IdeasContext";
import { ResearchProvider } from "@/context/ResearchContext";
import { FreelanceProvider } from "@/context/FreelanceContext";
import { ToastProvider } from "@/context/ToastContext";
import Gate from "@/components/Gate/Gate";
import StreakToastWatcher from "@/components/StreakToastWatcher";

export const metadata: Metadata = {
  title: "Career Hub",
  description: "Jobs, selections, and learning — all in one place.",
  icons: {
    icon: "/logo.png",
    shortcut: "/logo.png",
    apple: "/logo.png",
  },
};

const THEME_INIT_SCRIPT = `
(function(){
  try {
    var t = localStorage.getItem('themePreference') || 'light';
    document.documentElement.setAttribute('data-theme', t);
  } catch (e) {}
})();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <Script id="theme-init" strategy="beforeInteractive">
          {THEME_INIT_SCRIPT}
        </Script>
      </head>
      <body className="antialiased">
        <AccessProvider>
          <AppStateProvider>
            <ResourcesProvider>
              <IdeasProvider>
                <ResearchProvider>
                  <FreelanceProvider>
                    <ToastProvider>
                      <Gate>
                        <StreakToastWatcher />
                        {children}
                      </Gate>
                    </ToastProvider>
                  </FreelanceProvider>
                </ResearchProvider>
              </IdeasProvider>
            </ResourcesProvider>
          </AppStateProvider>
        </AccessProvider>
      </body>
    </html>
  );
}
