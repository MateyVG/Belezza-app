import React, { useState, useEffect } from 'react';

function AdminReservationsSection({ restaurant, supabase }) {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('upcoming');
  const [showForm, setShowForm] = useState(false);
  const [tables, setTables] = useState([]);
  const [formData, setFormData] = useState({
    date: '',
    time: '',
    table_id: '',
    name: '',
    phone: '',
    email: '',
    guests_count: 2,
    status: 'confirmed'
  });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    if (!restaurant) return;
    fetchReservations();
    fetchTables();
  }, [restaurant, filter, supabase]);

  const fetchReservations = async () => {
    try {
      setLoading(true);
      
      // Получаване на днешната дата
      const today = new Date().toISOString().split('T')[0];
      
      // Съставяне на заявката според филтъра
      let query = supabase
        .from('reservations')
        .select(`
          *,
          tables:table_id (table_number, capacity)
        `)
        .eq('restaurant_id', restaurant.id);
      
      if (filter === 'upcoming') {
        query = query.gte('date', today);
      } else if (filter === 'past') {
        query = query.lt('date', today);
      }
      
      // Изпълнение на заявката
      const { data, error } = await query.order('date', { ascending: true });
      
      if (error) throw error;
      
      setReservations(data || []);
    } catch (error) {
      console.error('Error fetching reservations:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const fetchTables = async () => {
    try {
      const { data, error } = await supabase
        .from('tables')
        .select('*')
        .eq('restaurant_id', restaurant.id)
        .order('table_number', { ascending: true });
      
      if (error) throw error;
      
      setTables(data || []);
    } catch (error) {
      console.error('Error fetching tables:', error);
    }
  };

  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
  };

  const handleInputChange = (e) => {
    const { name, value, type } = e.target;
    
    setFormData({
      ...formData,
      [name]: type === 'number' ? parseInt(value, 10) : value
    });
  };

  const resetForm = () => {
    setFormData({
      date: '',
      time: '',
      table_id: '',
      name: '',
      phone: '',
      email: '',
      guests_count: 2,
      status: 'confirmed'
    });
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const reservation = {
        ...formData,
        restaurant_id: restaurant.id
      };
      
      if (editingId) {
        // Обновяване на съществуваща резервация
        const { error } = await supabase
          .from('reservations')
          .update(reservation)
          .eq('id', editingId);
          
        if (error) throw error;
      } else {
        // Създаване на нова резервация
        const { error } = await supabase
          .from('reservations')
          .insert([reservation]);
          
        if (error) throw error;
      }
      
      // Презареждане на данните
      fetchReservations();
      
      // Изчистване на формата
      resetForm();
      setShowForm(false);
    } catch (error) {
      console.error('Error saving reservation:', error);
      alert('Възникна грешка при запазване на резервацията');
    }
  };

  const handleEdit = (reservation) => {
    setFormData({
      date: reservation.date,
      time: reservation.time,
      table_id: reservation.table_id,
      name: reservation.name,
      phone: reservation.phone,
      email: reservation.email || '',
      guests_count: reservation.guests_count,
      status: reservation.status
    });
    setEditingId(reservation.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Сигурни ли сте, че искате да изтриете тази резервация?')) {
      return;
    }
    
    try {
      const { error } = await supabase
        .from('reservations')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
      // Обновяване на списъка
      fetchReservations();
    } catch (error) {
      console.error('Error deleting reservation:', error);
      alert('Възникна грешка при изтриване на резервацията');
    }
  };

  if (loading) {
    return <div>Зареждане на резервации...</div>;
  }

  return (
    <div>
      <h1>Резервации: {restaurant?.name}</h1>
      
      <div className="admin-controls">
        <div className="admin-filters">
          <button 
            className={`admin-filter-btn ${filter === 'upcoming' ? 'active' : ''}`} 
            onClick={() => handleFilterChange('upcoming')}
          >
            Предстоящи
          </button>
          <button 
            className={`admin-filter-btn ${filter === 'past' ? 'active' : ''}`} 
            onClick={() => handleFilterChange('past')}
          >
            Минали
          </button>
          <button 
            className={`admin-filter-btn ${filter === 'all' ? 'active' : ''}`} 
            onClick={() => handleFilterChange('all')}
          >
            Всички
          </button>
        </div>
        
        <button 
          className="admin-add-btn"
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
        >
          Добави резервация
        </button>
      </div>
      
      {showForm && (
        <div className="admin-form-container">
          <h2>{editingId ? 'Редактиране на резервация' : 'Нова резервация'}</h2>
          <form onSubmit={handleSubmit} className="admin-form">
            <div className="form-group">
              <label>Дата</label>
              <input 
                type="date" 
                name="date" 
                value={formData.date} 
                onChange={handleInputChange} 
                required 
              />
            </div>
            
            <div className="form-group">
              <label>Час</label>
              <input 
                type="time" 
                name="time" 
                value={formData.time} 
                onChange={handleInputChange} 
                required 
              />
            </div>
            
            <div className="form-group">
              <label>Маса</label>
              <select 
                name="table_id" 
                value={formData.table_id} 
                onChange={handleInputChange} 
                required
              >
                <option value="">Изберете маса</option>
                {tables.map(table => (
                  <option key={table.id} value={table.id}>
                    Маса {table.table_number} ({table.capacity} места)
                  </option>
                ))}
              </select>
            </div>
            
            <div className="form-group">
              <label>Име</label>
              <input 
                type="text" 
                name="name" 
                value={formData.name} 
                onChange={handleInputChange} 
                required 
              />
            </div>
            
            <div className="form-group">
              <label>Телефон</label>
              <input 
                type="tel" 
                name="phone" 
                value={formData.phone} 
                onChange={handleInputChange} 
                required 
              />
            </div>
            
            <div className="form-group">
              <label>Email</label>
              <input 
                type="email" 
                name="email" 
                value={formData.email} 
                onChange={handleInputChange} 
              />
            </div>
            
            <div className="form-group">
              <label>Брой гости</label>
              <input 
                type="number" 
                name="guests_count" 
                value={formData.guests_count} 
                onChange={handleInputChange} 
                min="1" 
                required 
              />
            </div>
            
            <div className="form-group">
              <label>Статус</label>
              <select 
                name="status" 
                value={formData.status} 
                onChange={handleInputChange} 
                required
              >
                <option value="confirmed">Потвърдена</option>
                <option value="pending">Чакаща</option>
                <option value="cancelled">Отказана</option>
              </select>
            </div>
            
            <div className="form-buttons">
              <button type="button" className="admin-cancel-btn" onClick={() => setShowForm(false)}>
                Отказ
              </button>
              <button type="submit" className="admin-submit-btn">
                {editingId ? 'Запази промените' : 'Добави резервация'}
              </button>
            </div>
          </form>
        </div>
      )}
      
      <div className="admin-table-container">
        {reservations.length === 0 ? (
          <div className="admin-no-data">
            <p>Няма намерени резервации.</p>
          </div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Дата</th>
                <th>Час</th>
                <th>Маса</th>
                <th>Клиент</th>
                <th>Телефон</th>
                <th>Гости</th>
                <th>Статус</th>
                <th>Действия</th>
              </tr>
            </thead>
            <tbody>
              {reservations.map(reservation => (
                <tr key={reservation.id} className={`status-${reservation.status}`}>
                  <td>{reservation.date}</td>
                  <td>{reservation.time}</td>
                  <td>
                    {reservation.tables?.table_number || 'Неизвестно'}
                  </td>
                  <td>{reservation.name}</td>
                  <td>{reservation.phone}</td>
                  <td>{reservation.guests_count}</td>
                  <td>
                    <span className={`status-badge ${reservation.status}`}>
                      {reservation.status === 'confirmed' ? 'Потвърдена' : 
                       reservation.status === 'pending' ? 'Чакаща' : 'Отказана'}
                    </span>
                  </td>
                  <td>
                    <button 
                      className="admin-action-btn edit"
                      onClick={() => handleEdit(reservation)}
                    >
                      <i className="fas fa-edit"></i>
                    </button>
                    <button 
                      className="admin-action-btn delete"
                      onClick={() => handleDelete(reservation.id)}
                    >
                      <i className="fas fa-trash"></i>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default AdminReservationsSection;