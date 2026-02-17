
import { useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { FolderProvider } from "./contexts/FolderContext";
import { setTokenGetter } from "./lib/api";
import { ThemeToggle } from "./components/ThemeToggle";
import { AuthButton } from "./components/AuthButton";
import { Footer } from "./components/Footer";
import { HomeView } from "./components/HomeView";
import { FolderDetail } from "./components/FolderDetail";
import { PremiumLoader } from "./components/PremiumLoader";
import { Sidebar } from "./components/Sidebar";
import { ReportsView } from "./components/ReportsView";
import { SettingsView } from "./components/SettingsView";
import { BRANDING } from "./constants/branding";

function AppContent() {
  const { getIdToken, loading, user } = useAuth();

  // Wire up the token getter for API calls
  useEffect(() => {
    setTokenGetter(getIdToken);

    // Broadcast token to extension for "Zero-Login"
    const broadcastToken = async () => {
      try {
        const token = await getIdToken();
        if (token) {
          window.postMessage({ type: "OPINION_DECK_AUTH_TOKEN", token }, window.location.origin);
        }
      } catch (err) {
        console.warn("Failed to broadcast token to extension:", err);
      }
    };

    broadcastToken();
    // Re-broadcast on focus to ensure extension gets it if just opened
    window.addEventListener("focus", broadcastToken);
    return () => window.removeEventListener("focus", broadcastToken);
  }, [getIdToken]);

  // Check for checkout redirect
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("checkout") === "success") {
      // Clean URL
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, []);

  if (loading) {
    return <PremiumLoader fullPage text={`Initializing ${BRANDING.NAME}...`} />;
  }

  return (
    <div className="app">
      {user && <Sidebar />}

      <div className="app-main-wrapper">
        <header className="app-header">
          <div className="header-breadcrumbs">
            {/* Future Breadcrumbs location */}
          </div>
          <div className="header-actions" style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
            <ThemeToggle />
            <AuthButton />
          </div>
        </header>

        <main className="app-main">
          <div className="content-container" style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 40px' }}>
            <Routes>
              <Route path="/" element={<HomeView />} />
              <Route path="/folders" element={<HomeView />} />
              <Route path="/reports" element={<ReportsView />} />
              <Route path="/settings" element={<SettingsView />} />
              <Route path="/folders/:folderId" element={<FolderDetail />} />
              <Route path="/folders/:folderId/threads/:threadId" element={<FolderDetail />} />
            </Routes>
          </div>
        </main>

        {!user && <Footer />}
      </div>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <FolderProvider>
        <AppContent />
      </FolderProvider>
    </AuthProvider>
  );
}

export default App;
