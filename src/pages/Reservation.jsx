import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';
import './Reservation.css';

// Използвайте същите настройки за Supabase
const supabaseUrl = 'https://lnquyopfvuikhjbjsiqk.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxucXV5b3BmdnVpa2hqYmpzaXFrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU0ODA5MDEsImV4cCI6MjA2MTA1NjkwMX0.GmZ-5FzZkJyMorLGggF_Jegx2Atn0wRiNKCx4esecJw';
const supabase = createClient(supabaseUrl, supabaseKey);

function Reservation() {
  const { id } = useParams(); // Взима ID на ресторанта от URL
  const navigate = useNavigate();
  
  // Състояния за стъпките на резервацията
  const [step, setStep] = useState(1);
  
  // Състояния за данните на резервацията
  const [restaurant, setRestaurant] = useState(null);
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [guests, setGuests] = useState(2);
  const [tables, setTables] = useState([]);
  const [selectedTable, setSelectedTable] = useState(null);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  
  // Състояния за зареждане и грешки
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Зареждане на данни за ресторанта
  useEffect(() => {
    async function fetchRestaurant() {
      try {
        const { data, error } = await supabase
          .from('restaurants')
          .select('*')
          .eq('id', id)
          .single();
        
        if (error) throw error;
        
        setRestaurant(data);
      } catch (error) {
        console.error("Грешка при зареждане на ресторанта:", error);
        setError("Не можахме да заредим информация за ресторанта");
      } finally {
        setLoading(false);
      }
    }
    
    fetchRestaurant();
  }, [id]);

  // Зареждане на свободни маси при избор на дата и час
  useEffect(() => {
    if (date && time && step === 2) {
      async function fetchAvailableTables() {
        try {
          setLoading(true);
          
          // Извличане на всички маси за този ресторант с подходящ капацитет
          const { data: allTables, error: tablesError } = await supabase
            .from('tables')
            .select('*')
            .eq('restaurant_id', id)
            .gte('capacity', guests);
          
          if (tablesError) throw tablesError;
          
          // Извличане на резервирани маси за избраната дата и час
          const { data: reservations, error: reservationsError } = await supabase
            .from('reservations')
            .select('table_id')
            .eq('restaurant_id', id)
            .eq('date', date)
            .eq('time', time)
            .in('status', ['confirmed', 'pending']);
          
          if (reservationsError) throw reservationsError;
          
          // Филтриране на свободните маси
          const reservedTableIds = reservations.map(r => r.table_id);
          const availableTables = allTables.filter(table => !reservedTableIds.includes(table.id));
          
          setTables(availableTables);
        } catch (error) {
          console.error("Грешка при зареждане на масите:", error);
          setError("Не можахме да заредим свободните маси");
        } finally {
          setLoading(false);
        }
      }
      
      fetchAvailableTables();
    }
  }, [id, date, time, guests, step]);

  // Преминаване към следваща стъпка
  const nextStep = () => {
    setStep(step + 1);
  };

  // Връщане към предишна стъпка
  const prevStep = () => {
    setStep(step - 1);
  };

  // Избор на маса
  const handleTableSelect = (table) => {
    setSelectedTable(table);
  };

  // Изпращане на резервацията
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedTable) {
      setError("Моля, изберете маса");
      return;
    }
    
    try {
      setSubmitting(true);
      
      const { error } = await supabase
        .from('reservations')
        .insert([
          {
            restaurant_id: id,
            table_id: selectedTable.id,
            date,
            time,
            name,
            phone,
            email,
            guests_count: guests,
            status: 'confirmed'
          }
        ]);
      
      if (error) throw error;
      
      setSuccess(true);
      
      // След успешна резервация, връщаме към детайлната страница след 3 секунди
      setTimeout(() => {
        navigate(`/restaurant/${id}`);
      }, 3000);
      
    } catch (error) {
      console.error("Грешка при създаване на резервация:", error);
      setError("Не успяхме да създадем резервацията. Моля, опитайте отново.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading && !restaurant) {
    return <div className="loading">Зареждане...</div>;
  }

  if (error && !restaurant) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="reservation-container">
      <h1>Резервация за {restaurant?.name}</h1>
      
      {success ? (
        <div className="success-message">
          <h2>Резервацията е успешна!</h2>
          <p>Благодарим ви за вашата резервация. Очакваме ви на {date} в {time}.</p>
          <p>Ще бъдете пренасочени към страницата на ресторанта...</p>
        </div>
      ) : (
        <div className="reservation-form">
          <div className="steps-container">
            <div className={`step ${step >= 1 ? 'active' : ''}`}>1. Дата и час</div>
            <div className={`step ${step >= 2 ? 'active' : ''}`}>2. Избор на маса</div>
            <div className={`step ${step >= 3 ? 'active' : ''}`}>3. Вашите данни</div>
          </div>
          
          {error && <div className="error-message">{error}</div>}
          
          {step === 1 && (
            <div className="step-content">
              <h2>Изберете дата, час и брой гости</h2>
              
              <div className="form-group">
                <label htmlFor="date">Дата</label>
                <input 
                  type="date" 
                  id="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="time">Час</label>
                <select 
                  id="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  required
                >
                  <option value="">Изберете час</option>
                  <option value="12:00">12:00</option>
                  <option value="12:30">12:30</option>
                  <option value="13:00">13:00</option>
                  <option value="13:30">13:30</option>
                  <option value="14:00">14:00</option>
                  <option value="14:30">14:30</option>
                  <option value="15:00">15:00</option>
                  <option value="15:30">15:30</option>
                  <option value="16:00">16:00</option>
                  <option value="16:30">16:30</option>
                  <option value="17:00">17:00</option>
                  <option value="17:30">17:30</option>
                  <option value="18:00">18:00</option>
                  <option value="18:30">18:30</option>
                  <option value="19:00">19:00</option>
                  <option value="19:30">19:30</option>
                  <option value="20:00">20:00</option>
                  <option value="20:30">20:30</option>
                  <option value="21:00">21:00</option>
                </select>
              </div>
              
              <div className="form-group">
                <label htmlFor="guests">Брой гости</label>
                <select 
                  id="guests"
                  value={guests}
                  onChange={(e) => setGuests(parseInt(e.target.value))}
                  required
                >
                  {[...Array(8)].map((_, i) => (
                    <option key={i + 1} value={i + 1}>
                      {i + 1} {i === 0 ? 'гост' : 'гости'}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="form-buttons">
                <button 
                  type="button" 
                  className="button secondary"
                  onClick={() => navigate(`/restaurant/${id}`)}
                >
                  Отказ
                </button>
                <button 
                  type="button" 
                  className="button primary"
                  onClick={nextStep}
                  disabled={!date || !time}
                >
                  Продължи
                </button>
              </div>
            </div>
          )}
          
          {step === 2 && (
            <div className="step-content">
              <h2>Изберете маса</h2>
              
              {loading ? (
                <div className="loading">Зареждане на свободни маси...</div>
              ) : (
                <>
                  {tables.length === 0 ? (
                    <div className="no-tables">
                      <p>Няма свободни маси за избраната дата и час.</p>
                      <p>Моля, изберете друга дата или час.</p>
                    </div>
                  ) : (
                    <div className="tables-container">
                      <div className="restaurant-layout">
                        {tables.map(table => (
                          <div
                            key={table.id}
                            className={`table ${selectedTable?.id === table.id ? 'selected' : ''}`}
                            style={{
                              top: `${table.position_y}px`,
                              left: `${table.position_x}px`,
                              width: `${table.capacity > 2 ? 80 : 60}px`,
                              height: `${table.capacity > 2 ? 80 : 60}px`,
                            }}
                            onClick={() => handleTableSelect(table)}
                          >
                            <span className="table-number">{table.table_number}</span>
                            <span className="table-capacity">{table.capacity} места</span>
                          </div>
                        ))}
                      </div>
                      
                      <div className="table-legend">
                        <div className="legend-item">
                          <div className="legend-color available"></div>
                          <span>Свободна маса</span>
                        </div>
                        <div className="legend-item">
                          <div className="legend-color selected"></div>
                          <span>Избрана маса</span>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div className="form-buttons">
                    <button 
                      type="button" 
                      className="button secondary"
                      onClick={prevStep}
                    >
                      Назад
                    </button>
                    <button 
                      type="button" 
                      className="button primary"
                      onClick={nextStep}
                      disabled={!selectedTable}
                    >
                      Продължи
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
          
          {step === 3 && (
            <div className="step-content">
              <h2>Вашите данни</h2>
              
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label htmlFor="name">Име и фамилия</label>
                  <input 
                    type="text" 
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="phone">Телефон</label>
                  <input 
                    type="tel" 
                    id="phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="email">Имейл</label>
                  <input 
                    type="email" 
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                
                <div className="reservation-summary">
                  <h3>Детайли на резервацията</h3>
                  <p><strong>Ресторант:</strong> {restaurant.name}</p>
                  <p><strong>Дата:</strong> {date}</p>
                  <p><strong>Час:</strong> {time}</p>
                  <p><strong>Брой гости:</strong> {guests}</p>
                  <p><strong>Маса №:</strong> {selectedTable?.table_number}</p>
                </div>
                
                <div className="form-buttons">
                  <button 
                    type="button" 
                    className="button secondary"
                    onClick={prevStep}
                  >
                    Назад
                  </button>
                  <button 
                    type="submit" 
                    className="button primary"
                    disabled={submitting || !name || !phone || !email}
                  >
                    {submitting ? 'Изпращане...' : 'Завърши резервацията'}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Reservation;