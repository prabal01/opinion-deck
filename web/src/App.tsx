
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

function AppContent() {
  const { getIdToken } = useAuth();

  // Wire up the token getter for API calls
  useEffect(() => {
    setTokenGetter(getIdToken);
  }, [getIdToken]);

  // Check for checkout redirect
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("checkout") === "success") {
      // Clean URL
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, []);

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <div className="logo">
            <span className="logo-icon" aria-hidden="true">📥</span>
            <h1 className="logo-text">Reddit Keeper</h1>
            <span className="logo-tagline">Export threads for AI & Research</span>
          </div>
          <div className="header-actions">
            <ThemeToggle />
            <AuthButton />
          </div>
        </div>
      </header>

      <main className="app-main">
        <Routes>
          <Route path="/" element={<HomeView />} />
          <Route path="/folders/:folderId" element={<FolderDetail />} />
        </Routes>
      </main>

      <Footer />
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
