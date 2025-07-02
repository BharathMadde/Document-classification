import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock } from 'lucide-react';

export default function Sidebar({ currentPage, setCurrentPage, lockedSections = [] }) {
  const [collapsed, setCollapsed] = useState(false);
  const navItems = [
    { id: 'overview', label: 'Overview', icon: '🏠' },
    { id: 'ingest', label: 'Ingest', icon: '⬆️' },
    { id: 'extract', label: 'Extract', icon: '🔍' },
    { id: 'classify', label: 'Classify', icon: '🧠' },
    { id: 'route', label: 'Route', icon: '🚀' },
    { id: 'human', label: 'Human Intervention', icon: '🧑‍💼' },
    { id: 'analytics', label: 'Analytics', icon: '📊' },
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
      className={`sidebar${collapsed ? ' collapsed' : ''}`}
      variants={sidebarVariants}
      initial="hidden"
      animate="visible"
      style={{ width: collapsed ? 72 : 290, transition: 'width 0.3s cubic-bezier(.4,0,.2,1)' }}
    >
      <motion.div className="sidebar-header" variants={itemVariants} style={{ display: 'flex', justifyContent: collapsed ? 'center' : 'flex-start', alignItems: 'center', padding: collapsed ? '24px 0 32px' : '0 24px 32px' }}>
        <motion.div className="logo" variants={logoVariants} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: collapsed ? 'center' : 'flex-start', width: '100%' }} onClick={() => setCollapsed(c => !c)}>
          <motion.div 
            className="logo-icon"
            whileHover={{ 
              scale: 1.1, 
              rotate: 360,
              transition: { duration: 0.8 }
            }}
            whileTap={{ scale: 0.95 }}
            style={{ margin: collapsed ? '0 auto' : '0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            🤖
          </motion.div>
          {!collapsed && (
            <motion.span
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}              style={{
                whiteSpace: 'nowrap',
                marginLeft: 10,
                fontWeight: 700,
                maxWidth: 290,
                overflow: 'visible',
                textOverflow: 'unset',
                display: 'inline-block',
                verticalAlign: 'middle',
              }}
            >
              DocumentDigger-AI
            </motion.span>
          )}
        </motion.div>
      </motion.div>

      <motion.nav className="nav-menu" variants={itemVariants} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        {navItems.map((item, index) => {
          const isLocked = lockedSections.includes(item.id);
          const isActive = currentPage === item.id;
          return (
            <motion.button
              key={item.id}
              className={`nav-item${isActive ? ' active' : ''}`}
              onClick={() => setCurrentPage(item.id)}
              variants={itemVariants}
              whileHover={isLocked ? {} : { x: 8, transition: { duration: 0.2 } }}
              whileTap={isLocked ? {} : { scale: 0.98 }}
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
              style={{
                opacity: isLocked ? 0.5 : 1,
                cursor: isLocked ? 'not-allowed' : 'pointer',
                position: 'relative',
                width: '100%',
                justifyContent: collapsed ? 'center' : 'flex-start',
                padding: collapsed ? '16px 0' : '16px 16px',
                borderRadius: isActive ? (collapsed ? '16px' : '16px') : '8px',
                background: isActive ? (collapsed ? 'var(--accent-primary, #2563eb)' : 'var(--accent-primary, #2563eb)') : 'none',
                color: isActive ? '#fff' : 'var(--sidebar-text)',
                marginBottom: 8,
                minWidth: 0,
                maxWidth: '100%',
                transition: 'all 0.2s',
              }}
            >
              <motion.span 
                className="nav-icon"
                whileHover={isLocked ? {} : { scale: 1.2 }}
                transition={{ duration: 0.2 }}
                style={{ marginRight: collapsed ? 0 : 12, justifyContent: 'center', width: 24, display: 'flex', alignItems: 'center' }}
              >
                {item.icon}
              </motion.span>
              {!collapsed && (
                <span
                  style={{
                    fontSize: '1.3em',
                    fontWeight: 840,
                    verticalAlign: 'middle',
                  }}
                >
                  {item.label}
                </span>
              )}
              {isLocked && <Lock size={16} style={{ marginLeft: 8, color: '#2563eb', verticalAlign: 'middle' }} />}
            </motion.button>
          );
        })}
      </motion.nav>
    </motion.div>
  );
}