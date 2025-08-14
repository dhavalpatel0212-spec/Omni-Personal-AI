import { ReactNode, useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "./Tooltip";
import { SonnerToaster } from "./SonnerToaster";
import { ScrollToHashElement } from "./ScrollToHashElement";
import { PwaManifest } from "../helpers/manifest";
import { AuthProvider } from "../helpers/useAuth";
import { CelebrationProvider } from "../helpers/useCelebration";
import { registerServiceWorker } from "../helpers/serviceWorker";

const queryClient = new QueryClient();

export const GlobalContextProviders = ({
  children,
}: {
  children: ReactNode;
}) => {
  useEffect(() => {
    // Register service worker on app startup
    registerServiceWorker();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <PwaManifest />
      <ScrollToHashElement />
      <AuthProvider>
        <CelebrationProvider>
          <TooltipProvider>
            {children}
            <SonnerToaster />
          </TooltipProvider>
        </CelebrationProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};