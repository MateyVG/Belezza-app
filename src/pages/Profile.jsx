import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';
import { useAuth } from '../context/AuthContext';
import '../styles/Admin.css';

const supabaseUrl = 'https://lnquyopfvuikhjbjsiqk.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxucXV5b3BmdnVpa2hqYmpzaXFrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU0ODA5MDEsImV4cCI6MjA2MTA1NjkwMX0.GmZ-5FzZkJyMorLGggF_Jegx2Atn0wRiNKCx4esecJw';
const supabase = createClient(supabaseUrl, supabaseKey);

function Profile() {
  const { user } = useAuth();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        
        // Проверка дали имаме потребител
        if (!user) return;
        
        // Зареждане на профилни данни
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        
        if (error && error.code !== 'PGRST116') {
          throw error;
        }
        
        if (data) {
          setName(data.full_name || '');
          setPhone(data.phone || '');
        }
      } catch (error) {
        console.error('Грешка при зареждане на профила:', error);
        setError('Възникна грешка при зареждане на вашия профил');
      } finally {
        setLoading(false);
      }
    };
    
    fetchProfile();
  }, [user]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    
    try {
      setUpdating(true);
      setError(null);
      setSuccess(false);
      
      // Актуализиране или създаване на профилни данни
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          full_name: name,
          phone: phone,
          updated_at: new Date()
        });
      
      if (error) throw error;
      
      setSuccess(true);
    } catch (error) {
      console.error('Грешка при актуализиране на профила:', error);
      setError('Възникна грешка при запазване на данните');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return <div style={{ padding: '20px', textAlign: 'center', color: '#e0e0e0' }}>Зареждане на профил...</div>;
  }

  return (
    <div className="auth-container">
      <div className="auth-card" style={{ maxWidth: '600px' }}>
        <h1>Моят профил</h1>
        
        {error && <div className="auth-error">{error}</div>}
        {success && (
          <div style={{
            backgroundColor: '#1e392a',
            color: '#4cd964',
            padding: '15px',
            borderRadius: '8px',
            marginBottom: '20px',
            border: '1px solid #2a6239'
          }}>
            Профилът беше актуализиран успешно!
          </div>
        )}
        
        <form onSubmit={handleUpdate} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email" 
              value={user?.email || ''}
              disabled
              className="disabled-input"
            />
            <small style={{ color: '#aaaaaa', marginTop: '5px', display: 'block' }}>
              Email адресът не може да бъде променян
            </small>
          </div>
          
          <div className="form-group">
            <label htmlFor="name">Име и фамилия</label>
            <input
              id="name"
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Вашето име"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="phone">Телефонен номер</label>
            <input
              id="phone"
              type="tel" 
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Телефонен номер"
            />
          </div>
          
          <button 
            type="submit" 
            className="auth-button"
            disabled={updating}
          >
            {updating ? 'Запазване...' : 'Запази промените'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Profile;