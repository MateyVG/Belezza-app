import React, { useState, useEffect } from 'react';

function AddEditEvent({ restaurant, supabase, event = null, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    end_time: '',
    image_url: '',
    seats_available: 0,
    price: '',
    is_published: false,
    is_private: false
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Инициализиране на формата с данни за редактиране, ако е предоставено събитие
  useEffect(() => {
    if (event) {
      setFormData({
        title: event.title || '',
        description: event.description || '',
        date: event.date || '',
        time: event.time || '',
        end_time: event.end_time || '',
        image_url: event.image_url || '',
        seats_available: event.seats_available || 0,
        price: event.price !== null ? event.price.toString() : '',
        is_published: event.is_published || false,
        is_private: event.is_private || false
      });
    }
  }, [event]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : 
              type === 'number' ? (value === '' ? '' : parseInt(value, 10)) : 
              name === 'price' ? (value === '' ? '' : parseFloat(value)) : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Валидация
      if (formData.price && parseFloat(formData.price) < 0) {
        throw new Error('Цената не може да бъде отрицателна');
      }
      
      if (formData.seats_available < 0) {
        throw new Error('Броят на местата не може да бъде отрицателен');
      }
      
      // Подготвяне на данните за запазване
      const eventData = {
        ...formData,
        restaurant_id: restaurant.id,
        price: formData.price === '' ? null : parseFloat(formData.price)
      };
      
      let result;
      
      if (event) {
        // Редактиране на съществуващо събитие
        const { data, error: updateError } = await supabase
          .from('events')
          .update(eventData)
          .eq('id', event.id)
          .select();
        
        if (updateError) throw updateError;
        result = data[0];
      } else {
        // Създаване на ново събитие
        const { data, error: insertError } = await supabase
          .from('events')
          .insert([eventData])
          .select();
        
        if (insertError) throw insertError;
        result = data[0];
      }
      
      onSave(result);
    } catch (error) {
      console.error('Error saving event:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-form-container">
      <h2>{event ? 'Редактиране на събитие' : 'Ново събитие'}</h2>
      
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
          />
        </div>
        
        <div className="form-group">
          <label>Описание</label>
          <textarea 
            name="description" 
            value={formData.description} 
            onChange={handleInputChange} 
            rows="4"
          />
        </div>
        
        <div className="form-row">
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
            <label>Начален час</label>
            <input 
              type="time" 
              name="time" 
              value={formData.time} 
              onChange={handleInputChange} 
              required 
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
        
        <div className="form-row">
          <div className="form-group">
            <label>Брой места</label>
            <input 
              type="number" 
              name="seats_available" 
              value={formData.seats_available} 
              onChange={handleInputChange} 
              min="0"
            />
          </div>
          
          <div className="form-group">
            <label>Цена (в лв., ако е приложимо)</label>
            <input 
              type="number" 
              name="price" 
              value={formData.price} 
              onChange={handleInputChange} 
              min="0"
              step="0.01"
              placeholder="Оставете празно, ако е безплатно"
            />
          </div>
        </div>
        
        <div className="form-row checkboxes">
          <div className="form-group checkbox-group">
            <label>
              <input 
                type="checkbox" 
                name="is_published" 
                checked={formData.is_published} 
                onChange={handleInputChange} 
              />
              Публикувано (видимо за клиенти)
            </label>
          </div>
          
          <div className="form-group checkbox-group">
            <label>
              <input 
                type="checkbox" 
                name="is_private" 
                checked={formData.is_private} 
                onChange={handleInputChange} 
              />
              Частно събитие (само с покана)
            </label>
          </div>
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
            {loading ? 'Запазване...' : (event ? 'Запази промените' : 'Добави събитие')}
          </button>
        </div>
      </form>
    </div>
  );
}

export default AddEditEvent;