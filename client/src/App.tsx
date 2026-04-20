import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Workspace from "./pages/Workspace";
import CanvasStudioPage from "./pages/CanvasStudioPage";
import DiagramStudioPage from "./pages/DiagramStudioPage";
import WorkflowStudioPage from "./pages/WorkflowStudioPage";
import SkillCreatorPage from "./pages/SkillCreatorPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import FileHubPage from "./pages/FileHubPage";
import MembersPage from "./pages/MembersPage";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/workspace" component={Workspace} />
      <Route path="/workspace/canvas" component={CanvasStudioPage} />
      <Route path="/workspace/diagram" component={DiagramStudioPage} />
      <Route path="/workspace/workflows" component={WorkflowStudioPage} />
      <Route path="/workspace/skills" component={SkillCreatorPage} />
      <Route path="/workspace/analytics" component={AnalyticsPage} />
      <Route path="/workspace/files" component={FileHubPage} />
      <Route path="/workspace/members" component={MembersPage} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
