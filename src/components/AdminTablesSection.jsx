import React, { useState, useEffect } from 'react';

// Подсекция управление на маси
function AdminTablesSection({ restaurant, supabase }) {
    const [tables, setTables] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({
      table_number: '',
      capacity: 2,
      position_x: 50,
      position_y: 50,
      available: true,
      notes: ''
    });
  
    useEffect(() => {
      if (!restaurant) return;
  
      const fetchTables = async () => {
        try {
          setLoading(true);
          
          const { data, error } = await supabase
            .from('tables')
            .select('*')
            .eq('restaurant_id', restaurant.id)
            .order('table_number', { ascending: true });
          
          if (error) throw error;
          
          setTables(data || []);
        } catch (error) {
          console.error('Error fetching tables:', error);
        } finally {
          setLoading(false);
        }
      };
      
      fetchTables();
    }, [restaurant, supabase]);
  
    const handleInputChange = (e) => {
      const { name, value, type, checked } = e.target;
      setFormData({
        ...formData,
        [name]: type === 'checkbox' ? checked : 
                type === 'number' ? parseInt(value, 10) : value
      });
    };
  
    const resetForm = () => {
      setFormData({
        table_number: '',
        capacity: 2,
        position_x: 50,
        position_y: 50,
        available: true,
        notes: ''
      });
      setEditingId(null);
    };
  
    const handleSubmit = async (e) => {
      e.preventDefault();
      
      try {
        const fullData = {
          ...formData,
          restaurant_id: restaurant.id
        };
        
        let result;
        
        if (editingId) {
          const { data, error } = await supabase
            .from('tables')
            .update(fullData)
            .eq('id', editingId)
            .select();
          
          if (error) throw error;
          result = data[0];
          
          setTables(tables.map(table => 
            table.id === editingId ? { ...table, ...result } : table
          ));
        } else {
          const { data, error } = await supabase
            .from('tables')
            .insert([fullData])
            .select();
          
          if (error) throw error;
          result = data[0];
          
          setTables([...tables, result]);
        }
        
        resetForm();
        setShowForm(false);
      } catch (error) {
        console.error('Error saving table:', error);
        alert('Възникна грешка при запазване на масата');
      }
    };
  
    const handleEdit = (table) => {
      setFormData({
        table_number: table.table_number,
        capacity: table.capacity,
        position_x: table.position_x,
        position_y: table.position_y,
        available: table.available,
        notes: table.notes || ''
      });
      setEditingId(table.id);
      setShowForm(true);
    };
  
    const handleDelete = async (id) => {
      if (!window.confirm("Сигурни ли сте, че искате да изтриете тази маса?")) {
        return;
      }
      
      try {
        const { error } = await supabase
          .from('tables')
          .delete()
          .eq('id', id);
        
        if (error) throw error;
        
        setTables(tables.filter(table => table.id !== id));
      } catch (error) {
        console.error('Error deleting table:', error);
        alert('Възникна грешка при изтриване на масата');
      }
    };
  
    if (loading) {
      return <div>Зареждане на маси...</div>;
    }
  
    return (
      <div>
        <h1>Управление на маси: {restaurant?.name}</h1>
        
        <div className="admin-controls">
          <button 
            className="admin-add-btn"
            onClick={() => {
              resetForm();
              setShowForm(!showForm);
            }}
          >
            {showForm ? 'Отказ' : 'Добави нова маса'}
          </button>
        </div>
        
        {showForm && (
          <div className="admin-form-container">
            <h2>{editingId ? 'Редактиране на маса' : 'Нова маса'}</h2>
            <form onSubmit={handleSubmit} className="admin-form">
              <div className="form-group">
                <label>Номер на маса</label>
                <input 
                  type="number" 
                  name="table_number" 
                  value={formData.table_number} 
                  onChange={handleInputChange} 
                  required 
                  min="1"
                />
              </div>
              
              <div className="form-group">
                <label>Капацитет (брой места)</label>
                <input 
                  type="number" 
                  name="capacity" 
                  value={formData.capacity} 
                  onChange={handleInputChange} 
                  required 
                  min="1"
                  max="20"
                />
              </div>
              
              <div className="form-group">
                <label>Позиция X (в пиксели)</label>
                <input 
                  type="range" 
                  name="position_x" 
                  value={formData.position_x} 
                  onChange={handleInputChange} 
                  min="0" 
                  max="600" 
                />
                <span>{formData.position_x}px</span>
              </div>
              
              <div className="form-group">
                <label>Позиция Y (в пиксели)</label>
                <input 
                  type="range" 
                  name="position_y" 
                  value={formData.position_y} 
                  onChange={handleInputChange} 
                  min="0" 
                  max="400" 
                />
                <span>{formData.position_y}px</span>
              </div>
              
              <div className="form-group checkbox-group">
                <label>
                  <input 
                    type="checkbox" 
                    name="available" 
                    checked={formData.available} 
                    onChange={handleInputChange} 
                  />
                  Активна маса
                </label>
              </div>
              
              <div className="form-group">
                <label>Бележки</label>
                <textarea 
                  name="notes" 
                  value={formData.notes} 
                  onChange={handleInputChange} 
                  placeholder="Допълнителна информация за масата" 
                />
              </div>
              
              <div className="form-buttons">
                <button type="button" className="admin-cancel-btn" onClick={() => setShowForm(false)}>
                  Отказ
                </button>
                <button type="submit" className="admin-submit-btn">
                  {editingId ? 'Запази промените' : 'Добави маса'}
                </button>
              </div>
            </form>
          </div>
        )}
        
        <div className="restaurant-layout-container">
          <h3>Изглед на подредбата</h3>
          <div className="restaurant-layout-preview">
            {tables.map(table => (
              <div
                key={table.id}
                className={`table-preview ${table.available ? 'available' : 'unavailable'}`}
                style={{
                  top: `${table.position_y}px`,
                  left: `${table.position_x}px`,
                  width: `${table.capacity > 2 ? 80 : 60}px`,
                  height: `${table.capacity > 2 ? 80 : 60}px`,
                }}
                onClick={() => handleEdit(table)}
              >
                <span className="table-number">{table.table_number}</span>
                <span className="table-capacity">{table.capacity} места</span>
              </div>
            ))}
          </div>
        </div>
        
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Номер</th>
                <th>Капацитет</th>
                <th>Статус</th>
                <th>Бележки</th>
                <th>Действия</th>
              </tr>
            </thead>
            <tbody>
              {tables.map(table => (
                <tr key={table.id}>
                  <td>{table.table_number}</td>
                  <td>{table.capacity} места</td>
                  <td>
                    <span className={`status-badge ${table.available ? 'active' : 'inactive'}`}>
                      {table.available ? 'Активна' : 'Неактивна'}
                    </span>
                  </td>
                  <td>{table.notes || '-'}</td>
                  <td>
                    <button 
                      className="admin-action-btn edit"
                      onClick={() => handleEdit(table)}
                    >
                      <i className="fas fa-edit"></i>
                    </button>
                    <button 
                      className="admin-action-btn delete"
                      onClick={() => handleDelete(table.id)}
                    >
                      <i className="fas fa-trash"></i>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

export default AdminTablesSection;