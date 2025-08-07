import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import DashboardPage from './pages/DashboardPage';
import OrderListPage from './pages/OrderListPage';
import OrderFormPage from './pages/OrderFormPage';

const App = () => {
  return (
    <div className="container py-4">
      <nav className="mb-4">
        <ul className="nav nav-tabs">
          <li className="nav-item">
            <Link className="nav-link" to="/">Dashboard</Link>
          </li>
          <li className="nav-item">
            <Link className="nav-link" to="/orders">Orders</Link>
          </li>
          <li className="nav-item">
            <Link className="nav-link" to="/create">Create Order</Link>
          </li>
        </ul>
      </nav>

      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/orders" element={<OrderListPage />} />
        <Route path="/create" element={<OrderFormPage />} />
      </Routes>
    </div>
  );
};

export default App;
