"use client";

import { useEffect, useState } from "react";

const API_URL = "http://localhost:8000/api/v1";

/**
 * Gets a fresh access token using the stored refresh token.
 * If the refresh token is invalid, signs the user out.
 */
export async function getAccessToken(): Promise<string | null> {
  const refreshToken = typeof window !== "undefined" ? localStorage.getItem("chatiq_refresh_token") : null;
  
  if (!refreshToken) return null;

  try {
    const response = await fetch(`${API_URL}/auth/token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });

    if (!response.ok) {
      throw new Error("Failed to refresh token");
    }

    const data = await response.json();
    
    // The backend might return new refresh token too, save it if it exists
    if (data.refresh_token) {
      localStorage.setItem("chatiq_refresh_token", data.refresh_token);
    }
    
    return data.access_token;
  } catch (error) {
    console.error("Error refreshing token:", error);
    if (typeof window !== "undefined") {
      localStorage.removeItem("chatiq_refresh_token");
      window.location.href = "/login";
    }
    return null;
  }
}

/**
 * React hook to manage authentication state
 */
export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAuth = () => {
      const token = typeof window !== "undefined" ? localStorage.getItem("chatiq_refresh_token") : null;
      setIsAuthenticated(!!token);
    };

    checkAuth();
  }, []);

  const logout = async () => {
    try {
      // Optional: Call backend logout if required
      await fetch(`${API_URL}/auth/logout`, { method: "POST" });
    } catch {
      // Ignore errors on logout
    } finally {
      if (typeof window !== "undefined") {
        localStorage.removeItem("chatiq_refresh_token");
        window.location.href = "/login";
      }
    }
  };

  return { isAuthenticated, logout };
}

/**
 * Helper to make API calls with the JWT token automatically attached
 */
export async function fetchWithAuth(endpoint: string, options: RequestInit = {}) {
  const token = await getAccessToken();
  
  const headers = new Headers(options.headers);
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  // Auto add content-type for JSON if not FormData and not set
  if (!headers.has("Content-Type") && !(options.body instanceof FormData)) {
      headers.set("Content-Type", "application/json");
  }

  return fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });
}
