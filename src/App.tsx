import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProfileProvider } from "@/contexts/ProfileContext";
import { MedicationsProvider } from "@/contexts/MedicationsContext";
import { RemindersProvider } from "@/contexts/RemindersContext";
import SplashScreen from "./pages/SplashScreen";
import LoginScreen from "./pages/LoginScreen";
import RegisterScreen from "./pages/RegisterScreen";
import ProfileSetupScreen from "./pages/ProfileSetupScreen";
import Dashboard from "./pages/Dashboard";
import SymptomAnalyzer from "./pages/SymptomAnalyzer";
import TabletInfo from "./pages/TabletInfo";
import MedicationDetail from "./pages/MedicationDetail";
import MyMedications from "./pages/MyMedications";
import RemindersScreen from "./pages/RemindersScreen";
import ProfileScreen from "./pages/ProfileScreen";
import PrivacyScreen from "./pages/PrivacyScreen";
import AboutScreen from "./pages/AboutScreen";
import NotFound from "./pages/NotFound";
import AIAssistant from "./pages/AIAssistant";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <ProfileProvider>
        <MedicationsProvider>
          <RemindersProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <Routes>
                  {/* Public routes */}
                  <Route path="/" element={<SplashScreen />} />
                  <Route path="/login" element={<LoginScreen />} />
                  <Route path="/register" element={<RegisterScreen />} />
                  <Route
                    path="/profile-setup"
                    element={<ProfileSetupScreen />}
                  />

                  {/* App routes */}
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/symptoms" element={<SymptomAnalyzer />} />
                  <Route path="/tablet-info" element={<TabletInfo />} />
                  <Route
                    path="/medication/:id"
                    element={<MedicationDetail />}
                  />
                  <Route path="/my-medications" element={<MyMedications />} />
                  <Route path="/reminders" element={<RemindersScreen />} />
                  <Route path="/profile" element={<ProfileScreen />} />
                  <Route path="/privacy" element={<PrivacyScreen />} />
                  <Route path="/about" element={<AboutScreen />} />
                  <Route path="/ai-assistant" element={<AIAssistant />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </BrowserRouter>
            </TooltipProvider>
          </RemindersProvider>
        </MedicationsProvider>
      </ProfileProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;

