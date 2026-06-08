const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

const CLOVER_TOKEN = '4bcf9de6-4b74-4881-5d79-2763467e1570';
const MERCHANT_ID = '5428143403801172';
const BASE_URL = `https://api.clover.com/v3/merchants/${MERCHANT_ID}`;

const headers = {
  'Authorization': `Bearer ${CLOVER_TOKEN}`,
  'Content-Type': 'application/json'
};

// Get menu items
app.get('/menu', async (req, res) => {
  try {
    const response = await fetch(`${BASE_URL}/items?expand=categories`, { headers });
    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get categories
app.get('/categories', async (req, res) => {
  try {
    const response = await fetch(`${BASE_URL}/categories`, { headers });
    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create order
app.post('/order', async (req, res) => {
  try {
    const { items, customerName, carDescription, parkingSpot, phone } = req.body;
    const orderRes = await fetch(`${BASE_URL}/orders`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ 
        note: `CURBSIDE - Name: ${customerName} | Car: ${carDescription} | Spot: ${parkingSpot} | Phone: ${phone || 'N/A'}`,
        orderType: { id: 'ECOMM' }
      })
    });
    const order = await orderRes.json();
    for (const item of items) {
      await fetch(`${BASE_URL}/orders/${order.id}/line_items`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ item: { id: item.id }, unitQty: item.qty })
      });
    }
    res.json({ success: true, orderId: order.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/', (req, res) => res.json({ status: 'Chachas Bakery API running!' }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
