import React, { createContext, useState, useEffect, useContext } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load user profile on startup or token change
  useEffect(() => {
    const fetchProfile = async () => {
      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const res = await fetch('/api/auth/profile', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();

        if (res.ok) {
          setUser(data);
          setError(null);
        } else {
          // Token expired or invalid
          logout();
          setError(data.message || 'Session expired');
        }
      } catch (err) {
        console.error('Fetch profile error:', err);
        setError('Network error loading profile');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [token]);

  // Register User
  const register = async (name, email, password) => {
    setError(null);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem('token', data.token);
        setToken(data.token);
        setUser({
          _id: data._id,
          name: data.name,
          email: data.email,
          role: data.role,
          phone: data.phone,
          address: data.address,
        });
        return { success: true };
      } else {
        setError(data.message || 'Registration failed');
        return { success: false, message: data.message };
      }
    } catch (err) {
      setError('Network error during registration');
      return { success: false, message: 'Network error' };
    }
  };

  // Login User
  const login = async (email, password) => {
    setError(null);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem('token', data.token);
        setToken(data.token);
        setUser({
          _id: data._id,
          name: data.name,
          email: data.email,
          role: data.role,
          phone: data.phone,
          address: data.address,
        });
        return { success: true };
      } else {
        setError(data.message || 'Login failed');
        return { success: false, message: data.message };
      }
    } catch (err) {
      setError('Network error during login');
      return { success: false, message: 'Network error' };
    }
  };

  // Logout User
  const logout = () => {
    localStorage.removeItem('token');
    setToken('');
    setUser(null);
    setError(null);
  };

  // Update Profile
  const updateProfile = async (profileData) => {
    setError(null);
    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(profileData),
      });

      const data = await res.json();

      if (res.ok) {
        setUser(data);
        return { success: true };
      } else {
        setError(data.message || 'Failed to update profile');
        return { success: false, message: data.message };
      }
    } catch (err) {
      setError('Network error during profile update');
      return { success: false, message: 'Network error' };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        error,
        register,
        login,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
