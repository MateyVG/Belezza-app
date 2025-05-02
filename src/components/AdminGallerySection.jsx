import React, { useState, useEffect } from 'react';

function AdminMenuSection({ restaurant, supabase }) {
  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    if (!restaurant) return;

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
    
    fetchMenuData();
  }, [restaurant, supabase, selectedCategory]);

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
          <button className="admin-add-btn">
            Добави категория
          </button>
          
          <button className="admin-add-btn">
            Добави продукт
          </button>
        </div>
      </div>
      
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
                <th>Име</th>
                <th>Категория</th>
                <th>Цена</th>
                <th>Статус</th>
                <th>Действия</th>
              </tr>
            </thead>
            <tbody>
              {menuItems.map(item => (
                <tr key={item.id}>
                  <td>{item.name}</td>
                  <td>{item.menu_categories?.name || 'Без категория'}</td>
                  <td>{item.price?.toFixed(2)} лв.</td>
                  <td>
                    <span className={`status-badge ${item.is_available ? 'active' : 'inactive'}`}>
                      {item.is_available ? 'Наличен' : 'Неналичен'}
                    </span>
                  </td>
                  <td>
                    <button className="admin-action-btn edit">
                      <i className="fas fa-edit"></i>
                    </button>
                    <button className="admin-action-btn delete">
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