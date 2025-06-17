import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { ThemeProvider } from "@/components/theme-provider";
import LandingPage from "@/pages/LandingPage";
import LoginPage from "@/app/login/page";
import SignupPage from "@/app/signup/page";
import DashboardPage from "@/app/dashboard/page";
import GeneratePage from "@/app/generate/page";
import PRDPage from "@/pages/prd/PRDPage";
import DetailedIdeaPage from "@/pages/idea/DetailedIdeaPage";
import NotFound from "@/pages/NotFound";
import { NotFound as GhostNotFound } from "@/components/ui/ghost-404-page";
import TestGhost404 from "@/pages/TestGhost404";

export default function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="prd-genie-theme">
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/generate"
            element={
              <ProtectedRoute>
                <GeneratePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/prd/:id"
            element={
              <ProtectedRoute>
                <PRDPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/idea/:id"
            element={
              <ProtectedRoute>
                <DetailedIdeaPage />
              </ProtectedRoute>
            }
          />
          <Route path="/404-demo" element={<GhostNotFound />} />
          <Route path="/test-404" element={<TestGhost404 />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Toaster />
      </Router>
    </ThemeProvider>
  );
}
