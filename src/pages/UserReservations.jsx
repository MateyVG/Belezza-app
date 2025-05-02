import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';
import { useAuth } from '../context/AuthContext';
import '../styles/Admin.css';

const supabaseUrl = 'https://lnquyopfvuikhjbjsiqk.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxucXV5b3BmdnVpa2hqYmpzaXFrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU0ODA5MDEsImV4cCI6MjA2MTA1NjkwMX0.GmZ-5FzZkJyMorLGggF_Jegx2Atn0wRiNKCx4esecJw';
const supabase = createClient(supabaseUrl, supabaseKey);

function UserReservations() {
  const { user } = useAuth();
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReservations = async () => {
      try {
        if (!user) return;

        // Зареждане на резервации за потребителя
        const { data, error } = await supabase
          .from('reservations')
          .select(`
            *,
            restaurants:restaurant_id(id, name, address, image_url),
            tables:table_id(table_number, capacity)
          `)
          .eq('email', user.email)
          .order('date', { ascending: true });

        if (error) throw error;
        setReservations(data);
      } catch (error) {
        console.error('Грешка при зареждане на резервации:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchReservations();
  }, [user]);

  const cancelReservation = async (id) => {
    try {
      const { error } = await supabase
        .from('reservations')
        .update({ status: 'cancelled' })
        .eq('id', id);

      if (error) throw error;

      // Обновяване на списъка с резервации
      setReservations(reservations.map(res => 
        res.id === id ? { ...res, status: 'cancelled' } : res
      ));
    } catch (error) {
      console.error('Грешка при отказване на резервация:', error);
    }
  };

  if (loading) {
    return <div className="loading">Зареждане на резервации...</div>;
  }

  return (
    <div className="user-reservations-container">
      <h1>Моите резервации</h1>
      
      {reservations.length === 0 ? (
        <div className="no-reservations">
          <p>Нямате активни резервации.</p>
        </div>
      ) : (
        <div className="reservations-list">
          {reservations.map(reservation => (
            <div key={reservation.id} className={`reservation-card ${reservation.status}`}>
              <div className="reservation-header">
                <h2>{reservation.restaurants.name}</h2>
                <span className={`reservation-status ${reservation.status}`}>
                  {reservation.status === 'confirmed' ? 'Потвърдена' :
                   reservation.status === 'cancelled' ? 'Отказана' : 'Чакаща'}
                </span>
              </div>
              
              <div className="reservation-details">
                <p><strong>Дата:</strong> {reservation.date}</p>
                <p><strong>Час:</strong> {reservation.time}</p>
                <p><strong>Маса №:</strong> {reservation.tables.table_number}</p>
                <p><strong>Брой гости:</strong> {reservation.guests_count}</p>
              </div>
              
              {reservation.status !== 'cancelled' && (
                <button 
                  className="cancel-reservation-btn"
                  onClick={() => cancelReservation(reservation.id)}
                >
                  Откажи резервацията
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default UserReservations;