import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';
import { useAuth } from '../context/AuthContext';

// Останалият код...

const supabaseUrl = 'https://lnquyopfvuikhjbjsiqk.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxucXV5b3BmdnVpa2hqYmpzaXFrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU0ODA5MDEsImV4cCI6MjA2MTA1NjkwMX0.GmZ-5FzZkJyMorLGggF_Jegx2Atn0wRiNKCx4esecJw';
const supabase = createClient(supabaseUrl, supabaseKey);

function UserFavorites() {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        if (!user) return;

        // Зареждане на любими ресторанти за потребителя
        const { data, error } = await supabase
          .from('favorites')
          .select(`
            *,
            restaurants:restaurant_id(*)
          `)
          .eq('user_id', user.id);

        if (error) throw error;
        setFavorites(data);
      } catch (error) {
        console.error('Грешка при зареждане на любими ресторанти:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFavorites();
  }, [user]);

  const removeFavorite = async (id) => {
    try {
      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Обновяване на списъка
      setFavorites(favorites.filter(fav => fav.id !== id));
    } catch (error) {
      console.error('Грешка при премахване от любими:', error);
    }
  };

  if (loading) {
    return <div className="loading">Зареждане на любими ресторанти...</div>;
  }

  return (
    <div className="user-favorites-container">
      <h1>Моите любими ресторанти</h1>
      
      {favorites.length === 0 ? (
        <div className="no-favorites">
          <p>Нямате добавени любими ресторанти.</p>
        </div>
      ) : (
        <div className="favorites-grid">
          {favorites.map(favorite => (
            <div key={favorite.id} className="favorite-card">
              <div className="favorite-image">
                <img 
                  src={favorite.restaurants.image_url || 'https://via.placeholder.com/300x200?text=Няма+изображение'} 
                  alt={favorite.restaurants.name} 
                />
              </div>
              
              <div className="favorite-info">
                <h3>{favorite.restaurants.name}</h3>
                <p>{favorite.restaurants.address}</p>
              </div>
              
              <div className="favorite-actions">
                <Link to={`/restaurant/${favorite.restaurant_id}`} className="view-restaurant-btn">
                  Виж ресторанта
                </Link>
                
                <button 
                  className="remove-favorite-btn"
                  onClick={() => removeFavorite(favorite.id)}
                >
                  Премахни от любими
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default UserFavorites;