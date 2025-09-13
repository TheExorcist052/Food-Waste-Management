import React, { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AppContext = createContext();

// Adjust to your actual backend path
const API_BASE_URL = 'http://localhost/food_for_all/backend.php';

export function AppProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem('food-for-all-user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = (userData) => {
    localStorage.setItem('food-for-all-user', JSON.stringify(userData));
    setUser(userData);
    if (userData.type === 'restaurant') {
      navigate('/dashboard');
    } else {
      navigate('/profile');
    }
  };

  const logout = () => {
    localStorage.removeItem('food-for-all-user');
    setUser(null);
    navigate('/');
  };

  // ✅ Fixed apiCall
  const apiCall = async (action, options = {}) => {
    const { method = 'GET', body = null } = options;

    let url = `${API_BASE_URL}?action=${encodeURIComponent(action)}`;
    let fetchOptions = { method };

    if (method === 'GET' && body) {
      // Append GET params if provided
      const query = new URLSearchParams(body).toString();
      url += `&${query}`;
    } else if (method !== 'GET' && body) {
      // Handle FormData vs JSON
      if (body instanceof FormData) {
        fetchOptions.body = body;
      } else {
        fetchOptions.headers = { 'Content-Type': 'application/json' };
        fetchOptions.body = JSON.stringify(body);
      }
    }

    try {
      const response = await fetch(url, fetchOptions);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API call failed for action: ${action}`, error);
      return { success: false, message: error.message || 'An unexpected error occurred.' };
    }
  };

  const value = {
    user,
    setUser,
    loading,
    login,
    logout,
    apiCall,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export const useApp = () => useContext(AppContext);
