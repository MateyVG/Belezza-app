import React, { createContext, useContext, useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const AuthContext = createContext();

// Суупабейс конфигурация
const supabaseUrl = 'https://lnquyopfvuikhjbjsiqk.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxucXV5b3BmdnVpa2hqYmpzaXFrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU0ODA5MDEsImV4cCI6MjA2MTA1NjkwMX0.GmZ-5FzZkJyMorLGggF_Jegx2Atn0wRiNKCx4esecJw';
const supabase = createClient(supabaseUrl, supabaseKey);

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Проверка за съществуваща сесия
    const getSession = async () => {
      const { data, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Грешка при извличане на сесия:', error.message);
      } else if (data?.session?.user) {
        setUser(data.session.user);
        // Опит за извличане на ролята на потребителя
        fetchUserRole(data.session.user.id);
      }
      
      setLoading(false);
    };

    getSession();

    // Слушател за промени в аутентикацията
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          setUser(session.user);
          fetchUserRole(session.user.id);
        } else {
          setUser(null);
          setUserRole(null);
        }
        setLoading(false);
      }
    );

    return () => {
      if (authListener && typeof authListener.unsubscribe === 'function') {
        authListener.unsubscribe();
      }
    };
  }, []);

  const fetchUserRole = async (userId) => {
    try {
      // Премахнете метода .single()
      const { data, error } = await supabase
        .from('user_roles')
        .select('*')
        .eq('user_id', userId);
  
      if (error) {
        console.error('Грешка при извличане на ролята:', error.message);
      } else if (data && data.length > 0) {
        // Вземаме първия запис от масива
        setUserRole(data[0]);
        console.log('Успешно извлечена роля:', data[0]);
      } else {
        console.log('Не е намерена роля за потребителя');
      }
    } catch (error) {
      console.error('Грешка:', error.message);
    }
  };

  const signIn = async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  };

  const signUp = async (email, password, userData) => {
    try {
      // Регистрация на потребител
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: userData,
        },
      });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      return { error: null };
    } catch (error) {
      return { error };
    }
  };

  // Добавени функции за админ панела
  const isSuperAdmin = () => {
    console.log('Проверка за super_admin, userRole:', userRole);
    return userRole?.role === 'super_admin';
  };
  
  const isRestaurantAdmin = () => {
    console.log('Проверка за restaurant_admin, userRole:', userRole);
    return userRole?.role === 'restaurant_admin';
  };

  const value = {
    user,
    userRole,
    signIn,
    signUp,
    signOut,
    loading,
    isSuperAdmin,      // Добавена функция
    isRestaurantAdmin, // Добавена функция
    supabase,          // Експортиране на supabase клиента, нужен в админ панела
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading ? children : <div>Зареждане...</div>}
    </AuthContext.Provider>
  );
}