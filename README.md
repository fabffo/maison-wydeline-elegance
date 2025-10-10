# Maison Wydeline - E-commerce Platform

## 🏢 Project Overview

Maison Wydeline is a luxury e-commerce platform specializing in high-end shoes for extended sizes (41-46). The platform features a complete shopping experience with payment processing, inventory management, and a secure back-office for administrators.

**Live URL**: https://lovable.dev/projects/d9a27a38-8b80-4b23-ae37-7ad0c6e84d3f

## 🚀 Features

### Customer Features
- 🛍️ Product catalog with filtering by category and size
- 🛒 Shopping cart with real-time updates
- 💳 Secure payment processing via Stripe
- 📧 Order confirmation emails
- 📄 Invoice generation (PDF)
- 🌐 Multi-language support (FR/EN)
- 📱 Fully responsive design
- ♿ WCAG 2.1 AA accessibility compliant

### Admin Features (RBAC)
- 👥 Role-based access control (ADMIN, BACKOFFICE)
- 📊 Dashboard with real-time analytics
- 📦 Product and inventory management
  - Stock tracking by size (41-46)
  - Low stock alerts
  - Stock movement history
  - CSV import/export
- 🛍️ Order management
  - Order status tracking (PENDING → A_PREPARER → EXPEDIE → LIVRE → RETOUR)
  - Automatic stock reservation after payment
- 📄 Invoice management
  - Automatic invoice generation
  - PDF download
  - Email delivery (via Resend)
- 🚚 Shipment tracking
  - Carrier and tracking number management
  - Bulk actions
- 🔔 Real-time notifications
  - Push notifications for new orders and invoices
  - Notification center with read/unread status
- 📈 Reports and analytics
  - Sales by product and size
  - Stock valuation
  - Low stock predictions
  - Interactive charts (Recharts)
  - CSV exports

## 🛠️ Technology Stack

### Frontend
- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS + shadcn/ui
- **Charts**: Recharts
- **Routing**: React Router v6
- **State Management**: React Context API
- **PDF Generation**: @react-pdf/renderer

### Backend (Lovable Cloud / Supabase)
- **Database**: PostgreSQL
- **Authentication**: Supabase Auth
- **Real-time**: Supabase Realtime
- **Edge Functions**: Deno
- **Storage**: Supabase Storage (ready for use)

### Payment & Services
- **Payment**: Stripe
- **Email**: Resend

## 📋 Prerequisites

- Node.js >= 18.x
- npm or yarn
- Stripe account (for payments)
- Resend account (for emails)

## ⚙️ Environment Variables

The following environment variables are automatically configured via Lovable Cloud:

```bash
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
VITE_SUPABASE_PROJECT_ID=your_project_id
```

### Additional Secrets (via Lovable Cloud Backend)

Configure these secrets in the Lovable Cloud backend:

- `STRIPE_SECRET_KEY`: Your Stripe secret key
- `STRIPE_WEBHOOK_SECRET`: Stripe webhook signing secret (for webhook endpoint)
- `RESEND_API_KEY`: Resend API key for sending emails

## 🚀 Installation & Development

### 1. Clone the repository

```sh
git clone <YOUR_GIT_URL>
cd <YOUR_PROJECT_NAME>
```

### 2. Install dependencies

```sh
npm install
```

### 3. Start development server

```sh
npm run dev
```

The app will be available at `http://localhost:5173`

## 🗄️ Database Setup

### Automatic Migrations

All database migrations are automatically applied when you deploy your app. The database schema includes:

- **products**: Product catalog
- **product_variants**: Stock by size (41-46)
- **orders**: Customer orders
- **order_items**: Order line items
- **invoices**: Generated invoices
- **shipments**: Delivery tracking
- **stock_movements**: Inventory history
- **user_roles**: RBAC roles (ADMIN, BACKOFFICE, USER)
- **notifications**: Real-time notifications

### Seed Data

Products are loaded from `public/products.json`. To sync products to the database, the app automatically handles this on first load.

### Creating the First Admin User

After a user signs up, run this SQL in the Lovable Cloud backend:

```sql
INSERT INTO user_roles (user_id, role) 
VALUES ('your-user-uuid', 'ADMIN');
```

Access the back-office at: `/admin`

## 💳 Stripe Configuration

### 1. Create Stripe Products & Prices

Products and prices are managed directly in Stripe. Make sure to:
- Create products in Stripe dashboard
- Set prices in EUR
- Add product metadata: `product_id` matching your database

### 2. Configure Webhook

