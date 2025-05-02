import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import { AuthProvider } from './context/AuthContext';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import RestaurantDetails from './pages/RestaurantDetails';
import Reservation from './pages/Reservation';
import Events from './pages/RestaurantEvents';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import AdminDashboard from './pages/AdminDashboard';
import UserDashboard from './pages/UserDashboard';
import UserReservations from './pages/UserReservations';
import UserFavorites from './pages/UserFavorites';
import NotFound from './pages/NotFound';
import ProtectedRoute from './components/ProtectedRoute';
import SimpleAdminDashboard from './pages/SimpleAdminDashboard';
import TestAdmin from './pages/TestAdmin';
import RestaurantMenu from './pages/RestaurantMenu';
import RestaurantEvents from './pages/RestaurantEvents';
import RestaurantSpecialOffers from './pages/RestaurantSpecialOffers';

// Import Font Awesome
import '@fortawesome/fontawesome-free/css/all.min.css';

// Импортиране на Admin CSS стиловете
import './styles/Admin.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Header />
          <Routes>
            {/* Публични маршрути */}
            <Route path="/" element={<Home />} />
            <Route path="/restaurant/:id" element={<RestaurantDetails />} />
            <Route path="/restaurant/:id/reservation" element={<Reservation />} />
            <Route path="/restaurant/:id/events" element={<Events />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/test-admin" element={<TestAdmin />} />
            <Route path="/restaurant/:id/menu" element={<RestaurantMenu />} />
            <Route path="/restaurant/:id/events" element={<RestaurantEvents />} />
            <Route path="/restaurant/:id/special-offers" element={<RestaurantSpecialOffers />} />
            {/* Защитени маршрути за потребители */}
            <Route path="/profile" element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } />
            
            <Route path="/user/dashboard" element={
              <ProtectedRoute>
                <UserDashboard />
              </ProtectedRoute>
            } />
            
            <Route path="/user/reservations" element={
              <ProtectedRoute>
                <UserReservations />
              </ProtectedRoute>
            } />
            
            <Route path="/user/favorites" element={
              <ProtectedRoute>
                <UserFavorites />
              </ProtectedRoute>
            } />
            
            {/* Незащитени тестови маршрути */}
            <Route path="/admin-test" element={<SimpleAdminDashboard />} />
            <Route path="/admin-debug" element={<TestAdmin />} />
            
            {/* Административни маршрути - подредени от най-специфични към най-общи */}
            <Route path="/admin/restaurant/:restaurantId/:section" element={
              <ProtectedRoute adminRequired={true}>
                <AdminDashboard />
              </ProtectedRoute>
            } />
            
            <Route path="/admin/:section" element={
              <ProtectedRoute adminRequired={true}>
                <AdminDashboard />
              </ProtectedRoute>
            } />
            
            <Route path="/admin" element={
              <ProtectedRoute adminRequired={true}>
                <AdminDashboard />
              </ProtectedRoute>
            } />
            
            {/* Маршрут за всички други невалидни URL адреси */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;