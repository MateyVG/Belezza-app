import React, { useState, useEffect } from 'react';
import AddEditEvent from './AddEditEvent';

function AdminEventsSection({ restaurant, supabase }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('upcoming');
  const [showForm, setShowForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);

  useEffect(() => {
    if (!restaurant) return;
    fetchEvents();
  }, [restaurant, view, supabase]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      
      // Получаване на днешната дата
      const today = new Date().toISOString().split('T')[0];
      
      // Съставяне на заявката според изгледа
      let query = supabase
        .from('events')
        .select('*')
        .eq('restaurant_id', restaurant.id);
      
      if (view === 'upcoming') {
        query = query.gte('date', today);
      } else if (view === 'past') {
        query = query.lt('date', today);
      }
      
      const { data, error } = await query
        .order('date', { ascending: view === 'upcoming' });
      
      if (error) throw error;
      
      setEvents(data || []);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewChange = (newView) => {
    setView(newView);
  };

  const handleAddEvent = () => {
    setEditingEvent(null);
    setShowForm(true);
  };

  const handleEdit = (event) => {
    setEditingEvent(event);
    setShowForm(true);
  };

  const handleSave = (savedEvent) => {
    if (editingEvent) {
      // Обновяване на локалните данни след редактиране
      setEvents(events.map(event => 
        event.id === savedEvent.id ? savedEvent : event
      ));
    } else {
      // Добавяне на ново събитие към локалните данни
      setEvents([...events, savedEvent]);
    }
    setShowForm(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Сигурни ли сте, че искате да изтриете това събитие?")) {
      return;
    }
    
    try {
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
      // Обновяване на списъка
      setEvents(events.filter(event => event.id !== id));
    } catch (error) {
      console.error('Error deleting event:', error);
      alert('Възникна грешка при изтриване на събитието');
    }
  };

  const formatDate = (dateStr) => {
    const parts = dateStr.split('-');
    return `${parts[2]}.${parts[1]}.${parts[0]}`;
  };

  if (loading) {
    return <div>Зареждане на събития...</div>;
  }

  return (
    <div>
      <h1>Събития: {restaurant?.name}</h1>
      
      <div className="admin-controls">
        <div className="admin-filters">
          <button 
            className={`admin-filter-btn ${view === 'upcoming' ? 'active' : ''}`} 
            onClick={() => handleViewChange('upcoming')}
          >
            Предстоящи събития
          </button>
          <button 
            className={`admin-filter-btn ${view === 'past' ? 'active' : ''}`} 
            onClick={() => handleViewChange('past')}
          >
            Минали събития
          </button>
          <button 
            className={`admin-filter-btn ${view === 'all' ? 'active' : ''}`} 
            onClick={() => handleViewChange('all')}
          >
            Всички събития
          </button>
        </div>
        
        <button 
          className="admin-add-btn"
          onClick={handleAddEvent}
        >
          Добави събитие
        </button>
      </div>
      
      {/* Форма за добавяне/редактиране на събитие */}
      {showForm && (
        <AddEditEvent 
          restaurant={restaurant}
          supabase={supabase}
          event={editingEvent}
          onSave={handleSave}
          onCancel={() => setShowForm(false)}
        />
      )}
      
      <div className="admin-table-container">
        {events.length === 0 ? (
          <div className="admin-no-data">
            <p>Няма {view === 'upcoming' ? 'предстоящи' : view === 'past' ? 'минали' : ''} събития.</p>
          </div>
        ) : (
          <div className="events-grid">
            {events.map(event => (
              <div key={event.id} className="event-card">
                <div className="event-image">
                  {event.image_url ? (
                    <img src={event.image_url} alt={event.title} />
                  ) : (
                    <div className="event-placeholder">
                      <i className="fas fa-calendar-alt"></i>
                    </div>
                  )}
                </div>
                <div className="event-content">
                  <div className="event-header">
                    <h3>{event.title}</h3>
                    <div className="event-status">
                      {event.is_published ? (
                        <span className="status-badge active">Публикувано</span>
                      ) : (
                        <span className="status-badge inactive">Чернова</span>
                      )}
                      {event.is_private && (
                        <span className="status-badge private">Частно</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="event-date-time">
                    <p>
                      <i className="fas fa-calendar"></i> {formatDate(event.date)}
                    </p>
                    <p>
                      <i className="fas fa-clock"></i> {event.time}
                      {event.end_time && ` - ${event.end_time}`}
                    </p>
                  </div>
                  
                  {event.description && (
                    <div className="event-description">
                      <p>{event.description.length > 100 
                        ? event.description.slice(0, 100) + '...' 
                        : event.description}
                      </p>
                    </div>
                  )}
                  
                  <div className="event-actions">
                    <button 
                      className="admin-action-btn edit"
                      onClick={() => handleEdit(event)}
                    >
                      <i className="fas fa-edit"></i>
                    </button>
                    <button 
                      className="admin-action-btn delete"
                      onClick={() => handleDelete(event.id)}
                    >
                      <i className="fas fa-trash"></i>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminEventsSection;