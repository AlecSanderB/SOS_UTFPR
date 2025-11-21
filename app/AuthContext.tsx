import React, { createContext, useContext, useState } from "react";

type AuthContextType = {
  token: string | null;
  userId: string | null;
  setAuth: (token: string | null, userId: string | null) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType>({
  token: null,
  userId: null,
  setAuth: () => {},
  logout: () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [token, setToken] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  const setAuth = (t: string | null, u: string | null) => {
    setToken(t);
    setUserId(u);
  };

  const logout = () => {
    setToken(null);
    setUserId(null);
  };

  return (
    <AuthContext.Provider value={{ token, userId, setAuth, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);