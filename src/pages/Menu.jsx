import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUtensils, faWineGlass, faCoffee, faBirthdayCake } from '@fortawesome/free-solid-svg-icons';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://lnquyopfvuikhjbjsiqk.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxucXV5b3BmdnVpa2hqYmpzaXFrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU0ODA5MDEsImV4cCI6MjA2MTA1NjkwMX0.GmZ-5FzZkJyMorLGggF_Jegx2Atn0wRiNKCx4esecJw';

const supabase = createClient(supabaseUrl, supabaseKey);

// Стилизирани компоненти
const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 3rem;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  margin-bottom: 1rem;
  color: #e74c3c;
`;

const Subtitle = styled.p`
  font-size: 1.2rem;
  color: #777;
  max-width: 700px;
  margin: 0 auto;
`;

const CategoryTabs = styled.div`
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 2rem;
`;

const CategoryTab = styled.button`
  background-color: ${props => props.active ? '#e74c3c' : '#232323'};
  color: white;
  border: none;
  padding: 12px 20px;
  border-radius: 30px;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  
  svg {
    margin-right: 8px;
    font-size: 1.2rem;
  }
  
  &:hover {
    background-color: ${props => props.active ? '#c0392b' : '#333'};
    transform: translateY(-2px);
  }
`;

const MenuGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 25px;
`;

const MenuItem = styled.div`
  background-color: #232323;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;
  
  &:hover {
    transform: translateY(-5px);
  }
`;

const MenuItemImage = styled.div`
  height: 200px;
  background-image: url(${props => props.imageUrl});
  background-size: cover;
  background-position: center;
`;

const MenuItemContent = styled.div`
  padding: 20px;
  color: white;
`;

const MenuItemHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
`;

const MenuItemTitle = styled.h3`
  font-size: 1.3rem;
  margin: 0;
`;

const MenuItemPrice = styled.span`
  background-color: #e74c3c;
  color: white;
  padding: 5px 10px;
  border-radius: 20px;
  font-weight: bold;
`;

const MenuItemDescription = styled.p`
  color: #aaa;
  margin: 0;
  line-height: 1.5;
`;

const LoadingMessage = styled.div`
  text-align: center;
  font-size: 1.2rem;
  padding: 3rem;
  color: #555;
`;

const ErrorMessage = styled.div`
  text-align: center;
  font-size: 1.2rem;
  padding: 3rem;
  color: #e74c3c;
`;

const Menu = () => {
  const { id } = useParams();
  const [restaurant, setRestaurant] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeCategory, setActiveCategory] = useState('all');
  
  // Категории за менюто
  const categories = [
    { id: 'all', name: 'Всички', icon: faUtensils },
    { id: 'main', name: 'Основни', icon: faUtensils },
    { id: 'drinks', name: 'Напитки', icon: faWineGlass },
    { id: 'desserts', name: 'Десерти', icon: faBirthdayCake },
    { id: 'coffee', name: 'Кафе', icon: faCoffee }
  ];
  
  // Зареждане на данни за ресторанта и менюто
  useEffect(() => {
    const fetchRestaurantAndMenu = async () => {
      try {
        setLoading(true);
        
        // Зареждане на ресторанта
        const { data: restaurantData, error: restaurantError } = await supabase
          .from('restaurants')
          .select('*')
          .eq('id', id)
          .single();
          
        if (restaurantError) throw restaurantError;
        
        setRestaurant(restaurantData);
        
        // Зареждане на менюто
        const { data: menuData, error: menuError } = await supabase
          .from('menu_items')
          .select('*')
          .eq('restaurant_id', id);
          
        if (menuError) throw menuError;
        
        setMenuItems(menuData);
      } catch (err) {
        console.error('Грешка при зареждане на меню:', err.message);
        setError('Възникна грешка при зареждане на менюто. Моля, опитайте отново по-късно.');
      } finally {
        setLoading(false);
      }
    };
    
    if (id) {
      fetchRestaurantAndMenu();
    }
  }, [id]);
  
  // Филтриране на елементите от менюто според избраната категория
  const filteredMenuItems = activeCategory === 'all'
    ? menuItems
    : menuItems.filter(item => item.category === activeCategory);
  
  if (loading) {
    return <LoadingMessage>Зареждане на меню...</LoadingMessage>;
  }
  
  if (error || !restaurant) {
    return <ErrorMessage>{error || 'Ресторантът не беше намерен.'}</ErrorMessage>;
  }
  
  return (
    <Container>
      <Header>
        <Title>Меню на {restaurant.name}</Title>
        <Subtitle>
          Насладете се на изисканите ястия, приготвени с най-качествени и пресни продукти.
        </Subtitle>
      </Header>
      
      <CategoryTabs>
        {categories.map(category => (
          <CategoryTab
            key={category.id}
            active={activeCategory === category.id}
            onClick={() => setActiveCategory(category.id)}
          >
            <FontAwesomeIcon icon={category.icon} />
            {category.name}
          </CategoryTab>
        ))}
      </CategoryTabs>
      
      <MenuGrid>
        {filteredMenuItems.length > 0 ? (
          filteredMenuItems.map(item => (
            <MenuItem key={item.id}>
              <MenuItemImage imageUrl={item.image_url || 'https://via.placeholder.com/300x200'} />
              <MenuItemContent>
                <MenuItemHeader>
                  <MenuItemTitle>{item.name}</MenuItemTitle>
                  <MenuItemPrice>{item.price.toFixed(2)} лв.</MenuItemPrice>
                </MenuItemHeader>
                <MenuItemDescription>{item.description}</MenuItemDescription>
              </MenuItemContent>
            </MenuItem>
          ))
        ) : (
          <p>Няма налични продукти в тази категория.</p>
        )}
      </MenuGrid>
    </Container>
  );
};

export default Menu;