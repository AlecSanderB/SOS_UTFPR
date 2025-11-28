import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "./supabase";

type AuthContextType = {
  token: string | null;
  refreshToken: string | null;
  userId: string | null;
  loaded: boolean;
  setAuth: (
    accessToken: string,
    refreshToken: string,
    userId: string,
    expiresIn?: number
  ) => Promise<void>;
  logout: () => Promise<void>;
};

const STORAGE_KEY_TOKEN = "@auth_token";
const STORAGE_KEY_REFRESH = "@auth_refresh";
const STORAGE_KEY_USERID = "@auth_userId";
const STORAGE_KEY_EXPIRY = "@auth_expiry";

const AuthContext = createContext<AuthContextType>({
  token: null,
  refreshToken: null,
  userId: null,
  loaded: false,
  setAuth: async () => {},
  logout: async () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [token, setToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const loadAuth = async () => {
      try {
        const values = await AsyncStorage.multiGet([
          STORAGE_KEY_TOKEN,
          STORAGE_KEY_REFRESH,
          STORAGE_KEY_USERID,
          STORAGE_KEY_EXPIRY,
        ]);

        const [storedToken, storedRefresh, storedUserId, storedExpiry] = values.map(
          ([, value]) => value
        );

        const now = Date.now();
        const expiry = storedExpiry ? parseInt(storedExpiry, 10) : null;

        if (!storedToken || !storedRefresh || !storedUserId || (expiry && expiry <= now)) {
          await clearStorage();
        } else {
          setToken(storedToken);
          setRefreshToken(storedRefresh);
          setUserId(storedUserId);

          const { error } = await supabase.auth.setSession({
            access_token: storedToken,
            refresh_token: storedRefresh,
          });
          if (error) {
            console.error("[Auth] Error restoring Supabase session:", error);
            await clearStorage();
          }
        }
      } catch (err) {
        console.error("[Auth] Failed to load auth from storage:", err);
      } finally {
        setLoaded(true);
      }
    };

    loadAuth();
  }, []);

  const setAuth = async (
    accessToken: string,
    refreshTokenValue: string,
    uId: string,
    expiresIn?: number
  ) => {
    try {
      const items: [string, string][] = [
        [STORAGE_KEY_TOKEN, accessToken],
        [STORAGE_KEY_REFRESH, refreshTokenValue],
        [STORAGE_KEY_USERID, uId],
      ];

      if (expiresIn) {
        const expiry = Date.now() + expiresIn * 1000;
        items.push([STORAGE_KEY_EXPIRY, expiry.toString()]);
      } else {
        await AsyncStorage.removeItem(STORAGE_KEY_EXPIRY);
      }

      await AsyncStorage.multiSet(items);

      setToken(accessToken);
      setRefreshToken(refreshTokenValue);
      setUserId(uId);

      const { error } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshTokenValue,
      });
      if (error) console.error("[Auth] Error setting Supabase session:", error);
    } catch (err) {
      console.error("[Auth] Failed to save auth to storage", err);
    }
  };

  const clearStorage = async () => {
    try {
      await AsyncStorage.multiRemove([
        STORAGE_KEY_TOKEN,
        STORAGE_KEY_REFRESH,
        STORAGE_KEY_USERID,
        STORAGE_KEY_EXPIRY,
      ]);
      setToken(null);
      setRefreshToken(null);
      setUserId(null);
      await supabase.auth.signOut();
    } catch (err) {
      console.error("[Auth] Failed to clear auth storage", err);
    }
  };

  const logout = async () => {
    await clearStorage();
  };

  return (
    <AuthContext.Provider value={{ token, refreshToken, userId, loaded, setAuth, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);