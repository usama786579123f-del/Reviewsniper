/*
 * Crisis Command / Airy Precision: route wiring keeps auth presentation and the
 * honest, connection-ready dashboard separated without implying backend behavior.
 */
import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import AuthPage from "./pages/Home";

// Lazy-load every workspace page so the browser only downloads the code for
// the page you're actually viewing, instead of one giant bundle up front.
const DashboardPage = lazy(() => import("./pages/Dashboard"));
const CrisisLeadsPage = lazy(() => import("./pages/CrisisLeads"));
const SavedLeadsPage = lazy(() => import("./pages/SavedLeads"));
const ExportLeadsPage = lazy(() => import("./pages/ExportLeads"));
const AnalyticsPage = lazy(() => import("./pages/Analytics"));
const EmailAlertsPage = lazy(() => import("./pages/EmailAlerts"));
const AgenciesPage = lazy(() => import("./pages/Agencies"));
const TeamMembersPage = lazy(() => import("./pages/TeamMembers"));

function PageLoading() {
  return <div style={{ padding: 40, textAlign: "center", color: "#93a0b2", fontSize: 12 }}>Loading...</div>;
}

function Router() {
  return (
    <Suspense fallback={<PageLoading />}>
      <Switch>
        <Route path="/" component={AuthPage} />
        <Route path="/login" component={AuthPage} />
        <Route path="/signup" component={AuthPage} />
        <Route path="/dashboard" component={DashboardPage} />
        <Route path="/crisis-leads" component={CrisisLeadsPage} />
        <Route path="/saved-leads" component={SavedLeadsPage} />
        <Route path="/export-leads" component={ExportLeadsPage} />
        <Route path="/analytics" component={AnalyticsPage} />
        <Route path="/email-alerts" component={EmailAlertsPage} />
        <Route path="/agencies" component={AgenciesPage} />
        <Route path="/team-members" component={TeamMembersPage} />
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