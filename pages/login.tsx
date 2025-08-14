import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../helpers/useAuth";
import { PasswordLoginForm } from "../components/PasswordLoginForm";
import { OAuthButtonGroup } from "../components/OAuthButtonGroup";
import { AuthLoadingState } from "../components/AuthLoadingState";
import { Button } from "../components/Button";
import styles from "./login.module.css";
import { Helmet } from "react-helmet";
import { LogOut, User } from "lucide-react";

export default function LoginPage() {
  const { authState, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  if (authState.type === "loading") {
    return <AuthLoadingState title="Checking session..." />;
  }

  return (
    <>
      <Helmet>
        <title>Login | Floot</title>
        <meta name="description" content="Log in to your Floot account." />
      </Helmet>
      <div className={styles.container}>
        <div className={styles.loginCard}>
          {authState.type === "authenticated" && (
            <div className={styles.authenticatedBanner}>
              <div className={styles.bannerContent}>
                <User className={styles.bannerIcon} />
                <div className={styles.bannerText}>
                  <p className={styles.bannerTitle}>Already signed in</p>
                  <p className={styles.bannerSubtitle}>
                    You're currently logged in as {authState.user.displayName}
                  </p>
                </div>
              </div>
              <div className={styles.bannerActions}>
                <Link to="/" className={styles.bannerLink}>
                  Go to Dashboard
                </Link>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLogout}
                  className={styles.logoutButton}
                >
                  <LogOut size={16} />
                  Logout
                </Button>
              </div>
            </div>
          )}

          <div className={styles.header}>
            <h1 className={styles.title}>Welcome Back</h1>
            <p className={styles.subtitle}>
              Sign in to access your AI-powered personal assistant.
            </p>
          </div>

          <PasswordLoginForm />

          <div className={styles.separator}>
            <span className={styles.separatorText}>OR</span>
          </div>

          <OAuthButtonGroup />

          <p className={styles.footerText}>
            Don't have an account?{" "}
            <Link to="/register" className={styles.link}>
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </>
  );
}