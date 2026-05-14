import React, { createContext, useContext, useEffect, useState } from "react";
import { useGetMe } from "@workspace/api-client-react";
import type { User } from "@workspace/api-client-react/schemas";

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  isAuthenticated: false,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const { data: user, isLoading, isError } = useGetMe({
    query: {
      retry: false,
      refetchOnWindowFocus: false,
      queryKey: ["/api/auth/me"]
    }
  } as any);

  const isAuthenticated = !!user && !isError;

  return (
    <AuthContext.Provider value={{
      user: isAuthenticated ? user : null,
      isLoading,
      isAuthenticated,
    }}>
      {children}
    </AuthContext.Provider>
  );
};
