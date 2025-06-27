import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthDebug } from "@/components/auth/auth-debug";
import LandingPage from "@/pages/LandingPage";
import LoginPage from "@/app/login/page";
import SignupPage from "@/app/signup/page";
import GeneratePage from "@/app/generate/page";
import PRDPage from "@/pages/prd/PRDPage";
import DetailedIdeaPage from "@/pages/idea/DetailedIdeaPage";
import NotFound from "@/pages/NotFound";
import { NotFound as GhostNotFound } from "@/components/ui/ghost-404-page";
import TestGhost404 from "@/pages/TestGhost404";
import PrivacyPolicyPage from "@/app/privacy/page";
import TermsOfServicePage from "@/app/terms/page";

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
            element={<Navigate to="/" replace />}
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
          <Route path="/auth-debug" element={<div className="min-h-screen bg-background p-8"><AuthDebug /></div>} />
          <Route path="/404-demo" element={<GhostNotFound />} />
          <Route path="/test-404" element={<TestGhost404 />} />
          <Route path="/privacy" element={<PrivacyPolicyPage />} />
          <Route path="/terms" element={<TermsOfServicePage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Toaster />
      </Router>
    </ThemeProvider>
  );
}
