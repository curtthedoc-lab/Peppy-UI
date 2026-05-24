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
import { Settings } from "@/pages/Settings";
import { Disclaimer, useDisclaimerAccepted } from "@/components/Disclaimer";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/log" component={Log} />
      <Route path="/calculator" component={Calculator} />
      <Route path="/history" component={History} />
      <Route path="/settings" component={Settings} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [accepted, setAccepted] = useState(useDisclaimerAccepted);

  useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Layout>
            <Router />
          </Layout>
          <AnimatePresence>
            {!accepted && (
              <Disclaimer onAccept={() => setAccepted(true)} />
            )}
          </AnimatePresence>
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
