import React, { useState } from "react";
import { supabase } from "../supabaseClient";
import { Spinner } from "react-bootstrap";
import { FaUser, FaEnvelope, FaClipboardList, FaRupeeSign, FaCalendarAlt, FaTasks } from "react-icons/fa";

const OrderForm = () => {
  const [customerName, setCustomerName] = useState("");
  const [orderType, setOrderType] = useState("");
  const [amount, setAmount] = useState("");
  const [deadline, setDeadline] = useState("");
  const [status, setStatus] = useState("pending");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const orderData = {
      customer_name: customerName.trim(),
      order_type: orderType.trim(),
      total_amount: parseFloat(amount),
      deadline: new Date(deadline).toISOString(),
      status: status.trim(),
      customer_email: email.trim(),
    };

    try {
      const { error } = await supabase.from("orders").insert([{
        customer_name: orderData.customer_name,
        order_type: orderData.order_type,
        total_amount: orderData.total_amount,
        deadline: orderData.deadline,
        status: orderData.status,
      }]);

      if (error) {
        alert("❌ Order creation failed: " + error.message);
        return;
      }

      const res = await fetch("http://127.0.0.1:54321/functions/v1/send-order-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      });

      if (!res.ok) {
        alert("⚠️ Order saved, but email not sent.");
      } else {
        alert("✅ Order saved and confirmation email sent!");
      }

      setCustomerName("");
      setOrderType("");
      setAmount("");
      setDeadline("");
      setStatus("pending");
      setEmail("");
    } catch (err) {
      alert("Unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-4">
      <div className="card shadow-lg border-0 rounded-4 bg-white">
        <div className="card-body p-5">
          <h3 className="mb-4 text-primary fw-bold">
            📦 Create New Order
          </h3>

          <form onSubmit={handleSubmit}>

            <div className="form-floating mb-3">
              <input
                type="text"
                className="form-control"
                id="customerName"
                placeholder="Customer Name"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                required
              />
              <label htmlFor="customerName">
                <FaUser className="me-2" />
                Customer Name
              </label>
            </div>

            <div className="form-floating mb-3">
              <input
                type="email"
                className="form-control"
                id="customerEmail"
                placeholder="Customer Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <label htmlFor="customerEmail">
                <FaEnvelope className="me-2" />
                Customer Email
              </label>
            </div>

            <div className="form-floating mb-3">
              <input
                type="text"
                className="form-control"
                id="orderType"
                placeholder="Order Type"
                value={orderType}
                onChange={(e) => setOrderType(e.target.value)}
                required
              />
              <label htmlFor="orderType">
                <FaClipboardList className="me-2" />
                Order Type
              </label>
            </div>

            <div className="form-floating mb-3">
              <input
                type="number"
                className="form-control"
                id="amount"
                placeholder="Amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
              <label htmlFor="amount">
                <FaRupeeSign className="me-2" />
                Amount (₹)
              </label>
            </div>

            <div className="form-floating mb-3">
              <input
                type="datetime-local"
                className="form-control"
                id="deadline"
                placeholder="Deadline"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                required
              />
              <label htmlFor="deadline">
                <FaCalendarAlt className="me-2" />
                Deadline
              </label>
            </div>

            <div className="form-floating mb-4">
              <select
                className="form-select"
                id="status"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
              <label htmlFor="status">
                <FaTasks className="me-2" />
                Status
              </label>
            </div>

            <button type="submit" className="btn btn-primary btn-lg w-100" disabled={loading}>
              {loading ? (
                <>
                  <Spinner size="sm" animation="border" className="me-2" />
                  Submitting...
                </>
              ) : (
                "Create Order"
              )}
            </button>

          </form>
        </div>
      </div>
    </div>
  );
};

export default OrderForm;
