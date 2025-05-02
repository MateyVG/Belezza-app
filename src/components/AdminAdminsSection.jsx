import React, { useState, useEffect } from 'react';

function AdminAdminsSection({ supabase }) {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [restaurants, setRestaurants] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Зареждане на администратори
      const { data: adminRolesData, error: adminRolesError } = await supabase
        .from('user_roles')
        .select(`
          id,
          user_id,
          role,
          restaurant_id,
          restaurants:restaurant_id (id, name)
        `)
        .in('role', ['super_admin', 'restaurant_admin']);
      
      if (adminRolesError) throw adminRolesError;
      
      // Зареждане на потребителски данни за всеки администратор
      const userIds = adminRolesData.map(admin => admin.user_id);
      
      const { data: usersData, error: usersError } = await supabase
        .from('users')
        .select('id, email, name, phone')
        .in('id', userIds);
      
      if (usersError) {
        // Ако няма таблица users, използваме данните от auth.users
        console.log('Грешка при зареждане от users, опитваме от auth.users');
        
        // Комбиниране на данните без допълнителна информация
        setAdmins(adminRolesData.map(admin => ({
          ...admin,
          email: 'Потребител ' + admin.user_id.substring(0, 8), // Примерен заместител
          name: '',
          phone: ''
        })));
      } else {
        // Комбиниране на данните от двете заявки
        const combinedData = adminRolesData.map(admin => {
          const userData = usersData.find(user => user.id === admin.user_id) || {};
          return {
            ...admin,
            email: userData.email || '',
            name: userData.name || '',
            phone: userData.phone || ''
          };
        });
        
        setAdmins(combinedData);
      }
      
      // Зареждане на всички ресторанти
      const { data: restaurantsData, error: restaurantsError } = await supabase
        .from('restaurants')
        .select('id, name');
      
      if (restaurantsError) throw restaurantsError;
      
      setRestaurants(restaurantsData || []);
    } catch (error) {
      console.error('Error fetching admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Зареждане на администратори...</div>;
  }

  return (
    <div>
      <h1>Управление на администратори</h1>
      
      <div className="admin-controls">
        <button className="admin-add-btn">
          Добави администратор
        </button>
      </div>
      
      <div className="admin-table-container">
        <h2>Списък с администратори</h2>
        {admins.length === 0 ? (
          <div className="admin-no-data">
            <p>Няма намерени администратори.</p>
          </div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Имейл</th>
                <th>Име</th>
                <th>Телефон</th>
                <th>Роля</th>
                <th>Ресторант</th>
                <th>Действия</th>
              </tr>
            </thead>
            <tbody>
              {admins.map(admin => (
                <tr key={admin.id}>
                  <td>{admin.email}</td>
                  <td>{admin.name || '-'}</td>
                  <td>{admin.phone || '-'}</td>
                  <td>
                    <span className={`role-badge ${admin.role}`}>
                      {admin.role === 'super_admin' ? 'Главен администратор' : 'Ресторантски администратор'}
                    </span>
                  </td>
                  <td>{admin.restaurants?.name || '-'}</td>
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

export default AdminAdminsSection;