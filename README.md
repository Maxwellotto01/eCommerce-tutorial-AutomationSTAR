# eCommerce-tutorial-AutomationSTAR

## What is this API?
A small Express (JavaScript) REST API for e-commerce checkout, from the AutomationSTAR 2026 tutorial. It has four endpoints: `login`, `register`, `cart` and `checkout`. Data is stored in-memory (plain variables), so it resets whenever the server restarts.

## Install
Requires Node.js 18+.

```bash
npm install
```

## Run
```bash
npm start
```
The port defaults to `3000` (override with `PORT=4000 npm start`).

## Test data
**Users**

| Name | Email | Password |
|------|-------|----------|
| Alice Johnson | alice@example.com | alice123 |
| Bob Smith | bob@example.com | bob123 |
| Carol White | carol@example.com | carol123 |

**Products** (use the `id` as `productId` in the cart)

| ID | Name | Price |
|----|------|-------|
| 1 | Wireless Mouse | 25.00 |
| 2 | Mechanical Keyboard | 80.00 |
| 3 | USB-C Hub | 45.50 |

## Endpoints
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/register` | no | Create a user (`name`, `email`, `password`) |
| POST | `/login` | no | Returns a bearer `token` |
| GET | `/cart` | yes | View cart |
| POST | `/cart` | yes | Add `productId` and optional `quantity` |
| POST | `/checkout` | yes | Pay with `paymentMethod`: `cash` or `credit_card` |

Authenticated calls need the header `Authorization: Bearer <token>`.

## Business rules
- Paying with **cash** gives a **10% discount** on the cart total.
- Paying with **credit card** gives **no discount**.
- Checkout requires a non-empty cart; the cart is emptied after a successful checkout.

## Relevant URLs
- API base: http://localhost:3000
- Swagger UI: http://localhost:3000/api-docs
- Raw OpenAPI YAML: http://localhost:3000/api-docs.yaml
