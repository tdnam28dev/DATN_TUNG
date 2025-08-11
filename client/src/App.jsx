import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './views/admin/test_api/Home';
import CrudRestaurants from './views/admin/test_api/CrudRestaurants';
import CrudTables from './views/admin/test_api/CrudTables';
import CrudMenus from './views/admin/test_api/CrudMenus';
import CrudMenuItems from './views/admin/test_api/CrudMenuItems';
import CrudOrders from './views/admin/test_api/CrudOrders';
import CrudUsers from './views/admin/test_api/CrudUsers';
import OrderStaff from './views/staff/order';
// import AuthPage from './views/admin/test_api/AuthPage';
import AdminDashboard from './views/admin/AdminDashboard';
import Login from './views/pages/login/login';

function App() {
  const [token, setToken] = useState(localStorage.getItem('accessToken') || '');
  const [userId, setUserId] = useState(localStorage.getItem('userId') || '');

  useEffect(() => {
    if (token) {
      localStorage.setItem('accessToken', token);
    }
    if (userId) {
      localStorage.setItem('userId', userId);
    }
  }, [token, userId]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login setToken={setToken} />} />
        <Route path="/" element={token ? <Home /> : <Login setToken={setToken} />} />
        <Route path="/crud-restaurants" element={token ? <CrudRestaurants token={token} /> : <Login setToken={setToken} />} />
        <Route path="/crud-tables" element={token ? <CrudTables token={token} /> : <Login setToken={setToken} />} />
        <Route path="/crud-menus" element={token ? <CrudMenus token={token} /> : <Login setToken={setToken} />} />
        <Route path="/crud-menu-items" element={token ? <CrudMenuItems token={token} /> : <Login setToken={setToken} />} />
        <Route path="/crud-orders" element={token ? <CrudOrders token={token} /> : <Login setToken={setToken} />} />
        <Route path="/crud-users" element={token ? <CrudUsers token={token} /> : <Login setToken={setToken} />} />
        <Route path="/admin-dashboard" element={token ? <AdminDashboard token={token} userId={userId} /> : <Login setToken={setToken} setUserId={setUserId} />} />
        <Route path="/order" element={token ? <OrderStaff token={token} /> : <Login setToken={setToken} />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
