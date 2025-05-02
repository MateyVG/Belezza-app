import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';
import { useAuth } from '../context/AuthContext';

// Останалият код...

const supabaseUrl = 'https://lnquyopfvuikhjbjsiqk.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxucXV5b3BmdnVpa2hqYmpzaXFrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU0ODA5MDEsImV4cCI6MjA2MTA1NjkwMX0.GmZ-5FzZkJyMorLGggF_Jegx2Atn0wRiNKCx4esecJw';
const supabase = createClient(supabaseUrl, supabaseKey);

function UserDashboard() {
  const { user } = useAuth();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        if (!user) return;

        // Получаване на потребителски данни от профила
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error) throw error;
        setUserData(data);
      } catch (error) {
        console.error('Грешка при зареждане на потребителски данни:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [user]);

  if (loading) {
    return <div className="loading">Зареждане...</div>;
  }

  return (
    <div className="user-dashboard-container">
      <h1>Добре дошли, {userData?.full_name || user?.email}</h1>
      
      <div className="dashboard-cards">
        <div className="dashboard-card">
          <h2>Моите резервации</h2>
          <p>Управлявайте вашите резервации</p>
          <Link to="/user/reservations" className="dashboard-link">Преглед</Link>
        </div>
        
        <div className="dashboard-card">
          <h2>Любими ресторанти</h2>
          <p>Вижте вашите любими ресторанти</p>
          <Link to="/user/favorites" className="dashboard-link">Преглед</Link>
        </div>
        
        <div className="dashboard-card">
          <h2>Моят профил</h2>
          <p>Редактирайте профилната си информация</p>
          <Link to="/profile" className="dashboard-link">Редактиране</Link>
        </div>
      </div>
    </div>
  );
}

export default UserDashboard;
