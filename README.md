# Petal & Pearl Boutique

A full-stack e-commerce platform for clothing and ornaments, built with React, NestJS, and PostgreSQL.

## 🚀 Features

### Customer Features
- 🛍️ **Product Browsing** - Browse clothing and ornaments with beautiful UI
- 🛒 **Shopping Cart** - Add items, update quantities, and manage cart
- 💳 **Checkout** - Complete checkout with multiple payment options
- 📦 **Order Tracking** - View order history and track order status
- 💬 **Live Chatbot** - Rule-based customer support chatbot
- 🔐 **User Authentication** - Secure signup/login system

### Admin Features
- 📊 **Dashboard** - Real-time analytics (revenue, orders, users, products)
- 📦 **Product Management** - Add, edit, delete products
- 👥 **User Management** - Manage users and roles
- 🔒 **Protected Routes** - Role-based access control

### Technical Features
- ✅ **Production Ready** - Environment variables, CORS, security headers
- ✅ **Input Validation** - DTO validation with class-validator
- ✅ **Responsive Design** - Mobile-first design with Tailwind CSS
- ✅ **Smooth Animations** - Framer Motion animations
- ✅ **Type Safety** - Full TypeScript support

## 🛠️ Tech Stack

### Frontend
- **React** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Framer Motion** - Animations
- **React Router** - Routing
- **Axios** - HTTP client
- **Recharts** - Data visualization
- **Shadcn UI** - UI components

### Backend
- **NestJS** - Node.js framework
- **TypeScript** - Type safety
- **TypeORM** - ORM
- **PostgreSQL** - Database
- **JWT** - Authentication
- **Helmet** - Security headers
- **Class Validator** - Input validation

## 📋 Prerequisites

- Node.js (v18 or higher)
- PostgreSQL (v14 or higher)
- npm or yarn

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/SAIFUL-SIFAT/Petal_-_Pearl.git
cd Petal_-_Pearl
```

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create .env file with your configuration
# See .env.example for required variables

# Start the development server
npm run start:dev
```

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Create .env file
# Add VITE_API_URL pointing to your backend

# Start the development server
npm run dev
```

### 4. Access the Application

- **Frontend**: http://localhost:8080
- **Backend API**: http://localhost:3000
- **Admin Panel**: http://localhost:8080/admin/dashboard

## 📁 Project Structure

```
petal-pearl-boutique/
├── backend/
│   ├── src/
│   │   ├── orders/          # Order management
│   │   ├── products/        # Product management
│   │   ├── users/           # User management
│   │   ├── app.controller.ts
│   │   ├── app.module.ts
│   │   └── main.ts
│   ├── public/              # Static assets
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── components/      # Reusable components
    │   ├── pages/           # Page components
    │   ├── hooks/           # Custom hooks
    │   ├── context/         # React context
    │   ├── api/             # API services
    │   └── App.tsx
    └── package.json
```

## 🌟 Key Features Explained

### Chatbot
The chatbot provides instant answers to common questions:
- Return policy
- Delivery information
- Size guide
- Payment methods
- Contact information
- Opening hours

### Order Management
- Users can place orders with multiple items
- Track order status (pending, processing, shipped, delivered)
- View order history with detailed information
- Admin can manage all orders

### Security
- Environment variables for sensitive data
- CORS configuration
- Helmet for security headers
- Input validation with DTOs
- JWT authentication
- Role-based access control

## 📝 Available Scripts

### Backend
```bash
npm run start:dev   # Start development server
npm run build       # Build for production
npm run start:prod  # Start production server
```

### Frontend
```bash
npm run dev         # Start development server
npm run build       # Build for production
npm run preview     # Preview production build
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.

## 👨‍💻 Author

**Saiful Sifat**
- GitHub: [@SAIFUL-SIFAT](https://github.com/SAIFUL-SIFAT)

## 🙏 Acknowledgments

- Design inspiration from modern e-commerce platforms
- UI components from Shadcn UI
- Icons from Lucide React
