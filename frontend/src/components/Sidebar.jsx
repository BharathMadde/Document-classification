import React from 'react';
import { motion } from 'framer-motion';

export default function Sidebar({ currentPage, setCurrentPage }) {
  const navItems = [
    { id: 'overview', label: 'Overview', icon: '🏠' },
    { id: 'ingest', label: 'Ingest', icon: '⬆️' },
    { id: 'extract', label: 'Extract', icon: '🔍' },
    { id: 'classify', label: 'Classify', icon: '🧠' },
    { id: 'route', label: 'Route', icon: '🚀' },
    { id: 'analytics', label: 'Analytics', icon: '📊' },
    { id: 'human', label: 'Human Intervention', icon: '🧑‍💼' }
  ];

  const sidebarVariants = {
    hidden: { x: -300, opacity: 0 },
    visible: { 
      x: 0, 
      opacity: 1,
      transition: {
        duration: 0.6,
        ease: "easeOut",
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { x: -50, opacity: 0 },
    visible: { 
      x: 0, 
      opacity: 1,
      transition: {
        duration: 0.4,
        ease: "easeOut"
      }
    }
  };

  const logoVariants = {
    hidden: { scale: 0, opacity: 0 },
    visible: { 
      scale: 1, 
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut",
        delay: 0.2
      }
    }
  };

  return (
    <motion.div 
      className="sidebar"
      variants={sidebarVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div className="sidebar-header" variants={itemVariants}>
        <motion.div className="logo" variants={logoVariants}>
          <motion.div 
            className="logo-icon"
            whileHover={{ 
              scale: 1.1, 
              rotate: 360,
              transition: { duration: 0.8 }
            }}
            whileTap={{ scale: 0.95 }}
          >
            🤖
          </motion.div>
          <motion.span
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            DocumentDigger-AI
          </motion.span>
        </motion.div>
      </motion.div>

      <motion.nav className="nav-menu" variants={itemVariants}>
        {navItems.map((item, index) => (
          <motion.button
            key={item.id}
            className={`nav-item ${currentPage === item.id ? 'active' : ''}`}
            onClick={() => setCurrentPage(item.id)}
            variants={itemVariants}
            whileHover={{ 
              x: 8,
              transition: { duration: 0.2 }
            }}
            whileTap={{ scale: 0.98 }}
            initial={{ x: -50, opacity: 0 }}
            animate={{ 
              x: 0, 
              opacity: 1,
              transition: {
                delay: 0.3 + index * 0.1,
                duration: 0.4,
                ease: "easeOut"
              }
            }}
          >
            <motion.span 
              className="nav-icon"
              whileHover={{ scale: 1.2 }}
              transition={{ duration: 0.2 }}
            >
              {item.icon}
            </motion.span>
            {item.label}
          </motion.button>
        ))}
      </motion.nav>
    </motion.div>
  );
}