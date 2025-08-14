import React from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet";
import { useAuth } from "../helpers/useAuth";
import { PasswordRegisterForm } from "../components/PasswordRegisterForm";
import { OAuthButtonGroup } from "../components/OAuthButtonGroup";
import { AuthLoadingState } from "../components/AuthLoadingState";
import { Button } from "../components/Button";
import styles from "./register.module.css";
import { LogOut, User } from "lucide-react";

export default function RegisterPage() {
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
        <title>Register | OmniPA</title>
        <meta
          name="description"
          content="Create an account for OmniPA and start simplifying your life with AI."
        />
      </Helmet>
      <div className={styles.container}>
        <div className={styles.backgroundPattern}></div>
        <div className={styles.registerCard}>
          <div className={styles.cardGlow}></div>
          <div className={styles.cardContent}>
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
              <div className={styles.logoContainer}>
                <div className={styles.logo}>
                  <span className={styles.logoText}>OmniPA</span>
                </div>
              </div>
              <h1 className={styles.title}>Create Your Account</h1>
              <p className={styles.subtitle}>
                Join thousands of users who are already boosting their productivity with AI-powered assistance.
              </p>
            </div>
            
            <div className={styles.formSection}>
              <PasswordRegisterForm />
              
              <div className={styles.separator}>
                <div className={styles.separatorLine}></div>
                <span className={styles.separatorText}>OR</span>
                <div className={styles.separatorLine}></div>
              </div>
              
              <OAuthButtonGroup />
            </div>
            
            <div className={styles.footer}>
              <p className={styles.footerText}>
                Already have an account?{" "}
                <Link to="/login" className={styles.link}>
                  Sign in here
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}