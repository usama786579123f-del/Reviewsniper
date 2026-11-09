/*
 * Route wiring: "/" and the old auth URLs go straight to the dashboard.
 */
import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Redirect, Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";

// Lazy-load every workspace page so the browser only downloads the code for
// the page you're actually viewing, instead of one giant bundle up front.
const DashboardPage = lazy(() => import("./pages/Dashboard"));
const CrisisLeadsPage = lazy(() => import("./pages/CrisisLeads"));
const SavedLeadsPage = lazy(() => import("./pages/SavedLeads"));
const ExportLeadsPage = lazy(() => import("./pages/ExportLeads"));
const AnalyticsPage = lazy(() => import("./pages/Analytics"));
const EmailAlertsPage = lazy(() => import("./pages/EmailAlerts"));
const AgenciesPage = lazy(() => import("./pages/Agencies"));

function PageLoading() {
  return <div style={{ padding: 40, textAlign: "center", color: "#93a0b2", fontSize: 12 }}>Loading...</div>;
}

function Router() {
  return (
    <Suspense fallback={<PageLoading />}>
      <Switch>
        <Route path="/"><Redirect to="/dashboard" /></Route>
        <Route path="/login"><Redirect to="/dashboard" /></Route>
        <Route path="/signup"><Redirect to="/dashboard" /></Route>
        <Route path="/dashboard" component={DashboardPage} />
        <Route path="/crisis-leads" component={CrisisLeadsPage} />
        <Route path="/saved-leads" component={SavedLeadsPage} />
        <Route path="/export-leads" component={ExportLeadsPage} />
        <Route path="/analytics" component={AnalyticsPage} />
        <Route path="/email-alerts" component={EmailAlertsPage} />
        <Route path="/agencies" component={AgenciesPage} />
        <Route path="/404" component={NotFound} />
        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster position="bottom-right" />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
