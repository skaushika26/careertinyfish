import React, { useState } from 'react'
import { Outlet, NavLink, useLocation } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import './Layout.css'

const navItems = [
  { to: '/dashboard', icon: 'dashboard', label: 'Dashboard' },
  { to: '/resume/upload', icon: 'upload_file', label: 'Upload Resume' },
  { to: '/resume/build', icon: 'edit_document', label: 'Resume Builder' },
  { to: '/jobs', icon: 'work', label: 'Job Board' },
  { to: '/applications', icon: 'assignment', label: 'Applications' },
  { to: '/portfolio', icon: 'web', label: 'Portfolio' },
]

export default function Layout() {
  const [collapsed, setCollapsed] = useState(false)
  const { resume } = useApp()

  return (
    <div className={`layout ${collapsed ? 'layout-collapsed' : ''}`}>
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="logo">
            <span className="material-icons logo-icon">auto_awesome</span>
            {!collapsed && <span className="logo-text">CareerForge<span className="logo-ai"> AI</span></span>}
          </div>
          <button className="collapse-btn" onClick={() => setCollapsed(!collapsed)}>
            <span className="material-icons">{collapsed ? 'chevron_right' : 'chevron_left'}</span>
          </button>
        </div>

        {resume && !collapsed && (
          <div className="resume-indicator">
            <span className="material-icons">check_circle</span>
            <div>
              <div className="resume-name">{resume.parsedData?.name || 'Resume loaded'}</div>
              <div className="resume-sub">Resume active</div>
            </div>
          </div>
        )}

        <nav className="sidebar-nav">
          {navItems.map(item => (
            <NavLink key={item.to} to={item.to} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <span className="material-icons">{item.icon}</span>
              {!collapsed && <span>{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          {!collapsed && (
            <div className="ai-badge">
              <span className="material-icons">bolt</span>
              TinyFish AI
            </div>
          )}
        </div>
      </aside>

      <main className="main-content">
        <Outlet />
      </main>
    </div>
  )
}
