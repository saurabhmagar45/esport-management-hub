import React, { createContext, useState, useEffect, useContext } from 'react';
import { storage } from '../utils/storage';
import { authAPI } from '../api/auth';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [coins, setCoins] = useState(500); // Gaming coin wallet balance

  // Boot: Check existing stored token
  useEffect(() => {
    const loadStoredAuth = async () => {
      try {
        const storedToken = await storage.getToken();
        const storedUser = await storage.getUser();

        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(storedUser);
          if (storedUser.coins !== undefined) {
            setCoins(storedUser.coins);
          }

          // Fetch fresh profile in background
          try {
            const res = await authAPI.getMe();
            if (res.data && res.data.user) {
              setUser(res.data.user);
              if (res.data.user.coins !== undefined) {
                setCoins(res.data.user.coins);
              }
              await storage.saveUser(res.data.user);
            }
          } catch (e) {
            console.log('Background auth refresh skipped');
          }
        }
      } catch (e) {
        console.error('Error loading stored auth', e);
      } finally {
        setIsLoading(false);
      }
    };

    loadStoredAuth();
  }, []);

  const login = async (email, password) => {
    const res = await authAPI.login(email, password);
    if (res.data && res.data.token && res.data.user) {
      const authToken = res.data.token;
      const authUser = res.data.user;

      setToken(authToken);
      setUser(authUser);
      if (authUser.coins !== undefined) {
        setCoins(authUser.coins);
      }

      await storage.saveToken(authToken);
      await storage.saveUser(authUser);
      return authUser;
    }
    throw new Error(res.data?.message || 'Login failed');
  };

  const register = async (data) => {
    const res = await authAPI.register(data);
    if (res.data && res.data.token && res.data.user) {
      const authToken = res.data.token;
      const authUser = res.data.user;

      setToken(authToken);
      setUser(authUser);
      if (authUser.coins !== undefined) {
        setCoins(authUser.coins);
      }

      await storage.saveToken(authToken);
      await storage.saveUser(authUser);
      return authUser;
    }
    throw new Error(res.data?.message || 'Registration failed');
  };

  const logout = async () => {
    try {
      await storage.clearAll();
      setToken(null);
      setUser(null);
    } catch (e) {
      console.error('Error during logout', e);
    }
  };

  const refreshUser = async () => {
    try {
      const res = await authAPI.getMe();
      if (res.data && res.data.user) {
        setUser(res.data.user);
        if (res.data.user.coins !== undefined) {
          setCoins(res.data.user.coins);
        }
        await storage.saveUser(res.data.user);
      }
    } catch (e) {
      console.log('Could not refresh user', e.message);
    }
  };

  const addCoins = (amount) => {
    setCoins((prev) => {
      const updated = prev + amount;
      if (user) {
        const updatedUser = { ...user, coins: updated };
        setUser(updatedUser);
        storage.saveUser(updatedUser);
      }
      return updated;
    });
  };

  const deductCoins = (amount) => {
    if (coins < amount) return false;
    setCoins((prev) => {
      const updated = Math.max(0, prev - amount);
      if (user) {
        const updatedUser = { ...user, coins: updated };
        setUser(updatedUser);
        storage.saveUser(updatedUser);
      }
      return updated;
    });
    return true;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token,
        isLoading,
        coins,
        login,
        register,
        logout,
        refreshUser,
        addCoins,
        deductCoins,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
