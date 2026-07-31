import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import Navbar from "@/components/Navbar";
import ProtectedRoute from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Database from "./pages/Database";
import Sources from "./pages/Sources";
import ThesisDetail from "./pages/ThesisDetail";
import SubmitThesis from "./pages/SubmitThesis";
import MyCollections from "./pages/MyCollections";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <ThemeProvider>
          <LanguageProvider>
            <AuthProvider>
              <Navbar />
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/database" element={<ProtectedRoute><Database /></ProtectedRoute>} />
                <Route path="/database/:id" element={<ProtectedRoute><ThesisDetail /></ProtectedRoute>} />
                <Route path="/sources" element={<ProtectedRoute><Sources /></ProtectedRoute>} />
                <Route path="/chat" element={<Navigate to="/" replace />} />
                <Route path="/submit" element={<ProtectedRoute><SubmitThesis /></ProtectedRoute>} />
                <Route path="/my-collections" element={<ProtectedRoute><MyCollections /></ProtectedRoute>} />
                <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </AuthProvider>
          </LanguageProvider>
        </ThemeProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
