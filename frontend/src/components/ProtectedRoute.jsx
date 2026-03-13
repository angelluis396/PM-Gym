import { useAuth } from "../context/AuthContext";

/**
 * Wrap any page with this to require authentication.
 * Unauthenticated users are redirected to /login.
 *
 * Usage in App.jsx:
 *   <ProtectedRoute><Profile /></ProtectedRoute>
 */
export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  // Still checking auth state — show nothing to avoid flash of content
  if (loading) {
    return (
      <div style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)",
        color: "#94a3b8",
        fontSize: 16,
        fontFamily: "'Inter', sans-serif",
      }}>
        Loading...
      </div>
    );
  }

  // Not logged in — redirect to login page
  if (!user) {
    window.location.href = "/login";
    return null;
  }

  // Logged in — render the protected page
  return children;
}
