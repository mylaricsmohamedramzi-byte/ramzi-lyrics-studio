import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { LangProvider } from "@/contexts/LangContext";
import Layout from "@/components/Layout";
import WelcomePage from "@/pages/WelcomePage";
import VideosPage from "@/pages/VideosPage";
import SongsPage from "@/pages/SongsPage";
import MelodiesPage from "@/pages/MelodiesPage";
import LyricsPage from "@/pages/LyricsPage";
import SongwritingArtPage from "@/pages/SongwritingArtPage";
import CopyrightPage from "@/pages/CopyrightPage";
import LoginPage from "@/pages/LoginPage";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <LangProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route element={<Layout />}>
                <Route path="/" element={<WelcomePage />} />
                <Route path="/videos" element={<VideosPage />} />
                <Route path="/songs" element={<SongsPage />} />
                <Route path="/melodies" element={<MelodiesPage />} />
                <Route path="/lyrics" element={<LyricsPage />} />
                <Route path="/songwriting-art" element={<SongwritingArtPage />} />
                <Route path="/copyright" element={<CopyrightPage />} />
                <Route path="/login" element={<LoginPage />} />
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </LangProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
