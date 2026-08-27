import "./App.css";

import {
  BrowserRouter as Router,
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import {
  useUser,
} from "@clerk/react";

import {
  Dashboard,
} from "./pages/dashboard";

import {
  Auth,
} from "./pages/auth";

import {
  FinancialRecordProvider,
} from "./contexts/financial-record-context";

/* ======================================== */
/* PROTECTED DASHBOARD                      */
/* ======================================== */

const ProtectedDashboard = () => {
  const {
    isLoaded,
    isSignedIn,
  } = useUser();

  /* Wait until Clerk knows
     whether the user is signed in */
  if (!isLoaded) {
    return (
      <div className="auth-loading-screen">
        <div className="auth-loading-bee">
          🐝
        </div>

        <p>
          Loading BudgetBee...
        </p>
      </div>
    );
  }

  /* Not signed in -> Auth page */
  if (!isSignedIn) {
    return (
      <Navigate
        to="/auth"
        replace
      />
    );
  }

  /* Signed in -> Dashboard */
  return (
    <FinancialRecordProvider>
      <Dashboard />
    </FinancialRecordProvider>
  );
};

/* ======================================== */
/* AUTH ROUTE                               */
/* ======================================== */

const AuthRoute = () => {
  const {
    isLoaded,
    isSignedIn,
  } = useUser();

  if (!isLoaded) {
    return (
      <div className="auth-loading-screen">
        <div className="auth-loading-bee">
          🐝
        </div>

        <p>
          Loading BudgetBee...
        </p>
      </div>
    );
  }

  /* Already signed in?
     Don't show login again. */
  if (isSignedIn) {
    return (
      <Navigate
        to="/"
        replace
      />
    );
  }

  return <Auth />;
};

/* ======================================== */
/* APP                                      */
/* ======================================== */

function App() {
  return (
    <Router>
      <div className="app-container">
        <Routes>
          <Route
            path="/"
            element={
              <ProtectedDashboard />
            }
          />

          <Route
            path="/auth"
            element={
              <AuthRoute />
            }
          />

          {/* Unknown URL */}
          <Route
            path="*"
            element={
              <Navigate
                to="/"
                replace
              />
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;