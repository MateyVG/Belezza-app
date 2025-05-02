import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://lnquyopfvuikhjbjsiqk.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxucXV5b3BmdnVpa2hqYmpzaXFrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU0ODA5MDEsImV4cCI6MjA2MTA1NjkwMX0.GmZ-5FzZkJyMorLGggF_Jegx2Atn0wRiNKCx4esecJw';
const supabase = createClient(supabaseUrl, supabaseKey);

function RestaurantMenu() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [restaurant, setRestaurant] = useState(null);
  const [categories, setCategories] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);

  useEffect(() => {
    async function fetchRestaurantAndMenu() {
      try {
        setLoading(true);
        
        // Зареждане на ресторант
        const { data: restaurantData, error: restaurantError } = await supabase
          .from('restaurants')
          .select('*')
          .eq('id', id)
          .single();
        
        if (restaurantError) throw restaurantError;
        setRestaurant(restaurantData);
        
        // Зареждане на категории
        const { data: categoriesData, error: categoriesError } = await supabase
          .from('menu_categories')
          .select('*')
          .eq('restaurant_id', id)
          .order('"order"', { ascending: true });
        
        if (categoriesError) throw categoriesError;
        setCategories(categoriesData || []);
        
        if (categoriesData && categoriesData.length > 0) {
          setSelectedCategory(categoriesData[0].id);
        }
        
        // Зареждане на продукти
        const { data: menuData, error: menuError } = await supabase
          .from('menu_items')
          .select(`
            *,
            menu_categories:category_id (id, name)
          `)
          .eq('restaurant_id', id);
        
        if (menuError) throw menuError;
        setMenuItems(menuData || []);
        
      } catch (error) {
        console.error('Грешка при зареждане на меню:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    }
    
    fetchRestaurantAndMenu();
  }, [id]);

  const handleCategoryClick = (categoryId) => {
    setSelectedCategory(categoryId);
  };

  const goBack = () => {
    navigate(`/restaurant/${id}`);
  };

  if (loading) {
    return <div style={{padding: '20px', textAlign: 'center'}}>Зареждане на меню...</div>;
  }

  if (error) {
    return <div style={{padding: '20px', textAlign: 'center', color: 'red'}}>Грешка: {error}</div>;
  }

  if (!restaurant) {
    return <div style={{padding: '20px', textAlign: 'center', color: 'red'}}>Ресторантът не беше намерен</div>;
  }

  const filteredItems = selectedCategory 
    ? menuItems.filter(item => item.category_id === selectedCategory)
    : menuItems;

  return (
    <div style={{maxWidth: '1200px', margin: '0 auto', padding: '20px', color: '#e0e0e0'}}>
      <button 
        onClick={goBack} 
        style={{marginBottom: '20px', padding: '8px 16px', background: '#333', border: 'none', color: 'white', borderRadius: '4px', cursor: 'pointer'}}
      >
        &larr; Назад към ресторанта
      </button>
      
      <h1 style={{marginBottom: '30px'}}>{restaurant.name} - Меню</h1>
      
      {categories.length === 0 ? (
        <div style={{textAlign: 'center', padding: '30px', background: '#252525', borderRadius: '8px'}}>
          <p>Менюто на този ресторант все още не е добавено.</p>
        </div>
      ) : (
        <>
          {/* Категории */}
          <div style={{display: 'flex', overflowX: 'auto', gap: '10px', marginBottom: '30px', padding: '5px 0'}}>
            {categories.map(category => (
              <button 
                key={category.id}
                onClick={() => handleCategoryClick(category.id)}
                style={{
                  padding: '10px 20px',
                  minWidth: 'fit-content',
                  background: selectedCategory === category.id ? '#e74c3c' : '#333',
                  border: 'none',
                  borderRadius: '20px',
                  color: 'white',
                  cursor: 'pointer'
                }}
              >
                {category.name}
              </button>
            ))}
          </div>
          
          {/* Продукти */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '20px'
          }}>
            {filteredItems.length === 0 ? (
              <div style={{gridColumn: '1 / -1', textAlign: 'center', padding: '20px'}}>
                <p>Няма продукти в тази категория</p>
              </div>
            ) : (
              filteredItems.map(item => (
                <div key={item.id} style={{
                  background: '#252525',
                  borderRadius: '8px',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column'
                }}>
                  {item.image_url && (
                    <div style={{height: '180px'}}>
                      <img 
                        src={item.image_url} 
                        alt={item.name} 
                        style={{width: '100%', height: '100%', objectFit: 'cover'}}
                      />
                    </div>
                  )}
                  
                  <div style={{padding: '20px', flex: '1', display: 'flex', flexDirection: 'column'}}>
                    <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '10px'}}>
                      <h3 style={{margin: '0'}}>{item.name}</h3>
                      <span style={{fontWeight: 'bold', color: '#e74c3c'}}>{item.price.toFixed(2)} лв.</span>
                    </div>
                    
                    {item.description && (
                      <p style={{margin: '0 0 10px 0', fontSize: '14px', color: '#aaa', flex: '1'}}>
                        {item.description}
                      </p>
                    )}
                    
                    {item.allergens && (
                      <p style={{margin: '0', fontSize: '12px', fontStyle: 'italic', color: '#999'}}>
                        Алергени: {item.allergens}
                      </p>
                    )}
                    
                    {item.recommended && (
                      <div style={{
                        marginTop: '10px',
                        padding: '4px 8px',
                        background: 'rgba(231, 76, 60, 0.2)',
                        borderRadius: '4px',
                        display: 'inline-block',
                        alignSelf: 'flex-start'
                      }}>
                        <span style={{fontSize: '12px', color: '#e74c3c'}}>Препоръчано</span>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default RestaurantMenu;