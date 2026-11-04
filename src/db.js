// In-memory database: all data lives in these variables and resets on restart.
const products = [
  { id: 1, name: 'Wireless Mouse', price: 25.0 },
  { id: 2, name: 'Mechanical Keyboard', price: 80.0 },
  { id: 3, name: 'USB-C Hub', price: 45.5 },
];

const users = [
  { id: 1, name: 'Alice Johnson', email: 'alice@example.com', password: 'alice123' },
  { id: 2, name: 'Bob Smith', email: 'bob@example.com', password: 'bob123' },
  { id: 3, name: 'Carol White', email: 'carol@example.com', password: 'carol123' },
];

const carts = {}; // userId -> [{ productId, quantity }]
const orders = []; // completed checkouts
const sessions = {}; // token -> userId

module.exports = { products, users, carts, orders, sessions };
