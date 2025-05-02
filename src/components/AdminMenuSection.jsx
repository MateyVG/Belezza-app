import React, { useState, useEffect, useRef } from 'react';

function AdminMenuSection({ restaurant, supabase }) {
  const [categories, setCategories] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category_id: '',
    is_available: true,
    image_url: '',
    allergens: '',
    recommended: false
  });
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [categoryFormData, setCategoryFormData] = useState({
    name: '',
    order: 0
  });
  const [editingId, setEditingId] = useState(null);
  const [editingCategoryId, setEditingCategoryId] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!restaurant) return;
    fetchMenuData();
  }, [restaurant, selectedCategory, supabase]);

  const fetchMenuData = async () => {
    try {
      setLoading(true);
      
      // Зареждане на категории
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('menu_categories')
        .select('*')
        .eq('restaurant_id', restaurant.id)
        .order('order', { ascending: true });
      
      if (categoriesError) throw categoriesError;
      setCategories(categoriesData || []);
      
      // Зареждане на продукти от менюто
      let query = supabase
        .from('menu_items')
        .select(`
          *,
          menu_categories:category_id (id, name)
        `)
        .eq('restaurant_id', restaurant.id);
      
      if (selectedCategory !== 'all') {
        query = query.eq('category_id', selectedCategory);
      }
      
      const { data: menuData, error: menuError } = await query
        .order('name', { ascending: true });
      
      if (menuError) throw menuError;
      setMenuItems(menuData || []);
    } catch (error) {
      console.error('Error fetching menu data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : 
              type === 'number' ? parseFloat(value) : value
    });
  };

  const handleCategoryInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setCategoryFormData({
      ...categoryFormData,
      [name]: type === 'checkbox' ? checked : 
              name === 'order' ? parseInt(value, 10) : value
    });
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      category_id: '',
      is_available: true,
      image_url: '',
      allergens: '',
      recommended: false
    });
    setEditingId(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const resetCategoryForm = () => {
    setCategoryFormData({
      name: '',
      order: categories.length > 0 ? Math.max(...categories.map(c => c.order)) + 1 : 0
    });
    setEditingCategoryId(null);
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Проверка на типа файл
    if (!['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(file.type)) {
      alert('Моля, качете изображение (JPEG, PNG, WEBP, GIF)');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }
    
    // Проверка на размера (максимум 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Размерът на файла не може да надвишава 5MB');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }
    
    try {
      setIsUploading(true);
      setUploadProgress(0);
      
      // Генериране на уникално име на файла
      const fileExt = file.name.split('.').pop();
      const fileName = `${restaurant.id}/menu/${Date.now()}.${fileExt}`;
      
      // Качване на файла в Supabase Storage
      const { data, error } = await supabase.storage
        .from('menu_images')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false,
          onUploadProgress: (progress) => {
            setUploadProgress(Math.round((progress.loaded / progress.total) * 100));
          }
        });
      
      if (error) throw error;
      
      // Получаване на публичен URL на качения файл
      const { data: urlData } = supabase.storage
        .from('menu_images')
        .getPublicUrl(data.path);
      
      // Актуализиране на формата с URL-а на изображението
      setFormData({
        ...formData,
        image_url: urlData.publicUrl
      });
      
      setIsUploading(false);
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Възникна грешка при качване на изображението');
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const fullData = {
        ...formData,
        restaurant_id: restaurant.id,
        price: parseFloat(formData.price)
      };
      
      let result;
      
      if (editingId) {
        const { data, error } = await supabase
          .from('menu_items')
          .update(fullData)
          .eq('id', editingId)
          .select();
        
        if (error) throw error;
        result = data[0];
        
        // Актуализиране на локалния списък
        setMenuItems(menuItems.map(item => 
          item.id === editingId ? { ...item, ...result } : item
        ));
      } else {
        const { data, error } = await supabase
          .from('menu_items')
          .insert([fullData])
          .select();
        
        if (error) throw error;
        result = data[0];
        
        // Добавяне към локалния списък
        setMenuItems([...menuItems, result]);
      }
      
      resetForm();
      setShowForm(false);
    } catch (error) {
      console.error('Error saving menu item:', error);
      alert('Възникна грешка при запазване на продукта');
    }
  };

  const handleCategorySubmit = async (e) => {
    e.preventDefault();
    
    try {
      const fullData = {
        ...categoryFormData,
        restaurant_id: restaurant.id
      };
      
      let result;
      
      if (editingCategoryId) {
        const { data, error } = await supabase
          .from('menu_categories')
          .update(fullData)
          .eq('id', editingCategoryId)
          .select();
        
        if (error) throw error;
        result = data[0];
        
        // Актуализиране на локалния списък
        setCategories(categories.map(cat => 
          cat.id === editingCategoryId ? { ...cat, ...result } : cat
        ));
      } else {
        const { data, error } = await supabase
          .from('menu_categories')
          .insert([fullData])
          .select();
        
        if (error) throw error;
        result = data[0];
        
        // Добавяне към локалния списък
        setCategories([...categories, result]);
      }
      
      resetCategoryForm();
      setShowCategoryForm(false);
    } catch (error) {
      console.error('Error saving category:', error);
      alert('Възникна грешка при запазване на категорията');
    }
  };

  const handleEdit = (item) => {
    setFormData({
      name: item.name,
      description: item.description || '',
      price: item.price.toString(),
      category_id: item.category_id,
      is_available: item.is_available,
      image_url: item.image_url || '',
      allergens: item.allergens || '',
      recommended: item.recommended || false
    });
    setEditingId(item.id);
    setShowForm(true);
  };

  const handleEditCategory = (category) => {
    setCategoryFormData({
      name: category.name,
      order: category.order
    });
    setEditingCategoryId(category.id);
    setShowCategoryForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Сигурни ли сте, че искате да изтриете този продукт?")) {
      return;
    }
    
    try {
      const { error } = await supabase
        .from('menu_items')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      // Премахване от локалния списък
      setMenuItems(menuItems.filter(item => item.id !== id));
    } catch (error) {
      console.error('Error deleting menu item:', error);
      alert('Възникна грешка при изтриване на продукта');
    }
  };

  const handleDeleteCategory = async (id) => {
    // Проверка дали категорията се използва в продукти
    const itemsInCategory = menuItems.filter(item => item.category_id === id);
    
    if (itemsInCategory.length > 0) {
      alert(`Не можете да изтриете тази категория, защото има ${itemsInCategory.length} продукта в нея.`);
      return;
    }
    
    if (!window.confirm("Сигурни ли сте, че искате да изтриете тази категория?")) {
      return;
    }
    
    try {
      const { error } = await supabase
        .from('menu_categories')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      // Премахване от локалния списък
      setCategories(categories.filter(cat => cat.id !== id));
      
      // Ако текущо избраната категория е изтрита, връщаме се към "всички"
      if (selectedCategory === id) {
        setSelectedCategory('all');
      }
    } catch (error) {
      console.error('Error deleting category:', error);
      alert('Възникна грешка при изтриване на категорията');
    }
  };

  const handleCategoryChange = (categoryId) => {
    setSelectedCategory(categoryId);
  };

  if (loading) {
    return <div>Зареждане на меню...</div>;
  }

  return (
    <div>
      <h1>Меню: {restaurant?.name}</h1>
      
      <div className="admin-controls menu-controls">
        <div className="admin-filter-container">
          <h3>Филтриране по категория:</h3>
          <div className="category-filters">
            <button 
              className={`admin-filter-btn ${selectedCategory === 'all' ? 'active' : ''}`} 
              onClick={() => handleCategoryChange('all')}
            >
              Всички категории
            </button>
            {categories.map(category => (
              <button 
                key={category.id} 
                className={`admin-filter-btn ${selectedCategory === category.id ? 'active' : ''}`}
                onClick={() => handleCategoryChange(category.id)}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>
        
        <div className="admin-button-group">
          <button 
            className="admin-add-btn"
            onClick={() => {
              resetCategoryForm();
              setShowCategoryForm(!showCategoryForm);
              if (showForm) setShowForm(false);
            }}
          >
            {showCategoryForm ? 'Отказ' : 'Добави категория'}
          </button>
          
          <button 
            className="admin-add-btn"
            onClick={() => {
              resetForm();
              setShowForm(!showForm);
              if (showCategoryForm) setShowCategoryForm(false);
            }}
          >
            {showForm ? 'Отказ' : 'Добави продукт'}
          </button>
        </div>
      </div>
      
      {/* Форма за категории */}
      {showCategoryForm && (
        <div className="admin-form-container">
          <h2>{editingCategoryId ? 'Редактиране на категория' : 'Нова категория'}</h2>
          <form onSubmit={handleCategorySubmit} className="admin-form">
            <div className="form-group">
              <label>Име на категория</label>
              <input 
                type="text" 
                name="name" 
                value={categoryFormData.name} 
                onChange={handleCategoryInputChange} 
                required 
              />
            </div>
            
            <div className="form-group">
              <label>Ред на показване</label>
              <input 
                type="number" 
                name="order" 
                value={categoryFormData.order} 
                onChange={handleCategoryInputChange} 
                required 
                min="0"
              />
            </div>
            
            <div className="form-buttons">
              <button type="button" className="admin-cancel-btn" onClick={() => setShowCategoryForm(false)}>
                Отказ
              </button>
              <button type="submit" className="admin-submit-btn">
                {editingCategoryId ? 'Запази промените' : 'Добави категория'}
              </button>
            </div>
          </form>
        </div>
      )}
      
      {/* Управление на категории */}
      <div className="admin-categories-section">
        <h2>Управление на категории</h2>
        {categories.length === 0 ? (
          <div className="admin-no-data">
            <p>Няма добавени категории. Добавете първата категория.</p>
          </div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Име</th>
                <th>Ред</th>
                <th>Брой продукти</th>
                <th>Действия</th>
              </tr>
            </thead>
            <tbody>
              {categories.map(category => {
                const itemCount = menuItems.filter(item => item.category_id === category.id).length;
                return (
                  <tr key={category.id}>
                    <td>{category.name}</td>
                    <td>{category.order}</td>
                    <td>{itemCount}</td>
                    <td>
                      <button 
                        className="admin-action-btn edit"
                        onClick={() => handleEditCategory(category)}
                      >
                        <i className="fas fa-edit"></i>
                      </button>
                      <button 
                        className="admin-action-btn delete"
                        onClick={() => handleDeleteCategory(category.id)}
                        disabled={itemCount > 0}
                      >
                        <i className="fas fa-trash"></i>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
      
      {/* Форма за добавяне/редактиране на продукт */}
      {showForm && (
        <div className="admin-form-container">
          <h2>{editingId ? 'Редактиране на продукт' : 'Нов продукт'}</h2>
          <form onSubmit={handleSubmit} className="admin-form">
            <div className="form-group">
              <label>Име на продукт</label>
              <input 
                type="text" 
                name="name" 
                value={formData.name} 
                onChange={handleInputChange} 
                required 
              />
            </div>
            
            <div className="form-group">
              <label>Категория</label>
              <select 
                name="category_id" 
                value={formData.category_id} 
                onChange={handleInputChange} 
                required
              >
                <option value="">Изберете категория</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="form-group">
              <label>Цена (в лв.)</label>
              <input 
                type="number" 
                name="price" 
                value={formData.price} 
                onChange={handleInputChange} 
                required 
                min="0"
                step="0.01"
              />
            </div>
            
            <div className="form-group">
              <label>Описание</label>
              <textarea 
                name="description" 
                value={formData.description} 
                onChange={handleInputChange} 
                placeholder="Описание на продукта"
              />
            </div>
            
            <div className="form-group">
              <label>Изображение</label>
              {formData.image_url ? (
                <div className="image-preview">
                  <img src={formData.image_url} alt="Предварителен преглед" />
                  <button 
                    type="button" 
                    onClick={() => setFormData({...formData, image_url: ''})}
                    className="remove-image-btn"
                  >
                    <i className="fas fa-times"></i> Премахни
                  </button>
                </div>
              ) : (
                <div className="upload-container">
                  <input 
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    disabled={isUploading}
                    ref={fileInputRef}
                  />
                  {isUploading && (
                    <div className="upload-progress">
                      <div 
                        className="progress-bar" 
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                      <span>{uploadProgress}%</span>
                    </div>
                  )}
                  <div className="upload-separator">или</div>
                  <input 
                    type="url" 
                    name="image_url" 
                    value={formData.image_url} 
                    onChange={handleInputChange} 
                    placeholder="Въведете URL на изображение"
                    disabled={isUploading}
                  />
                </div>
              )}
            </div>
            
            <div className="form-group">
              <label>Алергени</label>
              <input 
                type="text" 
                name="allergens" 
                value={formData.allergens} 
                onChange={handleInputChange} 
                placeholder="Напр.: глутен, млечни продукти, ядки"
              />
            </div>
            
            <div className="form-group checkbox-group">
              <label>
                <input 
                  type="checkbox" 
                  name="is_available" 
                  checked={formData.is_available} 
                  onChange={handleInputChange} 
                />
                Наличен продукт
              </label>
            </div>
            
            <div className="form-group checkbox-group">
              <label>
                <input 
                  type="checkbox" 
                  name="recommended" 
                  checked={formData.recommended} 
                  onChange={handleInputChange} 
                />
                Препоръчан продукт
              </label>
            </div>
            
            <div className="form-buttons">
              <button type="button" className="admin-cancel-btn" onClick={() => setShowForm(false)}>
                Отказ
              </button>
              <button 
                type="submit" 
                className="admin-submit-btn"
                disabled={isUploading}
              >
                {editingId ? 'Запази промените' : 'Добави продукт'}
              </button>
            </div>
          </form>
        </div>
      )}
      
      {/* Списък с продукти */}
      <div className="admin-table-container">
        <h2>Продукти в менюто</h2>
        {menuItems.length === 0 ? (
          <div className="admin-no-data">
            <p>Няма добавени продукти в менюто.</p>
          </div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Изображение</th>
                <th>Име</th>
                <th>Категория</th>
                <th>Цена</th>
                <th>Статус</th>
                <th>Препоръчан</th>
                <th>Действия</th>
              </tr>
            </thead>
            <tbody>
              {menuItems.map(item => (
                <tr key={item.id}>
                  <td>
                    {item.image_url ? (
                      <img src={item.image_url} alt={item.name} className="menu-item-thumbnail" />
                    ) : (
                      <div className="menu-item-no-image">Няма изображение</div>
                    )}
                  </td>
                  <td>
                    <strong>{item.name}</strong>
                    {item.description && <p className="menu-item-description">{item.description}</p>}
                    {item.allergens && <p className="menu-item-allergens">Алергени: {item.allergens}</p>}
                  </td>
                  <td>{item.menu_categories?.name || 'Без категория'}</td>
                  <td>{item.price?.toFixed(2)} лв.</td>
                  <td>
                    <span className={`status-badge ${item.is_available ? 'active' : 'inactive'}`}>
                      {item.is_available ? 'Наличен' : 'Неналичен'}
                    </span>
                  </td>
                  <td>
                    {item.recommended ? <i className="fas fa-star recommended-star"></i> : '-'}
                  </td>
                  <td>
                    <button 
                      className="admin-action-btn edit"
                      onClick={() => handleEdit(item)}
                    >
                      <i className="fas fa-edit"></i>
                    </button>
                    <button 
                      className="admin-action-btn delete"
                      onClick={() => handleDelete(item.id)}
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

export default AdminMenuSection;