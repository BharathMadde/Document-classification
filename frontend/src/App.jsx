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

const ThemeContext = createContext();

export const useTheme = () => useContext(ThemeContext);

export default function App() {
  const [currentPage, setCurrentPage] = useState("overview");
  const [theme, setTheme] = useState("system");

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

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      <DocumentsProvider>
        <motion.div
          className="app"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          <Sidebar currentPage={currentPage} setCurrentPage={setCurrentPage} />
          <main className="main-content">
            <motion.div
              className="header-bar"
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              <ThemeToggle theme={theme} setTheme={setTheme} />
            </motion.div>
            {renderPage()}
          </main>
        </motion.div>
      </DocumentsProvider>
    </ThemeContext.Provider>
  );
}
