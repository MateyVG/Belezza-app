import React, { useState, useEffect } from 'react';

function AddEditSpecialOffer({ restaurant, supabase, offer = null, menuItems = [], menuCategories = [], onSave, onCancel }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    discount_type: 'percentage',
    discount_value: '',
    start_date: '',
    end_date: '',
    days_of_week: [],
    start_time: '',
    end_time: '',
    min_order: '',
    max_uses: '',
    image_url: '',
    active: true,
    applies_to: 'all',
    applies_to_id: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Инициализиране на формата с данни за редактиране, ако е предоставено предложение
  useEffect(() => {
    if (offer) {
      setFormData({
        title: offer.title || '',
        description: offer.description || '',
        discount_type: offer.discount_type || 'percentage',
        discount_value: offer.discount_value !== null ? offer.discount_value.toString() : '',
        start_date: offer.start_date || '',
        end_date: offer.end_date || '',
        days_of_week: offer.days_of_week || [],
        start_time: offer.start_time || '',
        end_time: offer.end_time || '',
        min_order: offer.min_order !== null ? offer.min_order.toString() : '',
        max_uses: offer.max_uses !== null ? offer.max_uses.toString() : '',
        image_url: offer.image_url || '',
        active: offer.active !== false,
        applies_to: offer.applies_to || 'all',
        applies_to_id: offer.applies_to_id || ''
      });
    }
  }, [offer]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleDaysOfWeekChange = (day) => {
    const updatedDays = [...formData.days_of_week];
    const index = updatedDays.indexOf(day);
    
    if (index > -1) {
      updatedDays.splice(index, 1);
    } else {
      updatedDays.push(day);
    }
    
    setFormData({
      ...formData,
      days_of_week: updatedDays
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Валидация
      if (formData.discount_type !== 'free_item' && 
          (formData.discount_value === '' || parseFloat(formData.discount_value) <= 0)) {
        throw new Error('Моля, въведете валидна стойност на отстъпката');
      }
      
      if (formData.discount_type === 'percentage' && parseFloat(formData.discount_value) > 100) {
        throw new Error('Процентната отстъпка не може да бъде по-голяма от 100%');
      }
      
      if (formData.start_date && formData.end_date && formData.start_date > formData.end_date) {
        throw new Error('Крайната дата трябва да бъде след началната дата');
      }
      
      if (formData.applies_to !== 'all' && !formData.applies_to_id) {
        throw new Error('Моля, изберете за какво се отнася специалното предложение');
      }
      
      // Подготовка на данните
      const offerData = {
        ...formData,
        restaurant_id: restaurant.id,
        discount_value: formData.discount_value === '' ? null : 
                        formData.discount_type === 'percentage' ? parseInt(formData.discount_value, 10) : 
                        parseFloat(formData.discount_value),
        min_order: formData.min_order === '' ? null : parseFloat(formData.min_order),
        max_uses: formData.max_uses === '' ? null : parseInt(formData.max_uses, 10)
      };
      
      // Конвертиране на празни стрингове към null
      for (const key in offerData) {
        if (offerData[key] === '') {
          offerData[key] = null;
        }
      }
      
      let result;
      
      if (offer) {
        // Редактиране на съществуващо предложение
        const { data, error: updateError } = await supabase
          .from('special_offers')
          .update(offerData)
          .eq('id', offer.id)
          .select();
        
        if (updateError) throw updateError;
        result = data[0];
      } else {
        // Създаване на ново предложение
        const { data, error: insertError } = await supabase
          .from('special_offers')
          .insert([offerData])
          .select();
        
        if (insertError) throw insertError;
        result = data[0];
      }
      
      onSave(result);
    } catch (error) {
      console.error('Error saving special offer:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-form-container">
      <h2>{offer ? 'Редактиране на специално предложение' : 'Ново специално предложение'}</h2>
      
      {error && (
        <div className="error-message" style={{padding: '10px', backgroundColor: '#f8d7da', color: '#721c24', borderRadius: '4px', marginBottom: '15px'}}>
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="admin-form">
        <div className="form-group">
          <label>Заглавие</label>
          <input 
            type="text" 
            name="title" 
            value={formData.title} 
            onChange={handleInputChange} 
            required 
            placeholder="Напр.: Щастлив час, 2+1 безплатно и т.н."
          />
        </div>
        
        <div className="form-group">
          <label>Описание</label>
          <textarea 
            name="description" 
            value={formData.description} 
            onChange={handleInputChange} 
            rows="3"
            placeholder="Подробно описание на специалното предложение"
          />
        </div>
        
        <div className="form-row">
          <div className="form-group">
            <label>Тип отстъпка</label>
            <select 
              name="discount_type" 
              value={formData.discount_type} 
              onChange={handleInputChange} 
              required
            >
              <option value="percentage">Процент (%)</option>
              <option value="fixed">Фиксирана сума (лв.)</option>
              <option value="free_item">Безплатен продукт</option>
            </select>
          </div>
          
          {formData.discount_type !== 'free_item' && (
            <div className="form-group">
              <label>Стойност на отстъпката</label>
              <input 
                type="number" 
                name="discount_value" 
                value={formData.discount_value} 
                onChange={handleInputChange} 
                min={formData.discount_type === 'percentage' ? 1 : 0.01}
                max={formData.discount_type === 'percentage' ? 100 : undefined}
                step={formData.discount_type === 'percentage' ? 1 : 0.01}
                required
              />
            </div>
          )}
        </div>
        
        <div className="form-row">
          <div className="form-group">
            <label>Начална дата</label>
            <input 
              type="date" 
              name="start_date" 
              value={formData.start_date} 
              onChange={handleInputChange} 
            />
          </div>
          
          <div className="form-group">
            <label>Крайна дата</label>
            <input 
              type="date" 
              name="end_date" 
              value={formData.end_date} 
              onChange={handleInputChange} 
            />
          </div>
        </div>
        
        <div className="form-group">
          <label>В кои дни от седмицата важи</label>
          <div className="days-of-week-container">
            {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map(day => (
              <label key={day} className="day-checkbox">
                <input 
                  type="checkbox" 
                  checked={formData.days_of_week.includes(day)} 
                  onChange={() => handleDaysOfWeekChange(day)} 
                />
                {day === 'monday' ? 'Пн' : 
                 day === 'tuesday' ? 'Вт' : 
                 day === 'wednesday' ? 'Ср' : 
                 day === 'thursday' ? 'Чт' : 
                 day === 'friday' ? 'Пт' : 
                 day === 'saturday' ? 'Сб' : 'Нд'}
              </label>
            ))}
          </div>
          <small>Оставете всички празни, за да важи всеки ден</small>
        </div>
        
        <div className="form-row">
          <div className="form-group">
            <label>Начален час</label>
            <input 
              type="time" 
              name="start_time" 
              value={formData.start_time} 
              onChange={handleInputChange} 
            />
          </div>
          
          <div className="form-group">
            <label>Краен час</label>
            <input 
              type="time" 
              name="end_time" 
              value={formData.end_time} 
              onChange={handleInputChange} 
            />
          </div>
        </div>
        
        <div className="form-row">
          <div className="form-group">
            <label>Минимална поръчка (лв.)</label>
            <input 
              type="number" 
              name="min_order" 
              value={formData.min_order} 
              onChange={handleInputChange} 
              min="0"
              step="0.01"
              placeholder="Оставете празно, ако няма"
            />
          </div>
          
          <div className="form-group">
            <label>Максимален брой използвания</label>
            <input 
              type="number" 
              name="max_uses" 
              value={formData.max_uses} 
              onChange={handleInputChange} 
              min="1"
              placeholder="Оставете празно, ако няма лимит"
            />
          </div>
        </div>
        
        <div className="form-group">
          <label>URL на изображение</label>
          <input 
            type="url" 
            name="image_url" 
            value={formData.image_url} 
            onChange={handleInputChange} 
            placeholder="http://example.com/image.jpg"
          />
        </div>
        
        <div className="form-group">
          <label>За какво се отнася</label>
          <select 
            name="applies_to" 
            value={formData.applies_to} 
            onChange={handleInputChange} 
            required
          >
            <option value="all">Всички продукти</option>
            <option value="category">Конкретна категория</option>
            <option value="item">Конкретен продукт</option>
          </select>
        </div>
        
        {formData.applies_to === 'category' && (
          <div className="form-group">
            <label>Изберете категория</label>
            <select 
              name="applies_to_id" 
              value={formData.applies_to_id} 
              onChange={handleInputChange} 
              required
            >
              <option value="">Изберете категория</option>
              {menuCategories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
        )}
        
        {formData.applies_to === 'item' && (
          <div className="form-group">
            <label>Изберете продукт</label>
            <select 
              name="applies_to_id" 
              value={formData.applies_to_id} 
              onChange={handleInputChange} 
              required
            >
              <option value="">Изберете продукт</option>
              {menuItems.map(item => (
                <option key={item.id} value={item.id}>
                  {item.name} ({item.menu_categories?.name || 'Без категория'}) - {item.price?.toFixed(2)} лв.
                </option>
              ))}
            </select>
          </div>
        )}
        
        <div className="form-group checkbox-group">
          <label>
            <input 
              type="checkbox" 
              name="active" 
              checked={formData.active} 
              onChange={handleInputChange} 
            />
            Активно
          </label>
        </div>
        
        <div className="form-buttons">
          <button 
            type="button" 
            className="admin-cancel-btn" 
            onClick={onCancel}
            disabled={loading}
          >
            Отказ
          </button>
          <button 
            type="submit" 
            className="admin-submit-btn"
            disabled={loading}
          >
            {loading ? 'Запазване...' : (offer ? 'Запази промените' : 'Добави специално предложение')}
          </button>
        </div>
      </form>
    </div>
  );
}

export default AddEditSpecialOffer;