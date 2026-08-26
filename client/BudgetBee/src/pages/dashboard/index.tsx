import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  useClerk,
  useUser,
} from "@clerk/react";

import { FinancialRecordForm } from "./financial-record-form";

import { FinancialRecordList } from "./financial-record-list";

import { FinancialSummaryChart } from "./financial-summary-chart";

type Theme =
  | "day"
  | "night";

export const Dashboard = () => {
  const {
    user,
  } =
    useUser();

  const {
    signOut,
    openUserProfile,
  } =
    useClerk();

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
    user?.firstName ||
    "User";

  const userInitial =
    firstName
      .charAt(0)
      .toUpperCase();

  const handleProfile = () => {
    setUserMenuOpen(
      false
    );

    openUserProfile();
  };

  const handleAccountSettings =
    () => {
      setUserMenuOpen(
        false
      );

      openUserProfile();
    };

  const handleSignOut =
    async () => {
      setUserMenuOpen(
        false
      );

      await signOut({
        redirectUrl:
          "/auth",
      });
    };

  return (
    <div className="dashboard-container">
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
    </div>
  );
};