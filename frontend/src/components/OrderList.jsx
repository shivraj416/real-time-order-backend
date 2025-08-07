import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { FaCheckCircle, FaHourglassHalf, FaSpinner, FaSearch, FaTrash } from 'react-icons/fa';

const OrderList = () => {
  const [orders, setOrders] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchOrders = async () => {
    const { data } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });
    setOrders(data);
  };

  useEffect(() => {
    fetchOrders();

    const subscription = supabase
      .channel('orders-db-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        () => fetchOrders()
      )
      .subscribe();

    return () => supabase.removeChannel(subscription);
  }, []);

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed':
        return (
          <span className="badge bg-success d-flex align-items-center gap-1" title="Order is completed">
            <FaCheckCircle /> Completed
          </span>
        );
      case 'in_progress':
        return (
          <span className="badge bg-primary d-flex align-items-center gap-1">
            <FaSpinner className="spin" /> In Progress
          </span>
        );
      case 'pending':
      default:
        return (
          <span className="badge bg-warning text-dark d-flex align-items-center gap-1">
            <FaHourglassHalf /> Pending
          </span>
        );
    }
  };

  const handleDelete = async (orderId) => {
    const confirm = window.confirm("Are you sure you want to delete this order?");
    if (!confirm) return;

    const { error } = await supabase
      .from('orders')
      .delete()
      .eq('id', orderId);

    if (error) {
      console.error('Error deleting order:', error.message);
    }
  };

  const filteredOrders = orders.filter((order) =>
    `${order.customer_name} ${order.order_type}`
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
  );

  return (
    <div className="mt-4">
      <h4 className="mb-3">📝 All Orders</h4>

      {/* Search Bar */}
      <div className="input-group mb-3 shadow-sm">
        <span className="input-group-text bg-white">
          <FaSearch />
        </span>
        <input
          type="text"
          className="form-control"
          placeholder="Search by customer name or order type"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Order List */}
      <div className="card shadow-sm p-3 bg-white rounded">
        <ul
          className="list-group list-group-flush"
          style={{ maxHeight: '500px', overflowY: 'auto' }}
        >
          {filteredOrders.length > 0 ? (
            filteredOrders.map((order) => (
              <li
                key={order.id}
                className="list-group-item d-flex justify-content-between align-items-start border-start border-4 border-primary-subtle mb-2 shadow-sm rounded"
              >
                <div>
                  <h6 className="fw-bold mb-1">
                    {order.customer_name}{' '}
                    <small className="text-muted">({order.order_type})</small>
                  </h6>
                  <div className="text-muted small">
                    ₹{order.total_amount} &middot; Deadline: {formatDate(order.deadline)}
                  </div>
                </div>
                <div className="d-flex align-items-center gap-2">
                  {getStatusBadge(order.status)}
                  <button
                    className="btn btn-sm btn-danger"
                    title="Delete order"
                    onClick={() => handleDelete(order.id)}
                  >
                    <FaTrash />
                  </button>
                </div>
              </li>
            ))
          ) : (
            <li className="list-group-item text-muted">No matching orders found.</li>
          )}
        </ul>
      </div>
    </div>
  );
};

export default OrderList;
