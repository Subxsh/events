# Sowmiya Events - MERN Stack Event Management Platform

A comprehensive event management web application built with the MERN stack, featuring user authentication, event RSVP system, and Stripe payment integration.

## 🚀 Features

### User Features
- **User Registration & Authentication** - JWT-based secure authentication
- **Event Discovery** - Browse and search events by category, date, and location
- **RSVP System** - Register for free and paid events
- **Payment Integration** - Secure payments via Stripe for paid events
- **Personal Dashboard** - Manage RSVPs and view event history
- **Responsive Design** - Mobile-friendly interface with Tailwind CSS

### Admin Features
- **Event Management** - Create, update, and delete events
- **RSVP Monitoring** - View all RSVPs for each event
- **User Management** - Admin dashboard with comprehensive analytics
- **Payment Tracking** - Monitor payment status for paid events

## 🛠️ Tech Stack

### Frontend
- **React 18** - Modern React with hooks
- **React Router** - Client-side routing
- **Tailwind CSS** - Utility-first CSS framework
- **Axios** - HTTP client for API calls
- **Stripe.js** - Payment processing
- **React Hot Toast** - Toast notifications
- **Lucide React** - Beautiful icons

### Backend
- **Node.js & Express** - Server framework
- **MongoDB & Mongoose** - Database and ODM
- **JWT** - Authentication tokens
- **bcryptjs** - Password hashing
- **Stripe** - Payment processing
- **Express Validator** - Input validation
- **CORS** - Cross-origin resource sharing

## 📁 Project Structure

```
sowmiya-events/
├── client/                 # React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── contexts/       # React contexts
│   │   ├── pages/          # Page components
│   │   └── ...
│   └── package.json
├── server/                 # Express backend
│   ├── models/            # MongoDB models
│   ├── routes/            # API routes
│   ├── middleware/        # Custom middleware
│   ├── seed/              # Database seeding
│   └── package.json
├── .env.example           # Environment variables template
└── package.json           # Root package.json
```

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- MongoDB Atlas account or local MongoDB
- Stripe account for payments

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd sowmiya-events
   ```

2. **Install dependencies**
   ```bash
   npm run install-all
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env
   ```
   
   Update `.env` with your credentials:
   ```env
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/sowmiya-events
   JWT_SECRET=your-super-secret-jwt-key-here
   STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
   FRONTEND_URL=http://localhost:3000
   PORT=5000
   ```

4. **Seed the database** (Optional)
   ```bash
   cd server && npm run seed
   ```

5. **Start the application**
   ```bash
   npm run dev
   ```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## 🔐 Demo Credentials

After seeding the database, you can use these credentials:

**Admin Account:**
- Email: admin@sowmiyaevents.com
- Password: admin123

## 📊 Database Models

### User Model
- Name, email, password (hashed)
- Role (user/admin)
- Profile image
- Timestamps

### Event Model
- Title, description, date, time, location
- Category, max attendees, current attendees
- Price, payment status
- Organizer reference
- Status (upcoming/ongoing/completed/cancelled)

### RSVP Model
- User and event references
- Status (confirmed/pending/cancelled)
- Payment status and details
- Notes and timestamps

## 🎨 UI/UX Features

- **Modern Design** - Clean, professional interface
- **Responsive Layout** - Works on all device sizes
- **Interactive Elements** - Hover effects and smooth transitions
- **Loading States** - Proper loading indicators
- **Error Handling** - User-friendly error messages
- **Toast Notifications** - Real-time feedback

## 🔒 Security Features

- **JWT Authentication** - Secure token-based auth
- **Password Hashing** - bcrypt for password security
- **Input Validation** - Server-side validation
- **CORS Protection** - Configured for security
- **Admin Routes** - Protected admin-only endpoints

## 💳 Payment Integration

- **Stripe Integration** - Secure payment processing
- **Payment Intents** - Modern Stripe API
- **Webhook Support** - Real-time payment updates
- **Payment Status Tracking** - Complete payment lifecycle

## 🚀 Deployment

### Backend (Render)
1. Create a new Web Service on Render
2. Connect your GitHub repository
3. Set build command: `cd server && npm install`
4. Set start command: `cd server && npm start`
5. Add environment variables

### Frontend (Vercel)
1. Connect your GitHub repository to Vercel
2. Set root directory to `client`
3. Build command: `npm run build`
4. Output directory: `build`

## 📝 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Events
- `GET /api/events` - Get all events
- `GET /api/events/:id` - Get single event
- `POST /api/events` - Create event (admin)
- `PUT /api/events/:id` - Update event (admin)
- `DELETE /api/events/:id` - Delete event (admin)

### RSVPs
- `GET /api/rsvp/my-rsvps` - Get user's RSVPs
- `GET /api/rsvp/event/:eventId` - Get event RSVPs (admin)
- `POST /api/rsvp` - Create RSVP
- `DELETE /api/rsvp/:id` - Cancel RSVP

### Payments
- `POST /api/payment/create-payment-intent` - Create payment
- `POST /api/payment/confirm-payment` - Confirm payment
- `POST /api/payment/webhook` - Stripe webhook

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 👩‍💻 Author

**Sowmiya** - Event Management Platform Developer

---

For support or questions, please contact: hello@sowmiyaevents.com