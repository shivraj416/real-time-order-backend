const express = require('express');
const router = express.Router();
const { supabase } = require('../supabaseClient');

router.post('/', async (req, res) => {
  const {
    customer_name,
    order_type,
    total_amount,
    deadline,
    status,
    email,
  } = req.body;

  try {
    const { data, error } = await supabase.from('orders').insert([
      {
        customer_name,
        order_type,
        total_amount,
        deadline,
        status,
        email,
      },
    ]);

    if (error) {
      console.error('Supabase insert error:', error.message);
      return res.status(500).json({ error: error.message });
    }

    res.status(201).json({ message: 'Order inserted successfully', data });
  } catch (err) {
    console.error('Server error:', err);
    res.status(500).json({ error: 'Failed to insert order' });
  }
});

module.exports = router;
