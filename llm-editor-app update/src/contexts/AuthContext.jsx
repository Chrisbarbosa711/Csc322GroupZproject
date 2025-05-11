import { createContext, useState, useContext, useEffect } from 'react';
import { useFetchUser } from '../costumeQuerys/userQuery';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));
  const { data: userInfo, isLoading, isError, error } = useFetchUser();

  // if userInfo is not found, logout
  useEffect(() => {
    if (isError && isAuthenticated) {
      console.error('Failed to fetch user data:', error);
      logout();
    }
  }, [isError, error]);

  const logout = () => {
    localStorage.removeItem("token");
    setIsAuthenticated(false);
  };

  const tokenAmount = userInfo?.tokens || 0;
  const canUseFree = userInfo?.role === 'free' || !userInfo;

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        setIsAuthenticated,
        logout,
        userInfo,
        isLoadingUser: isLoading,
        tokenAmount,
        canUseFree
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within a AuthProvider');
  }
  return context;
}