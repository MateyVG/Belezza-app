import React, { useState, useEffect } from 'react';
import AddEditSpecialOffer from './AddEditSpecialOffer';

function AdminSpecialOffersSection({ restaurant, supabase }) {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('active');
  const [showForm, setShowForm] = useState(false);
  const [editingOffer, setEditingOffer] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [menuCategories, setMenuCategories] = useState([]);

  useEffect(() => {
    if (!restaurant) return;
    fetchData();
  }, [restaurant, filter, supabase]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Получаване на днешната дата
      const today = new Date().toISOString().split('T')[0];
      
      // Зареждане на специални предложения
      let query = supabase
        .from('special_offers')
        .select('*')
        .eq('restaurant_id', restaurant.id);
      
      if (filter === 'active') {
        query = query
          .eq('active', true)
          .lte('start_date', today)
          .or(`end_date.gt.${today},end_date.is.null`);
      } else if (filter === 'upcoming') {
        query = query.gt('start_date', today);
      } else if (filter === 'expired') {
        query = query
          .lt('end_date', today)
          .not('end_date', 'is', null);
      } else if (filter === 'inactive') {
        query = query.eq('active', false);
      }
      
      const { data: offersData, error: offersError } = await query
        .order('start_date', { ascending: false });
      
      if (offersError) throw offersError;
      
      setOffers(offersData || []);
      
      // Зареждане на категории от менюто
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('menu_categories')
        .select('*')
        .eq('restaurant_id', restaurant.id)
        .order('"order"', { ascending: true });
      
      if (categoriesError) throw categoriesError;
      
      setMenuCategories(categoriesData || []);
      
      // Зареждане на продукти от менюто
      const { data: itemsData, error: itemsError } = await supabase
        .from('menu_items')
        .select(`
          id,
          name,
          category_id,
          price,
          menu_categories:category_id (name)
        `)
        .eq('restaurant_id', restaurant.id)
        .order('name', { ascending: true });
      
      if (itemsError) throw itemsError;
      
      setMenuItems(itemsData || []);
    } catch (error) {
      console.error('Error fetching special offers data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
  };

  const handleAddOffer = () => {
    setEditingOffer(null);
    setShowForm(true);
  };

  const handleEdit = (offer) => {
    setEditingOffer(offer);
    setShowForm(true);
  };

  const handleSave = (savedOffer) => {
    if (editingOffer) {
      // Обновяване на локалните данни след редактиране
      setOffers(offers.map(offer => 
        offer.id === savedOffer.id ? savedOffer : offer
      ));
    } else {
      // Добавяне на ново предложение към локалните данни
      setOffers([savedOffer, ...offers]);
    }
    setShowForm(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Сигурни ли сте, че искате да изтриете това специално предложение?")) {
      return;
    }
    
    try {
      const { error } = await supabase
        .from('special_offers')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
      // Обновяване на списъка
      setOffers(offers.filter(offer => offer.id !== id));
    } catch (error) {
      console.error('Error deleting special offer:', error);
      alert('Възникна грешка при изтриване на специалното предложение');
    }
  };

  const toggleActive = async (id, currentStatus) => {
    try {
      const { error } = await supabase
        .from('special_offers')
        .update({ active: !currentStatus })
        .eq('id', id);
      
      if (error) throw error;
      
      // Актуализиране на локалния списък
      setOffers(offers.map(offer => 
        offer.id === id ? { ...offer, active: !currentStatus } : offer
      ));
    } catch (error) {
      console.error('Error updating offer status:', error);
      alert('Възникна грешка при промяна на статуса');
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    return `${parts[2]}.${parts[1]}.${parts[0]}`;
  };

  const getDiscountText = (offer) => {
    if(offer.discount_type === 'percentage') {
      return `${offer.discount_value}% отстъпка`;
    } else if (offer.discount_type === 'fixed') {
      return `${offer.discount_value.toFixed(2)} лв. отстъпка`;
    } else if (offer.discount_type === 'free_item') {
      return 'Безплатен продукт';
    }
    return '';
  };

  const isOfferActive = (offer) => {
    const today = new Date().toISOString().split('T')[0];
    return offer.active && 
           (!offer.start_date || offer.start_date <= today) && 
           (!offer.end_date || offer.end_date >= today);
  };

  const getDaysOfWeekLabels = (days) => {
    if (!days || days.length === 0) return 'Всички дни';
    
    const dayMap = {
      'monday': 'Пн',
      'tuesday': 'Вт',
      'wednesday': 'Ср',
      'thursday': 'Чт',
      'friday': 'Пт',
      'saturday': 'Сб',
      'sunday': 'Нд'
    };
    
    return days.map(day => dayMap[day]).join(', ');
  };

  if (loading) {
    return <div>Зареждане на специални предложения...</div>;
  }

  return (
    <div>
      <h1>Специални предложения: {restaurant?.name}</h1>
      
      <div className="admin-controls">
        <div className="admin-filters">
          <button 
            className={`admin-filter-btn ${filter === 'active' ? 'active' : ''}`} 
            onClick={() => handleFilterChange('active')}
          >
            Активни
          </button>
          <button 
            className={`admin-filter-btn ${filter === 'upcoming' ? 'active' : ''}`} 
            onClick={() => handleFilterChange('upcoming')}
          >
            Предстоящи
          </button>
          <button 
            className={`admin-filter-btn ${filter === 'expired' ? 'active' : ''}`} 
            onClick={() => handleFilterChange('expired')}
          >
            Изтекли
          </button>
          <button 
            className={`admin-filter-btn ${filter === 'inactive' ? 'active' : ''}`} 
            onClick={() => handleFilterChange('inactive')}
          >
            Неактивни
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
          onClick={handleAddOffer}
        >
          Добави специално предложение
        </button>
      </div>
      
      {/* Форма за добавяне/редактиране на специално предложение */}
      {showForm && (
        <AddEditSpecialOffer 
          restaurant={restaurant}
          supabase={supabase}
          offer={editingOffer}
          menuItems={menuItems}
          menuCategories={menuCategories}
          onSave={handleSave}
          onCancel={() => setShowForm(false)}
        />
      )}
      
      <div className="admin-table-container">
        {offers.length === 0 ? (
          <div className="admin-no-data">
            <p>Няма намерени специални предложения.</p>
          </div>
        ) : (
          <div className="special-offers-grid">
            {offers.map(offer => (
              <div key={offer.id} className={`special-offer-card ${isOfferActive(offer) ? 'active' : 'inactive'}`}>
                <div className="special-offer-header">
                  <h3>{offer.title}</h3>
                  <div className="special-offer-status">
                    {isOfferActive(offer) ? (
                      <span className="status-badge active">Активно</span>
                    ) : (
                      offer.active ? (
                        offer.start_date && new Date(offer.start_date) > new Date() ? (
                          <span className="status-badge upcoming">Предстоящо</span>
                        ) : (
                          <span className="status-badge expired">Изтекло</span>
                        )
                      ) : (
                        <span className="status-badge inactive">Неактивно</span>
                      )
                    )}
                  </div>
                </div>
                
                <div className="special-offer-content">
                  {offer.image_url && (
                    <div className="special-offer-image">
                      <img src={offer.image_url} alt={offer.title} />
                    </div>
                  )}
                  
                  <div className="special-offer-details">
                    <p className="special-offer-discount">
                      <i className="fas fa-tag"></i> {getDiscountText(offer)}
                    </p>
                    
                    <p className="special-offer-applies-to">
                      <i className="fas fa-shopping-basket"></i> {
                        offer.applies_to === 'all' ? 'Всички продукти' :
                        offer.applies_to === 'category' ? `Категория: ${menuCategories.find(c => c.id === offer.applies_to_id)?.name || 'Неизвестна'}` :
                        `Продукт: ${menuItems.find(i => i.id === offer.applies_to_id)?.name || 'Неизвестен'}`
                      }
                    </p>
                    
                    <div className="special-offer-period">
                      {(offer.start_date || offer.end_date) && (
                        <p>
                          <i className="fas fa-calendar-alt"></i> 
                          {offer.start_date ? formatDate(offer.start_date) : 'Без начална дата'} - 
                          {offer.end_date ? formatDate(offer.end_date) : 'Без крайна дата'}
                        </p>
                      )}
                      
                      {offer.days_of_week && offer.days_of_week.length > 0 && (
                        <p>
                          <i className="fas fa-calendar-week"></i> {getDaysOfWeekLabels(offer.days_of_week)}
                        </p>
                      )}
                      
                      {(offer.start_time || offer.end_time) && (
                        <p>
                          <i className="fas fa-clock"></i> 
                          {offer.start_time || '00:00'} - {offer.end_time || '23:59'}
                        </p>
                      )}
                    </div>
                    
                    {offer.description && (
                      <p className="special-offer-description">{offer.description}</p>
                    )}
                    
                    <div className="special-offer-conditions">
                      {offer.min_order > 0 && (
                        <p>
                          <i className="fas fa-shopping-cart"></i> Минимална поръчка: {offer.min_order.toFixed(2)} лв.
                        </p>
                      )}
                      
                      {offer.max_uses > 0 && (
                        <p>
                          <i className="fas fa-ticket-alt"></i> Максимален брой използвания: {offer.max_uses}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="special-offer-actions">
                  <button 
                    className="admin-action-btn toggle-active"
                    onClick={() => toggleActive(offer.id, offer.active)}
                    title={offer.active ? 'Деактивирай' : 'Активирай'}
                  >
                    <i className={`fas fa-${offer.active ? 'toggle-off' : 'toggle-on'}`}></i>
                  </button>
                  <button 
                    className="admin-action-btn edit"
                    onClick={() => handleEdit(offer)}
                  >
                    <i className="fas fa-edit"></i>
                  </button>
                  <button 
                    className="admin-action-btn delete"
                    onClick={() => handleDelete(offer.id)}
                  >
                    <i className="fas fa-trash"></i>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminSpecialOffersSection;