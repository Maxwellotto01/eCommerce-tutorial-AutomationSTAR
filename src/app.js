const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const express = require('express');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yaml');
const db = require('./db');

const CASH_DISCOUNT = 0.1;
const PAYMENT_METHODS = ['cash', 'credit_card'];

const round2 = (n) => Math.round((n + Number.EPSILON) * 100) / 100;
const publicUser = ({ id, name, email }) => ({ id, name, email });

const app = express();
app.use(express.json());

function auth(req, res, next) {
  const match = /^Bearer (.+)$/.exec(req.headers.authorization || '');
  const userId = match && db.sessions[match[1]];
  if (!userId) return res.status(401).json({ error: 'Missing or invalid token' });
  req.userId = userId;
  next();
}

function cartDetails(userId) {
  const items = (db.carts[userId] || []).map(({ productId, quantity }) => {
    const p = db.products.find((x) => x.id === productId);
    return { productId, name: p.name, unitPrice: p.price, quantity, subtotal: round2(p.price * quantity) };
  });
  return { items, total: round2(items.reduce((s, i) => s + i.subtotal, 0)) };
}

app.post('/register', (req, res) => {
  const { name, email, password } = req.body || {};
  if (![name, email, password].every((v) => typeof v === 'string' && v.trim())) {
    return res.status(400).json({ error: 'name, email and password are required' });
  }
  if (db.users.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
    return res.status(409).json({ error: 'Email already registered' });
  }
  const user = { id: db.users.length + 1, name, email, password };
  db.users.push(user);
  res.status(201).json(publicUser(user));
});

app.post('/login', (req, res) => {
  const { email, password } = req.body || {};
  const user = db.users.find((u) => typeof email === 'string' && u.email.toLowerCase() === email.toLowerCase());
  if (!user || user.password !== password) return res.status(401).json({ error: 'Invalid email or password' });
  const token = crypto.randomUUID();
  db.sessions[token] = user.id;
  res.json({ token, user: publicUser(user) });
});

app.get('/cart', auth, (req, res) => res.json(cartDetails(req.userId)));

app.post('/cart', auth, (req, res) => {
  const { productId, quantity = 1 } = req.body || {};
  if (!db.products.some((p) => p.id === productId)) return res.status(404).json({ error: 'Product not found' });
  if (!Number.isInteger(quantity) || quantity < 1) {
    return res.status(400).json({ error: 'quantity must be a positive integer' });
  }
  const cart = (db.carts[req.userId] = db.carts[req.userId] || []);
  const line = cart.find((l) => l.productId === productId);
  if (line) line.quantity += quantity;
  else cart.push({ productId, quantity });
  res.status(201).json(cartDetails(req.userId));
});

app.post('/checkout', auth, (req, res) => {
  const { paymentMethod } = req.body || {};
  if (!PAYMENT_METHODS.includes(paymentMethod)) {
    return res.status(400).json({ error: `paymentMethod must be one of: ${PAYMENT_METHODS.join(', ')}` });
  }
  const { items, total } = cartDetails(req.userId);
  if (!items.length) return res.status(400).json({ error: 'Cart is empty' });

  const discount = paymentMethod === 'cash' ? round2(total * CASH_DISCOUNT) : 0;
  const order = {
    id: db.orders.length + 1,
    userId: req.userId,
    items,
    paymentMethod,
    subtotal: total,
    discount,
    total: round2(total - discount),
  };
  db.orders.push(order);
  db.carts[req.userId] = [];
  res.status(201).json(order);
});

const specPath = path.join(__dirname, '..', 'openapi.yaml');
app.get('/api-docs.yaml', (req, res) => {
  res.type('application/yaml').send(fs.readFileSync(specPath, 'utf8'));
});
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(YAML.parse(fs.readFileSync(specPath, 'utf8'))));

module.exports = app;
