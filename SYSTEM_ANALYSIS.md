# Organic Marketplace — System Analysis

## 1. Executive summary

Organic is a web marketplace intended to connect buyers with sellers/farmers. It supports product discovery, seller verification, orders, messaging, reviews, and promoted ads. The repository contains a React single-page application and a Node.js/Express API backed by MongoDB, with Socket.IO used for live message delivery.

The main feature areas are represented in both client and API code. However, several integration gaps currently affect core workflows: registration does not return the token expected by the client, product detail lookup references an unimported model, and the chat page's socket connection does not join the recipient room. The repository also relies on Windows-insensitive path resolution in imports, which prevents reliable startup on case-sensitive filesystems such as typical Linux hosts.

This document describes the implementation visible in the repository; it is not a deployment verification or a security audit.

## 2. Scope and repository layout

| Area | Location | Responsibility |
|---|---|---|
| API bootstrap | `Api/index.js` | Express setup, MongoDB connection, HTTP server, Socket.IO, and route registration |
| API routes | `Api/Routes/` | HTTP endpoint definitions |
| API controllers | `Api/Controllers/` | Authentication, product, order, messaging, user, review, and admin operations |
| API models | `Api/Models/` | Mongoose schemas and persistence |
| API middleware | `Api/middleware/` | JWT authentication and admin-role checks |
| Web application | `frontend/src/` | React routes, pages, components, and shared contexts |
| Frontend API client | `frontend/src/api.js` | Axios configuration and bearer-token attachment |

The repository has separate package manifests for the API and frontend. There is no root-level orchestration or deployment configuration in the inspected tree. The frontend README remains the default React/Vite template documentation.

## 3. Architecture

### Frontend

- React 19 application, built and served with Vite.
- React Router defines public and authenticated-feature pages. The routes themselves are not wrapped in route-level authentication guards; pages generally check the user state themselves.
- Shared providers are composed in `frontend/src/main.jsx`:
  - `AuthProvider`: user and token state, with values persisted in `localStorage`.
  - `SocketProvider`: opens a Socket.IO connection and stores incoming-message notifications.
  - `CartProvider`: stores the cart in `localStorage`.
  - `ToastProvider`: transient UI notifications.
- Axios calls use `http://localhost:5000/api` directly. The request interceptor reads `token` from `localStorage` and sends it as a bearer token.

### Backend

- Node.js ES modules, Express 5, Mongoose, and Socket.IO.
- Default HTTP port is `5000`; `PORT` can override it.
- MongoDB connection uses `MONGO_URI`, with a timed retry after connection failure.
- JWT creation and verification use `JWT_SECRET`.
- REST API prefixes are `/api/auth`, `/api/products`, `/api/messages`, `/api/orders`, `/api/users`, `/api/reviews`, `/api/admin`, and `/api/ads`.
- Express CORS is enabled without an explicit origin restriction. Socket.IO is configured for `http://localhost:5173`.

### Request flow

1. The browser calls the API through the shared Axios client.
2. The client attaches the stored bearer token when present.
3. Protected routes use `authMiddleware` to verify the JWT and load the user from MongoDB.
4. Controllers read or write Mongoose documents and return JSON.
5. Messaging is persisted through the REST API; Socket.IO separately relays message events to connected sockets in a user-ID room.

## 4. Core data model

| Entity | Important fields and relationships |
|---|---|
| User | Name, unique email, password hash, role (`buyer`, `seller`, `admin`), seller status (`pending`, `verified`), timestamps |
| Product | Name, description, price, category, image URLs, seller reference, timestamps |
| Order | Buyer, seller, product references, status (`pending`, `confirmed`, `shipped`, `completed`), status history, timestamps |
| Message | Sender and receiver references, content, timestamps |
| Review | Reviewer and seller references, rating from 1–5, comment, timestamps |
| Ad | Seller and product references, title, image, date range, lifecycle status, simulated payment fields, impression/click counters |

Relationships are represented by MongoDB ObjectId references. Order records do not currently store quantity or a price snapshot. The cart and its quantities live in browser storage rather than in the API.

## 5. Functional areas and available endpoints

| Area | Routes (relative to `/api`) | Summary |
|---|---|---|
| Authentication | `POST /auth/register`, `POST /auth/login`, `GET /auth/me` | Registration, login, and authenticated current-user lookup |
| Products | `GET /products`, `GET /products/:id`, `POST /products`, `DELETE /products/:id` | Search/filter, detail, seller creation, and authorized deletion |
| Orders | `POST /orders`, `GET /orders`, `PATCH /orders/:id/status` | Create orders; list by the current role; seller status updates |
| Messages | `POST /messages`, `GET /messages`, `GET /messages/:userId` | Send a message, list conversation partners, and load a conversation |
| Users | `GET /users`, `GET /users/:id/profile` | Authenticated user list and seller profile with products/review stats |
| Reviews | `POST /reviews`, `GET /reviews/:sellerId` | Create a review and list a seller's reviews |
| Admin | `GET /admin/sellers`, `PATCH /admin/verify-seller/:id`, `GET /admin/seller-stats`, `GET /admin/top-buyers` | Seller verification and basic monthly summaries |
| Ads | `GET /ads/active`, `GET /ads/my-ads`, `POST /ads/create`, `PUT /ads/:id/pay`, `DELETE /ads/:id`, `GET /ads/admin/pending`, `PATCH /ads/admin/:id/approve`, `PATCH /ads/admin/:id/reject` | List, create, simulate payment for, and moderate promoted ads |

