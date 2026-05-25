import { useState } from "react";
import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useEffect } from "react";
import { AnimatePresence } from "framer-motion";

import { Layout } from "@/components/Layout";
import { Home } from "@/pages/Home";
import { Log } from "@/pages/Log";
import { Calculator } from "@/pages/Calculator";
import { History } from "@/pages/History";
import { Nutrition } from "@/pages/Nutrition";
import { Steps } from "@/pages/Steps";
import { Settings } from "@/pages/Settings";
import { Disclaimer, useDisclaimerAccepted } from "@/components/Disclaimer";
import { IncomingReferralPrompt } from "@/components/IncomingReferralPrompt";
import NotFound from "@/pages/not-found";
import { useCycleReminder } from "@/hooks/useCycleReminder";
import { parseReferralFromUrl, clearReferralFromUrl, type IncomingReferral } from "@/utils/affiliateShare";

const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/log" component={Log} />
      <Route path="/calculator" component={Calculator} />
      <Route path="/nutrition" component={Nutrition} />
      <Route path="/steps" component={Steps} />
      <Route path="/history" component={History} />
      <Route path="/settings" component={Settings} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [accepted, setAccepted] = useState(useDisclaimerAccepted);
  const [incoming, setIncoming] = useState<IncomingReferral | null>(() => parseReferralFromUrl());
  useCycleReminder();

  useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

  useEffect(() => {
    // Clear the ref params from the URL bar once captured, so a refresh doesn't re-prompt.
    if (incoming) clearReferralFromUrl();
  }, [incoming]);

  // If user has not accepted yet, the incoming referral is handed to the Disclaimer onboarding.
  // If user has already accepted, we show a one-time prompt to save/replace.
  const showIncomingPrompt = accepted && !!incoming;

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Layout>
            <Router />
          </Layout>
          <AnimatePresence>
            {!accepted && (
              <Disclaimer
                onAccept={() => setAccepted(true)}
                initialReferral={incoming ?? undefined}
                onReferralConsumed={() => setIncoming(null)}
              />
            )}
            {showIncomingPrompt && incoming && (
              <IncomingReferralPrompt
                incoming={incoming}
                onDismiss={() => setIncoming(null)}
              />
            )}
          </AnimatePresence>
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