In your Stripe dashboard, add a webhook endpoint:

**URL**: `https://your-app.lovable.app/functions/v1/stripe-webhook`

**Events to listen for**:
- `payment_intent.succeeded`

After creating the webhook, copy the signing secret and add it to Lovable Cloud secrets as `STRIPE_WEBHOOK_SECRET`.

### 3. Test Cards

Use Stripe test cards for development:
- **Success**: 4242 4242 4242 4242
- **Declined**: 4000 0000 0000 0002

## 📧 Email Configuration (Resend)

### 1. Sign up for Resend

Create an account at [resend.com](https://resend.com)

### 2. Verify Domain

Verify your sending domain at [resend.com/domains](https://resend.com/domains)

### 3. Create API Key

Generate an API key at [resend.com/api-keys](https://resend.com/api-keys) and add it to Lovable Cloud secrets as `RESEND_API_KEY`.

### 4. Update Sender Email

In `supabase/functions/stripe-webhook/index.ts`, update the sender email:

```typescript
from: 'Maison Wydeline <orders@yourdomain.com>'
```

## 🧪 Testing

### Unit Tests (Coming Soon)

```sh
npm run test
```

### E2E Tests (Coming Soon)

```sh
npm run test:e2e
```

### Lighthouse Audit

The app is optimized for:
- **Performance**: ≥90
- **Accessibility**: ≥90
- **Best Practices**: ≥90
- **SEO**: ≥90

Run Lighthouse in Chrome DevTools to verify.

## 📦 Deployment

### Deploy via Lovable

1. Open your [Lovable Project](https://lovable.dev/projects/d9a27a38-8b80-4b23-ae37-7ad0c6e84d3f)
2. Click **Publish** in the top right
3. Your app will be deployed automatically

### Connect Custom Domain

Navigate to **Project > Settings > Domains** and follow the instructions to connect your custom domain.

[Read more](https://docs.lovable.dev/features/custom-domain#custom-domain)

## 🔒 Security

- **RBAC**: Role-based access control with database-level policies
- **RLS**: Row-level security on all tables
- **Auth**: Secure authentication via Supabase Auth
- **Input Validation**: All user inputs are validated and sanitized
- **HTTPS**: All traffic is encrypted
- **Secrets**: Environment variables and secrets are securely stored

## 🎨 Design System

The design system is defined in:
- `src/index.css`: CSS variables and color tokens
- `tailwind.config.ts`: Tailwind configuration

All colors use HSL format for consistency and theming support.

## 📱 Accessibility

- Semantic HTML5 elements
- ARIA labels on all interactive elements
- Keyboard navigation support
- Screen reader compatible
- Color contrast ratio ≥ 4.5:1
- Focus indicators on all interactive elements

## 📄 License

This project is proprietary. All rights reserved.

## 🤝 Support

For support, contact: support@maisonwydeline.com

## 🏗️ Architecture

### Frontend Structure

```
src/
├── components/        # React components
│   ├── ui/           # shadcn/ui components
│   └── admin/        # Admin-specific components
├── pages/            # Route pages
│   └── admin/        # Admin pages
├── contexts/         # React contexts
├── hooks/            # Custom React hooks
├── lib/              # Utility functions
└── integrations/     # External service integrations
```

### Backend Structure

```
supabase/
├── functions/        # Edge Functions
│   ├── create-checkout/      # Stripe checkout creation
│   └── stripe-webhook/       # Stripe webhook handler
└── migrations/       # Database migrations
```

## 🔄 Real-time Features

The app uses Supabase Realtime for:
- Live notifications in admin panel
- Real-time order updates
- Live inventory changes

Channels are automatically cleaned up on component unmount.

## 📊 Reports & Analytics

The Reports page (`/admin/reports`) provides:
- Sales by product (bar chart)
- Sales by size (pie chart)
- Stock valuation (list view)
- Low stock alerts (list view)
- CSV export for all reports

## 🎯 Performance Optimizations

- Lazy loading of images
- Code splitting by route
- Optimized bundle size
- Responsive images
- Efficient re-renders (React.memo, useCallback)
- Database query optimization (indexes, RLS)

## 🚧 Roadmap

- [ ] Customer reviews and ratings
- [ ] Wishlist functionality
- [ ] Advanced search and filtering
- [ ] Personalized recommendations
- [ ] Loyalty program
- [ ] Multi-currency support
- [ ] Advanced analytics dashboard
- [ ] Automated email campaigns

---

Built with ❤️ by [Lovable](https://lovable.dev)
