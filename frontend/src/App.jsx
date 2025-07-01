import React, { useState, createContext, useContext, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import "./App.css";
import Sidebar from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";
import Ingest from "./pages/Ingest";
import Extract from "./pages/Extract";
import Classify from "./pages/Classify";
import Route from "./pages/Route";
import Analytics from "./pages/Analytics";
import ThemeToggle from "./components/ThemeToggle";
import HumanIntervention from "./pages/HumanIntervention";
import { DocumentsProvider } from "./context/DocumentsContext";
import Login from "./components/Login/Login";
import PreviousUserModal from "./components/Login/PreviousUserModal";
import UnlockModal from "./components/Login/UnlockModal";

const ThemeContext = createContext();

export const useTheme = () => useContext(ThemeContext);

const USERS = [
  { email: "Admin123@gmail.com", password: "Sai25#" },
  { email: "user123@gmail.com", password: "User25#" },
];

export default function App() {
  const [currentPage, setCurrentPage] = useState("overview");
  const [theme, setTheme] = useState("system");
  const [user, setUser] = useState(() => {
    const saved = sessionStorage.getItem("ddai_user");
    return saved ? JSON.parse(saved) : null;
  });
  const [rememberedUser, setRememberedUser] = useState(() => {
    const remembered = localStorage.getItem("ddai_remembered_user");
    return remembered ? JSON.parse(remembered) : null;
  });
  const [showPrevUserModal, setShowPrevUserModal] = useState(false);
  const [pendingLogout, setPendingLogout] = useState(false);
  const [lockedSections, setLockedSections] = useState(["ingest", "extract", "classify", "route", "human"]);
  const [unlockTarget, setUnlockTarget] = useState(null);
  const [showUnlockModal, setShowUnlockModal] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "system") {
      if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
        root.setAttribute("data-theme", "dark");
      } else {
        root.setAttribute("data-theme", "light");
      }
    } else {
      root.setAttribute("data-theme", theme);
    }
  }, [theme]);

  const pageVariants = {
    initial: {
      opacity: 0,
      x: 100,
      scale: 0.95,
    },
    in: {
      opacity: 1,
      x: 0,
      scale: 1,
    },
    out: {
      opacity: 0,
      x: -100,
      scale: 0.95,
    },
  };

  const pageTransition = {
    type: "tween",
    ease: "anticipate",
    duration: 0.6,
  };

  const handleLogin = ({ username, password, remember }) => {
    const found = USERS.find(
      (u) => u.email.toLowerCase() === username.toLowerCase() && u.password === password
    );
    if (found) {
      setUser({ email: found.email });
      sessionStorage.setItem("ddai_user", JSON.stringify({ email: found.email }));
      if (remember) {
        localStorage.setItem("ddai_remembered_user", JSON.stringify({ email: found.email }));
        setRememberedUser({ email: found.email });
      } else {
        localStorage.removeItem("ddai_remembered_user");
        setRememberedUser(null);
      }
      return true;
    }
    return false;
  };

  const handleLogout = () => {
    setUser(null);
    sessionStorage.removeItem("ddai_user");
    if (rememberedUser) {
      setShowPrevUserModal(true);
      setPendingLogout(true);
    }
  };

  const handlePrevUserLogin = (password) => {
    if (!rememberedUser) return false;
    const found = USERS.find(
      (u) => u.email.toLowerCase() === rememberedUser.email.toLowerCase() && u.password === password
    );
    if (found) {
      setUser({ email: found.email });
      sessionStorage.setItem("ddai_user", JSON.stringify({ email: found.email }));
      setShowPrevUserModal(false);
      setPendingLogout(false);
      return true;
    }
    return false;
  };

  const handlePrevUserCancel = () => {
    setShowPrevUserModal(false);
    setPendingLogout(false);
  };

  const isLimitedUser = user && user.email.toLowerCase() === "user123@gmail.com";
  const isAdmin = user && user.email.toLowerCase() === "admin123@gmail.com";

  const renderPage = () => {
    const pages = {
      overview: <Dashboard />,
      ingest: <Ingest />,
      extract: <Extract />,
      classify: <Classify />,
      route: <Route />,
      analytics: <Analytics />,
      human: <HumanIntervention />,
    };

    if (isLimitedUser && lockedSections.includes(currentPage)) {
      setUnlockTarget(currentPage);
      setShowUnlockModal(true);
      return null;
    }
    return (
      <AnimatePresence mode="wait">
        <motion.div
          key={currentPage}
          initial="initial"
          animate="in"
          exit="out"
          variants={pageVariants}
          transition={pageTransition}
        >
          {pages[currentPage] || <Dashboard />}
        </motion.div>
      </AnimatePresence>
    );
  };

  const handleUnlock = (code) => {
    if (code === "2525") {
      setLockedSections((prev) => prev.filter((s) => s !== unlockTarget));
      setShowUnlockModal(false);
      setUnlockTarget(null);
      setCurrentPage(unlockTarget);
    } else {
      return false;
    }
    return true;
  };

  const handleUnlockCancel = () => {
    setShowUnlockModal(false);
    setUnlockTarget(null);
    setCurrentPage("overview");
  };

  if (!user && showPrevUserModal && rememberedUser) {
    return <PreviousUserModal email={rememberedUser.email} onLogin={handlePrevUserLogin} onCancel={handlePrevUserCancel} />;
  }

  if (!user) {
    return <Login onLogin={handleLogin} rememberedUser={rememberedUser} />;
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      <DocumentsProvider>
        <motion.div
          className="app"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          <Sidebar
            currentPage={currentPage}
            setCurrentPage={(page) => {
              if (isLimitedUser && lockedSections.includes(page)) {
                if (!showUnlockModal || unlockTarget !== page) {
                  setUnlockTarget(page);
                  setShowUnlockModal(true);
                }
              } else {
                setCurrentPage(page);
              }
            }}
            lockedSections={isLimitedUser ? lockedSections : []}
          />
          <main className="main-content">
            <motion.div
              className="header-bar"
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              <ThemeToggle theme={theme} setTheme={setTheme} onLogout={handleLogout} user={user} />
            </motion.div>
            {renderPage()}
            {showUnlockModal && (
              <UnlockModal
                section={unlockTarget}
                onUnlock={handleUnlock}
                onCancel={handleUnlockCancel}
              />
            )}
          </main>
        </motion.div>
      </DocumentsProvider>
    </ThemeContext.Provider>
  );
}
