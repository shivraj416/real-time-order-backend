const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_API_KEY);

exports.getOrders = async (req, res) => {
  const { data, error } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
};

exports.createOrder = async (req, res) => {
  const { customer_name, order_type, total_amount, deadline } = req.body;
  const { data, error } = await supabase.from('orders').insert([{ customer_name, order_type, total_amount, deadline }]);
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
};

exports.updateOrder = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const { data, error } = await supabase.from('orders').update({ status, updated_at: new Date() }).eq('id', id);
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
};

exports.deleteOrder = async (req, res) => {
  const { id } = req.params;
  const { error } = await supabase.from('orders').delete().eq('id', id);
  if (error) return res.status(500).json({ error: error.message });
  res.status(204).end();
};
