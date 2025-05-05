import React, { useState, useEffect } from 'react';

function AdminDashboardSection({ restaurant, supabase }) {
  const [stats, setStats] = useState({
    reservationsToday: 0,
    activeTables: 0,
    totalTables: 0,
    upcomingEvents: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!restaurant) return;
    
    const fetchStats = async () => {
      try {
        setLoading(true);
        
        // Получаване на днешната дата във формат YYYY-MM-DD
        const today = new Date().toISOString().split('T')[0];
        
        // Заявка за резервации днес
        const { data: reservations, error: reservationsError } = await supabase
          .from('reservations')
          .select('*')
          .eq('restaurant_id', restaurant.id)
          .eq('date', today)
          .in('status', ['confirmed', 'pending']);
        
        if (reservationsError) throw reservationsError;
        
        // Заявка за всички маси в ресторанта
        const { data: tables, error: tablesError } = await supabase
          .from('tables')
          .select('*')
          .eq('restaurant_id', restaurant.id);
        
        if (tablesError) throw tablesError;
        
        // Заявка за предстоящи събития
        const { data: events, error: eventsError } = await supabase
          .from('events')
          .select('*')
          .eq('restaurant_id', restaurant.id)
          .gte('date', today);
        
        if (eventsError) throw eventsError;
        
        // Изчисляване на заетите маси
        const reservedTableIds = reservations.map(r => r.table_id);
        const activeTables = new Set(reservedTableIds).size;
        
        setStats({
          reservationsToday: reservations.length,
          activeTables,
          totalTables: tables.length,
          upcomingEvents: events ? events.length : 0
        });
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchStats();
  }, [restaurant, supabase]);

  if (loading) {
    return <div>Зареждане на статистика...</div>;
  }

  return (
    <div>
      <h1>Табло: {restaurant?.name}</h1>
      <div className="admin-stats-grid">
        <div className="admin-stat-card">
          <h3>Резервации днес</h3>
          <p className="stat">{stats.reservationsToday}</p>
        </div>
        
        <div className="admin-stat-card">
          <h3>Активни маси</h3>
          <p className="stat">{stats.activeTables}/{stats.totalTables}</p>
        </div>
        
        <div className="admin-stat-card">
          <h3>Предстоящи събития</h3>
          <p className="stat">{stats.upcomingEvents}</p>
        </div>
      </div>

      <div className="quick-actions">
        <h2>Бързи действия</h2>
        <div className="admin-buttons-grid">
          <button className="admin-action-btn" onClick={() => window.location.href = `/admin/restaurant/${restaurant?.id}/reservations`}>
            <i className="fas fa-plus"></i> Нова резервация
          </button>
          <button className="admin-action-btn" onClick={() => window.location.href = `/admin/restaurant/${restaurant?.id}/events`}>
            <i className="fas fa-calendar-plus"></i> Добави събитие
          </button>
          <button className="admin-action-btn" onClick={() => window.location.href = `/admin/restaurant/${restaurant?.id}/menu`}>
            <i className="fas fa-utensils"></i> Управление на меню
          </button>
        </div>
      </div>

      <div className="admin-info-section">
        <h2>Информация за ресторанта</h2>
        {restaurant ? (
          <div className="restaurant-details">
            <p><strong>Име:</strong> {restaurant.name}</p>
            <p><strong>Адрес:</strong> {restaurant.address || 'Не е зададен'}</p>
            <p><strong>Телефон:</strong> {restaurant.phone || 'Не е зададен'}</p>
            <p><strong>Работно време:</strong> {restaurant.hours || 'Не е зададено'}</p>
            {restaurant.description && (
              <p><strong>Описание:</strong> {restaurant.description}</p>
            )}
          </div>
        ) : (
          <p>Няма избран ресторант</p>
        )}
      </div>
    </div>
  );
}

export default AdminDashboardSection;


