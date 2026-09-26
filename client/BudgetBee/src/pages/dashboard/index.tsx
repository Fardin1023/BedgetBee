import {
  useEffect,
  useRef,
  useState,
} from "react";

import { useAuth } from "../../contexts/auth-context";

import { FinancialRecordForm } from "./financial-record-form";

import { FinancialRecordList } from "./financial-record-list";

import { FinancialSummaryChart } from "./financial-summary-chart";

type Theme =
  | "day"
  | "night";

export const Dashboard = () => {
  const {
    user,
    logout,
    updateUser,
    token,
  } = useAuth();

  const [
    theme,
    setTheme,
  ] =
    useState<Theme>(() => {
      const savedTheme =
        localStorage.getItem(
          "budgetBeeTheme"
        );

      if (
        savedTheme === "day" ||
        savedTheme === "night"
      ) {
        return savedTheme;
      }

      return "night";
    });

  const [
    userMenuOpen,
    setUserMenuOpen,
  ] =
    useState(false);

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [editUsername, setEditUsername] = useState(user?.username || "");
  const [editEmail, setEditEmail] = useState(user?.email || "");
  const [editFirstName, setEditFirstName] = useState(user?.firstName || "");
  const [editLastName, setEditLastName] = useState(user?.lastName || "");
  const [editImageUrl, setEditImageUrl] = useState("");
  const [editCurrency, setEditCurrency] = useState(user?.currency || "USD");
  const [editPassword, setEditPassword] = useState("");
  const [settingsError, setSettingsError] = useState("");
  const [settingsSuccess, setSettingsSuccess] = useState("");

  const userMenuRef =
    useRef<HTMLDivElement>(
      null
    );

  useEffect(() => {
    document.documentElement.setAttribute(
      "data-theme",
      theme
    );

    localStorage.setItem(
      "budgetBeeTheme",
      theme
    );
  }, [
    theme,
  ]);

  useEffect(() => {
    const handleOutsideClick = (
      event: MouseEvent
    ) => {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(
          event.target as Node
        )
      ) {
        setUserMenuOpen(
          false
        );
      }
    };

    document.addEventListener(
      "mousedown",
      handleOutsideClick
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleOutsideClick
      );
    };
  }, []);

  const toggleTheme = () => {
    setTheme(
      (
        currentTheme
      ) =>
        currentTheme ===
        "night"
          ? "day"
          : "night"
    );
  };

  const toggleUserMenu = () => {
    setUserMenuOpen(
      (current) =>
        !current
    );
  };

  const firstName =
    user?.username ||
    "User";

  const userInitial =
    firstName
      .charAt(0)
      .toUpperCase();

  const handleProfile = () => {
    setUserMenuOpen(false);
    setIsSettingsOpen(true);
  };

  const handleAccountSettings = () => {
    setUserMenuOpen(false);
    setIsSettingsOpen(true);
  };

  const handleSignOut =
    async () => {
      setUserMenuOpen(
        false
      );

      logout();
    };

  const saveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSettingsError("");
    setSettingsSuccess("");

    try {
      const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";
      const body: any = { 
        username: editUsername, 
        email: editEmail,
        firstName: editFirstName,
        lastName: editLastName,
        currency: editCurrency
      };
      
      // If user typed something in imageUrl field, send it, otherwise keep previous
      if (editImageUrl) {
        body.imageUrl = editImageUrl;
      }
      
      if (editPassword) body.password = editPassword;

      const response = await fetch(`${API_URL}/auth/me`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(body)
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to update profile");
      }

      updateUser(data.user);
      setSettingsSuccess("Profile updated successfully!");
      setEditPassword("");
    } catch (err: any) {
      setSettingsError(err.message);
    }
  };

  return (
    <div className="dashboard-container">
      <style>
        {`
          @keyframes modalOverlayFade {
            from { opacity: 0; backdrop-filter: blur(0px); }
            to { opacity: 1; backdrop-filter: blur(12px); }
          }
          @keyframes modalSlideUp {
            from { opacity: 0; transform: translateY(30px) scale(0.95); }
            to { opacity: 1; transform: translateY(0) scale(1); }
          }
          @keyframes inputStagger {
            from { opacity: 0; transform: translateX(-15px); }
            to { opacity: 1; transform: translateX(0); }
          }
          .settings-overlay-animated {
            animation: modalOverlayFade 0.4s ease-out forwards;
            background: rgba(10, 10, 18, 0.6) !important;
          }
          .settings-modal-animated {
            animation: modalSlideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
            background: rgba(30, 30, 45, 0.7) !important;
            backdrop-filter: blur(20px);
            border: 1px solid rgba(255, 255, 255, 0.1) !important;
            box-shadow: 0 24px 40px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.1) !important;
            position: relative;
            overflow: hidden;
          }
          .settings-modal-animated::before {
            content: '';
            position: absolute;
            top: 0; left: 0; right: 0; height: 3px;
            background: linear-gradient(90deg, #ffb703, #ff007a);
          }
          .settings-input-group {
            opacity: 0;
            animation: inputStagger 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          }
          .settings-input-group:nth-child(1) { animation-delay: 0.1s; }
          .settings-input-group:nth-child(2) { animation-delay: 0.15s; }
          .settings-input-group:nth-child(3) { animation-delay: 0.2s; }
          .settings-input-group:nth-child(4) { animation-delay: 0.25s; }
          .settings-input-group:nth-child(5) { animation-delay: 0.3s; }
          .settings-input-group:nth-child(6) { animation-delay: 0.35s; }
          .settings-input-group:nth-child(7) { animation-delay: 0.4s; }
          
          .trendy-input {
            width: 100%;
            padding: 0.85rem 1rem;
            border-radius: 10px;
            border: 1px solid rgba(255, 255, 255, 0.08) !important;
            background-color: rgba(0, 0, 0, 0.2) !important;
            color: #ffffff !important;
            transition: all 0.3s ease;
            box-sizing: border-box;
            outline: none;
            font-size: 0.95rem;
          }
          .trendy-input:focus {
            border-color: #ffb703 !important;
            background-color: rgba(255, 183, 3, 0.05) !important;
            box-shadow: 0 0 0 4px rgba(255, 183, 3, 0.15);
            transform: translateY(-1px);
          }
          .trendy-label {
            display: block;
            margin-bottom: 0.4rem;
            color: #a0a0b0 !important;
            font-size: 0.85rem;
            font-weight: 500;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          .trendy-btn-cancel {
            flex: 1;
            padding: 0.85rem;
            border-radius: 10px;
            border: 1px solid rgba(255,255,255,0.1) !important;
            background: transparent;
            color: #ffffff;
            cursor: pointer;
            font-weight: 600;
            transition: all 0.2s ease;
          }
          .trendy-btn-cancel:hover {
            background: rgba(255,255,255,0.05);
            transform: translateY(-2px);
          }
          .trendy-btn-save {
            flex: 1.5;
            padding: 0.85rem;
            border-radius: 10px;
            border: none;
            background: linear-gradient(135deg, #ffb703 0%, #ff9e00 100%);
            color: #000000;
            font-weight: 700;
            cursor: pointer;
            transition: all 0.3s ease;
            box-shadow: 0 4px 15px rgba(255, 183, 3, 0.4);
          }
          .trendy-btn-save:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(255, 183, 3, 0.6);
          }
          .trendy-btn-save:active {
            transform: translateY(1px);
          }
        `}
      </style>
      <div className="dashboard-header">
        <div>
          <p className="dashboard-tag">
            <span className="dashboard-tag-icon">
              🐝
            </span>

            BUDGET BEE
          </p>

          <h1>
            Welcome{" "}
            <span className="welcome-name">
              {firstName}
            </span>
            !
          </h1>

          <p className="dashboard-subtitle">
            Track your income and
            expenses in one place.
          </p>
        </div>

        <div className="header-actions">
          <button
            type="button"
            className="theme-toggle"
            onClick={
              toggleTheme
            }
          >
            <span className="theme-toggle-icon">
              {theme ===
              "night"
                ? "☀️"
                : "🌙"}
            </span>

            <span>
              {theme ===
              "night"
                ? "Day Mode"
                : "Night Mode"}
            </span>
          </button>

          <div
            ref={
              userMenuRef
            }
            className={`user-menu ${
              userMenuOpen
                ? "open"
                : ""
            }`}
          >
            <button
              type="button"
              className="user-avatar"
              onClick={
                toggleUserMenu
              }
              aria-label="Open user menu"
              aria-expanded={
                userMenuOpen
              }
            >
              {user?.imageUrl ? (
                <img
                  src={
                    user.imageUrl
                  }
                  alt={
                    firstName
                  }
                  className="user-avatar-image"
                />
              ) : (
                <span>
                  {
                    userInitial
                  }
                </span>
              )}
            </button>

            <div className="user-dropdown">
              <button
                type="button"
                className="user-dropdown-item"
                onClick={
                  handleProfile
                }
              >
                My Profile
              </button>

              <button
                type="button"
                className="user-dropdown-item"
                onClick={
                  handleAccountSettings
                }
              >
                Account Settings
              </button>

              <button
                type="button"
                className="user-dropdown-item signout-option"
                onClick={
                  handleSignOut
                }
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="dashboard-content">
        <FinancialRecordForm />

        <FinancialRecordList />

        <FinancialSummaryChart />
      </div>

      {isSettingsOpen && (
        <div className="modal-overlay settings-overlay-animated" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, overflowY: 'auto' }}>
          <div className="modal-content settings-modal-animated" style={{ padding: '2.5rem', width: '90%', maxWidth: '420px', margin: '2rem 0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <h2 style={{ margin: 0, color: '#ffffff', fontSize: '1.5rem', fontWeight: '700' }}>Profile Settings</h2>
              <button onClick={() => setIsSettingsOpen(false)} style={{ background: 'none', border: 'none', color: '#a0a0b0', cursor: 'pointer', fontSize: '1.5rem', lineHeight: 1 }}>×</button>
            </div>
            
            {settingsError && <div style={{ color: '#ff4d4f', marginBottom: '1.5rem', padding: '0.75rem', backgroundColor: 'rgba(255, 77, 79, 0.1)', borderLeft: '3px solid #ff4d4f', borderRadius: '4px', fontSize: '0.9rem' }}>{settingsError}</div>}
            {settingsSuccess && <div style={{ color: '#52c41a', marginBottom: '1.5rem', padding: '0.75rem', backgroundColor: 'rgba(82, 196, 26, 0.1)', borderLeft: '3px solid #52c41a', borderRadius: '4px', fontSize: '0.9rem' }}>{settingsSuccess}</div>}
            
            <form onSubmit={saveSettings} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <div className="settings-input-group" style={{ flex: 1 }}>
                  <label className="trendy-label">First Name</label>
                  <input 
                    type="text" 
                    value={editFirstName} 
                    onChange={(e) => setEditFirstName(e.target.value)} 
                    className="trendy-input"
                    placeholder="John"
                  />
                </div>
                <div className="settings-input-group" style={{ flex: 1 }}>
                  <label className="trendy-label">Last Name</label>
                  <input 
                    type="text" 
                    value={editLastName} 
                    onChange={(e) => setEditLastName(e.target.value)} 
                    className="trendy-input"
                    placeholder="Doe"
                  />
                </div>
              </div>
              
              <div className="settings-input-group">
                <label className="trendy-label">Username</label>
                <input 
                  type="text" 
                  value={editUsername} 
                  onChange={(e) => setEditUsername(e.target.value)} 
                  className="trendy-input"
                />
              </div>

              <div className="settings-input-group">
                <label className="trendy-label">Email Address</label>
                <input 
                  type="email" 
                  value={editEmail} 
                  onChange={(e) => setEditEmail(e.target.value)} 
                  className="trendy-input"
                />
              </div>

              <div className="settings-input-group">
                <label className="trendy-label">Preferred Currency</label>
                <select 
                  value={editCurrency} 
                  onChange={(e) => setEditCurrency(e.target.value)} 
                  className="trendy-input"
                  style={{ appearance: 'none', cursor: 'pointer' }}
                >
                  <option value="USD" style={{ color: 'black' }}>USD ($)</option>
                  <option value="EUR" style={{ color: 'black' }}>EUR (€)</option>
                  <option value="GBP" style={{ color: 'black' }}>GBP (£)</option>
                  <option value="INR" style={{ color: 'black' }}>INR (₹)</option>
                </select>
              </div>

              <div className="settings-input-group">
                <label className="trendy-label">Custom Avatar URL (Optional)</label>
                <input 
                  type="url" 
                  value={editImageUrl} 
                  onChange={(e) => setEditImageUrl(e.target.value)}
                  placeholder="https://example.com/avatar.png"
                  className="trendy-input"
                />
              </div>

              <div className="settings-input-group">
                <label className="trendy-label">New Password (Optional)</label>
                <input 
                  type="password" 
                  value={editPassword} 
                  onChange={(e) => setEditPassword(e.target.value)} 
                  placeholder="••••••••"
                  className="trendy-input"
                />
              </div>

              <div className="settings-input-group" style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button type="button" onClick={() => setIsSettingsOpen(false)} className="trendy-btn-cancel">Cancel</button>
                <button type="submit" className="trendy-btn-save">Save Changes ✨</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};