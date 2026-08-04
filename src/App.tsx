import { lazy, Suspense } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProtectedRoute from "@/components/ProtectedRoute";
import AdminRoute from "@/components/AdminRoute";
// Index stays eager — it's the landing page most visitors hit first, and
// lazy-loading it would trade a flash-of-loading-spinner for a bundle-size
// saving nobody feels on the very first paint. Everything reached by
// navigating away from it is lazy, admin dashboard most of all: every
// visitor was downloading its code before, even though only one person can
// ever open it.
import Index from "./pages/Index";
const Auth = lazy(() => import("./pages/Auth"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const Database = lazy(() => import("./pages/Database"));
const Sources = lazy(() => import("./pages/Sources"));
const ThesisDetail = lazy(() => import("./pages/ThesisDetail"));
const SubmitThesis = lazy(() => import("./pages/SubmitThesis"));
const MyCollections = lazy(() => import("./pages/MyCollections"));
const Profile = lazy(() => import("./pages/Profile"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const MentionsLegales = lazy(() => import("./pages/MentionsLegales"));
const Confidentialite = lazy(() => import("./pages/Confidentialite"));
const CGU = lazy(() => import("./pages/CGU"));
const NotFound = lazy(() => import("./pages/NotFound"));

const RouteFallback = () => (
  <div className="flex min-h-screen items-center justify-center">
    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
  </div>
);

const App = () => (
  <TooltipProvider>
    <Toaster />
    <Sonner />
    <BrowserRouter>
      <ThemeProvider>
        <LanguageProvider>
          <AuthProvider>
            <Navbar />
            <Suspense fallback={<RouteFallback />}>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                {/* SEO-02: public on purpose — masked to author/title/abstract/field/year/date
                    for anonymous visitors so Google can index them, see theses_public view */}
                <Route path="/database" element={<Database />} />
                <Route path="/database/:id" element={<ThesisDetail />} />
                <Route path="/sources" element={<ProtectedRoute><Sources /></ProtectedRoute>} />
                <Route path="/chat" element={<Navigate to="/" replace />} />
                <Route path="/submit" element={<ProtectedRoute><SubmitThesis /></ProtectedRoute>} />
                <Route path="/my-collections" element={<ProtectedRoute><MyCollections /></ProtectedRoute>} />
                <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
                <Route path="/mentions-legales" element={<MentionsLegales />} />
                <Route path="/confidentialite" element={<Confidentialite />} />
                <Route path="/cgu" element={<CGU />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
            <Footer />
          </AuthProvider>
        </LanguageProvider>
      </ThemeProvider>
    </BrowserRouter>
  </TooltipProvider>
);

export default App;
