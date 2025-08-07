import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import {
  FaClipboardList,
  FaRupeeSign,
  FaShoppingCart,
  FaExclamationTriangle,
} from 'react-icons/fa';

const Dashboard = () => {
  const [metrics, setMetrics] = useState({
    todayCount: 0,
    todayRevenue: 0,
    totalOrders: 0,
    missedDeadlines: 0,
  });

  const fetchMetrics = async () => {
    const now = new Date();

    // Convert to UTC day start and end
    const todayStartUTC = new Date(Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate(),
      0, 0, 0
    )).toISOString();

    const todayEndUTC = new Date(Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate(),
      23, 59, 59
    )).toISOString();

    // Fetch all orders
    const { data: allOrders, error } = await supabase.from('orders').select('*');

    if (error) {
      console.error('Error fetching orders:', error);
      return;
    }

    if (!allOrders) return;

    // Filter orders created today
    const todayOrders = allOrders.filter(order => {
      const createdAt = order.created_at;
      return createdAt >= todayStartUTC && createdAt <= todayEndUTC;
    });

    // Count missed deadlines
    const missedDeadlines = allOrders.filter(order =>
      order?.deadline &&
      new Date(order.deadline) < new Date() &&
      order.status !== 'completed'
    );

    // Set metrics
    setMetrics({
      todayCount: todayOrders.length,
      todayRevenue: todayOrders.reduce((sum, o) => sum + (o.total_amount || 0), 0),
      totalOrders: allOrders.length,
      missedDeadlines: missedDeadlines.length,
    });
  };

  useEffect(() => {
    fetchMetrics();

    const sub = supabase
      .channel('dashboard-live')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => {
        fetchMetrics();
      })
      .subscribe();

    const interval = setInterval(fetchMetrics, 60000); // Optional auto-refresh every 60s

    return () => {
      supabase.removeChannel(sub);
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="my-4">
      <div className="row g-4">
        <DashboardCard
          title="Today's Orders"
          value={metrics.todayCount}
          icon={<FaClipboardList />}
          color="primary"
        />
        <DashboardCard
          title="Today's Revenue"
          value={`₹${metrics.todayRevenue.toLocaleString('en-IN')}`}
          icon={<FaRupeeSign />}
          color="success"
        />
        <DashboardCard
          title="Total Orders"
          value={metrics.totalOrders}
          icon={<FaShoppingCart />}
          color="info"
        />
        <DashboardCard
          title="Missed Deadlines"
          value={metrics.missedDeadlines}
          icon={<FaExclamationTriangle />}
          color="danger"
          progress={Math.min(
            metrics.totalOrders === 0
              ? 0
              : (metrics.missedDeadlines / metrics.totalOrders) * 100,
            100
          )}
        />
      </div>
    </div>
  );
};

const DashboardCard = ({ title, value, icon, color, progress }) => {
  return (
    <div className="col-md-6 col-lg-3">
      <div className={`card border-0 shadow h-100`}>
        <div className="card-body position-relative">
          <div className={`bg-${color} bg-opacity-10 rounded-circle p-3 mb-3 d-inline-block`}>
            <span className={`text-${color} fs-4`}>{icon}</span>
          </div>
          <h6 className="text-muted">{title}</h6>
          <h4 className="fw-bold">{value}</h4>
          {progress !== undefined && (
            <div className="progress mt-3" style={{ height: '6px' }}>
              <div
                className={`progress-bar bg-${color}`}
                role="progressbar"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