Product listing supports category, min/max price, and name search query parameters. Ad payment is simulated in application code; no payment provider integration is present.

## 6. Main workflows

### Account registration and login

- The registration UI allows a buyer or seller account; seller accounts begin with a pending status.
- Login returns a JWT from the API and the client stores the token and user in browser storage.
- Seller product creation checks both the seller role and verified status.

### Product browsing and selling

- Buyers can browse products and filter by category, price, and name.
- Sellers create products through an authenticated endpoint.
- Product deletion is restricted to the product's seller or an admin.
- Product detail and seller profile pages load related data through dedicated endpoints.

### Cart and orders

- Cart contents and quantities are maintained in browser storage.
- Checkout sends one order request per cart line and then clears the cart.
- Orders are visible according to role: buyers see their own purchases, sellers see received orders, and admins see all orders.
- Sellers can update order status; the status is appended to the order's history.

### Messaging

- Message history and conversation partners are retrieved through authenticated REST endpoints.
- Sending a message persists it, then the client emits a Socket.IO event for immediate delivery.
- Socket.IO rooms are keyed by user ID.

### Seller approval and advertising

- Admins can verify sellers. A verified seller can then list products.
- Sellers create draft ads, mark them paid through a simulated payment action, and submit them for admin review.
- Approved ads become active for their configured date range and are available through the public active-ads endpoint.

## 7. Findings and recommended priorities

### High priority — correct before deployment or relying on core workflows

1. **Import path casing is inconsistent.** The on-disk directories are `Routes`, `Controllers`, and `Models`, while many imports use lowercase `routes`, `controllers`, or `models`. Windows commonly resolves these paths despite the mismatch; case-sensitive systems generally do not. Normalize directory names or imports consistently before deploying to Linux.
2. **Registration response does not match the client contract.** The API registration handler returns `{ message, user }`, while `AuthContext.register` expects `{ token, user }` and stores the token. Registration can therefore leave the UI in an apparent signed-in state without a usable JWT. Align the response and intended post-registration flow.
3. **Product detail handler uses `Product` without importing it.** `GET /products/:id` references `Product.findById`, but `Api/Routes/productRoutes.js` does not import the model. The handler will fail when the detail endpoint is called.
4. **Chat page listens on a socket that is not joined to the user's room.** `SocketProvider` joins a user-ID room, but `Chat.jsx` creates another connection and listens there without emitting `join`. Incoming events go to the provider connection, not the page's connection, so the active conversation may not update in real time.
5. **Registration response includes the user document.** The registration controller returns the full created user, including its stored password hash. Login likewise returns the full user document. Return a sanitized user representation that excludes the password field.

### Medium priority — resolve for predictable behavior

1. **Order quantity is accepted by the checkout UI but not persisted.** The client sends `quantity`, while the order schema and create-order controller do not store or use it. Each cart line creates one order regardless of its quantity.
2. **Ad moderation endpoints are duplicated.** The ad moderation handlers are present under both the ads router and admin router. In the admin router they also include an additional `/admin` segment, yielding paths such as `/api/admin/admin/pending`. The frontend calls the ads-router paths; remove or reconcile the duplicate API surface.
3. **Client endpoints and server origins are hard-coded to localhost.** This prevents straightforward use across staging/production origins. Use environment-based configuration for the API and Socket.IO URLs.
4. **No automated test suite is configured for the API.** Its `test` script intentionally exits with an error; the frontend has build and lint scripts but no test script. Core workflows currently lack automated regression coverage.
5. **Order status changes have no explicit transition rules.** The schema constrains status values, but the controller does not enforce an allowed progression (for example, preventing a completed order from returning to pending).
6. **Seller/product filtering is not consistently implemented.** The seller ads page requests products with a `sellerId` parameter, while the product-list controller only filters by category, price range, and name.

## 8. Configuration and local startup

The inspected code expects:

- API: `MONGO_URI`, `JWT_SECRET`, and optionally `PORT` (defaults to `5000`).
- Frontend: API origin is currently hard-coded to `http://localhost:5000/api`; the Socket.IO server is hard-coded to `http://localhost:5000`.
- Socket.IO server CORS currently allows the Vite development origin `http://localhost:5173`.

The API manifest provides `npm start` and `npm run dev`. The frontend manifest provides Vite development, production build, lint, and preview scripts. Dependency installation and runtime startup were not performed as part of this static analysis.

## 9. Suggested implementation sequence

1. Normalize API import casing and confirm API startup on a case-sensitive filesystem.
2. Define and align the registration/login response contract; ensure responses do not expose password hashes.
3. Fix the product detail model import and add focused API coverage for the endpoint.
4. Consolidate Socket.IO connection ownership and verify room join, persisted message, and live delivery behavior.
5. Decide how quantity and item price are represented in orders, then align checkout, schema, and order summaries.
6. Consolidate ad moderation routes and move service URLs into environment-based configuration.
7. Add targeted tests for authentication, product detail, order creation/status, messaging, and ad moderation.
