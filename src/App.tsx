import { Navigate } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import MainPage from "./pages/MainPage"
import Index from "./pages/Index";

import Auth from "./pages/Auth";
import History from "./pages/History";
import LibraryPage from "./pages/LibraryPage";
import MyPage from "./pages/MyPage";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          
          <Route path="/" element={<Navigate to="/main" replace />} />
          
          <Route path="/main" element={<MainPage />} />

          <Route path="/journal" element={<Index />} />

          <Route path="/auth" element={<Auth />} />
          <Route path="/history" element={<History />} />
          <Route path="/library" element={<LibraryPage />} />
          <Route path="/mypage" element={<MyPage />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
