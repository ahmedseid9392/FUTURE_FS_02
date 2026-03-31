# 📊 Client Lead Management System (Mini CRM)

## 🎯 **Project Overview**

A professional, full-stack CRM application designed for agencies, freelancers, and small businesses to efficiently manage client leads from website contact forms. This system provides a centralized dashboard for tracking leads, managing follow-ups, scheduling meetings, sending messages, and analyzing conversion metrics.

---

## ✨ **Live Demo**

[Live Demo](https://your-demo-link.com) | [API Documentation](https://your-api-docs.com)

---

## 📋 **Table of Contents**

- [Features](#-features)
- [Technology Stack](#-technology-stack)
- [Project Structure](#-project-structure)
- [Installation](#-installation)
- [Environment Variables](#-environment-variables)
- [API Endpoints](#-api-endpoints)
- [Screenshots](#-screenshots)
- [User Guide](#-user-guide)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🚀 **Features**

### 🔐 **Authentication & Security**
- JWT-based authentication with secure token storage
- Google OAuth 2.0 integration for social login
- Password reset with email verification (1-hour token expiration)
- Protected routes and role-based access control
- Session management with "Remember Me" functionality
- Password hashing with bcrypt

### 📊 **Lead Management**
- Complete CRUD operations for leads
- Status tracking (New → Contacted → Converted)
- Source tracking (Website, Referral, Social Media, LinkedIn, etc.)
- Search and filter by name, email, status, or source
- CSV/JSON export functionality
- Bulk status updates
- Follow-up notes with timestamps
- Lead assignment to specific users

### 💬 **Messaging System**
- Real-time internal messaging
- Email integration with Nodemailer (Gmail SMTP)
- Professional email templates
- Two-way communication tracking
- Message threads with conversation history
- Star important messages
- Delete messages
- Email reply tracking via IMAP

### 📅 **Calendar & Scheduling**
- Multiple views (Month, Week, Day)
- Event management (Meetings, Calls, Video, Follow-ups)
- Reminder notifications
- Recurring events (Daily, Weekly, Monthly)
- Color-coded events
- Lead association with events
- Event location/meeting link

### 📈 **Analytics & Reports**
- Interactive dashboard with key metrics
- Lead trend charts (bar/line toggle)
- Source distribution analytics
- Status distribution visualization
- Conversion funnel analysis
- Performance metrics (response time, conversion rates)
- Export reports (CSV, JSON)
- Weekly/monthly/yearly filtering
- Custom date range selection

### 👤 **User Profile Management**
- Profile picture upload/removal
- Password change with validation
- Personal information management
- Account deletion with confirmation
- Dark mode preference persistence

### 🔔 **Notifications**
- Real-time notification bell with unread count
- Email notifications for messages and replies
- Calendar event reminders
- Lead status change alerts
- New message notifications
- Mark as read/unread
- Delete notifications
- Filter by type and read status

### 🌓 **Dark Mode**
- Full dark mode support across all pages
- Persistent theme preference in localStorage
- Smooth transitions
- System preference detection

### 📱 **Responsive Design**
- Mobile-first approach
- Works seamlessly on desktop, tablet, and mobile
- Collapsible sidebar
- Touch-friendly interactions

---

## 🛠️ **Technology Stack**

### **Frontend**
| Technology | Version | Purpose |
|------------|---------|---------|
| React | 18.2.0 | UI Framework |
| Vite | 4.4.5 | Build Tool |
| Tailwind CSS | 3.3.5 | Styling |
| React Router DOM | 6.20.0 | Routing |
| Axios | 1.6.0 | HTTP Client |
| Lucide React | 0.263.1 | Icons |
| React Hot Toast | 2.4.0 | Notifications |

### **Backend**
| Technology | Version | Purpose |
|------------|---------|---------|
| Node.js | 18+ | Runtime |
| Express.js | 4.18.2 | Web Framework |
| MongoDB | 7.0.0 | Database |
| Mongoose | 7.0.0 | ODM |
| JWT | 9.0.0 | Authentication |
| Bcryptjs | 2.4.3 | Password Hashing |
| Nodemailer | 6.9.0 | Email Service |
| Multer | 1.4.5 | File Upload |
| Google Auth Library | 8.9.0 | Google OAuth |
| IMAP | 0.8.19 | Email Receiving |

---

## 📁 **Project Structure**

```
client-lead-management-system/
├── backend/
│   ├── config/
│   │   └── database.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── calendarController.js
│   │   ├── exportController.js
│   │   ├── googleAuthController.js
│   │   ├── leadController.js
│   │   ├── messageController.js
│   │   ├── notificationController.js
│   │   ├── profileController.js
│   │   └── reportController.js
│   ├── middleware/
│   │   └── auth.js
│   ├── models/
│   │   ├── Conversation.js
│   │   ├── Event.js
│   │   ├── Lead.js
│   │   ├── Message.js
│   │   ├── Notification.js
│   │   ├── PasswordReset.js
│   │   └── User.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── calendarRoutes.js
│   │   ├── exportRoutes.js
│   │   ├── leadRoutes.js
│   │   ├── messageRoutes.js
│   │   ├── notificationRoutes.js
│   │   ├── profileRoutes.js
│   │   └── reportRoutes.js
│   ├── services/
│   │   ├── emailReceiver.js
│   │   └── emailService.js
│   ├── uploads/
│   ├── .env
│   ├── server.js
│   ├── seed.js
│   └── package.json
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   │   ├── Footer.jsx
│   │   │   ├── GoogleButton.jsx
│   │   │   ├── Header.jsx
│   │   │   ├── Layout.jsx
│   │   │   ├── LeadForm.jsx
│   │   │   ├── Notification.jsx
│   │   │   └── Sidebar.jsx
│   │   ├── context/
│   │   │   ├── AuthContext.jsx
│   │   │   └── DarkModeContext.jsx
│   │   ├── pages/
│   │   │   ├── Analytics.jsx
│   │   │   ├── Calendar.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── ForgotPassword.jsx
│   │   │   ├── HelpSupport.jsx
│   │   │   ├── Landing.jsx
│   │   │   ├── LeadDetails.jsx
│   │   │   ├── Leads.jsx
│   │   │   ├── Messages.jsx
│   │   │   ├── Notifications.jsx
│   │   │   ├── Profile.jsx
│   │   │   ├── Reports.jsx
│   │   │   ├── ResetPassword.jsx
│   │   │   └── Settings.jsx
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── .env
│   ├── index.html
│   ├── tailwind.config.js
│   ├── vite.config.js
│   └── package.json
│
├── .gitignore
└── README.md
```

---

## 💻 **Installation**

### **Prerequisites**
- Node.js (v18 or higher)
- MongoDB (v6 or higher)
- npm or yarn package manager
- Gmail account (for email notifications)
- Google Cloud account (for OAuth)

### **Step 1: Clone the Repository**
```bash
git clone https://github.com/yourusername/client-lead-management-system.git
cd client-lead-management-system
```

### **Step 2: Backend Setup**
```bash
cd backend
npm install
```

Create a `.env` file in the backend directory:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/crm_db
JWT_SECRET=your_super_secret_key_change_this_in_production
NODE_ENV=development

# Email Configuration (Gmail App Password)
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-16-digit-app-password

# Frontend URL
FRONTEND_URL=http://localhost:5173

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
```

### **Step 3: Frontend Setup**
```bash
cd ../frontend
npm install
```

Create a `.env` file in the frontend directory:
```env
VITE_API_URL=http://localhost:5000/api
VITE_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
```

### **Step 4: Seed Database (Optional)**
```bash
cd ../backend
node seed.js
```

This creates an admin user:
- Email: admin@leadcrm.com
- Password: Admin@123

### **Step 5: Run the Application**

**Backend:**
```bash
cd backend
npm run dev
# Server runs on http://localhost:5000
```

**Frontend:**
```bash
cd frontend
npm run dev
# Application runs on http://localhost:5173
```

---

## 🔧 **Environment Variables**

### **Backend (.env)**

| Variable | Description | Required | Example |
|----------|-------------|----------|---------|
| `PORT` | Server port | Yes | `5000` |
| `MONGO_URI` | MongoDB connection string | Yes | `mongodb://localhost:27017/crm_db` |
| `JWT_SECRET` | JWT signing secret | Yes | `your-secret-key` |
| `NODE_ENV` | Environment | No | `development` |
| `EMAIL_USER` | Gmail email address | For email features | `your-email@gmail.com` |
| `EMAIL_PASS` | Gmail app password | For email features | `16-digit-app-password` |
| `FRONTEND_URL` | Frontend URL | For password reset | `http://localhost:5173` |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | For Google login | `xxx.apps.googleusercontent.com` |

### **Frontend (.env)**

| Variable | Description | Required | Example |
|----------|-------------|----------|---------|
| `VITE_API_URL` | Backend API URL | Yes | `http://localhost:5000/api` |
| `VITE_GOOGLE_CLIENT_ID` | Google OAuth client ID | For Google login | `xxx.apps.googleusercontent.com` |

---

## 📡 **API Endpoints**

### **Authentication**
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/register` | Register new user | No |
| POST | `/api/auth/login` | Login user | No |
| POST | `/api/auth/google` | Google OAuth login | No |
| POST | `/api/auth/forgot-password` | Request password reset | No |
| POST | `/api/auth/reset-password` | Reset password | No |
| GET | `/api/auth/profile` | Get user profile | Yes |

### **Leads**
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/leads` | Get all leads (user-specific) | Yes |
| GET | `/api/leads/:id` | Get single lead | Yes |
| POST | `/api/leads` | Create lead | Yes |
| PUT | `/api/leads/:id` | Update lead | Yes |
| DELETE | `/api/leads/:id` | Delete lead | Yes |
| POST | `/api/leads/:id/notes` | Add note | Yes |
| GET | `/api/leads/:id/notes` | Get notes | Yes |

### **Messages**
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/messages/conversations` | Get all conversations | Yes |
| GET | `/api/messages/:id` | Get conversation messages | Yes |
| POST | `/api/messages` | Create new conversation | Yes |
| POST | `/api/messages/:id` | Send message | Yes |
| PUT | `/api/messages/:id/read` | Mark message as read | Yes |
| PUT | `/api/messages/:id/star` | Star/unstar message | Yes |
| DELETE | `/api/messages/:id` | Delete message | Yes |

### **Calendar**
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/calendar/events` | Get events | Yes |
| POST | `/api/calendar/events` | Create event | Yes |
| PUT | `/api/calendar/events/:id` | Update event | Yes |
| DELETE | `/api/calendar/events/:id` | Delete event | Yes |

### **Reports**
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/reports` | Get analytics data | Yes |
| GET | `/api/reports/export/csv` | Export as CSV | Yes |
| GET | `/api/reports/export/json` | Export as JSON | Yes |

### **Notifications**
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/notifications` | Get notifications | Yes |
| PUT | `/api/notifications/:id/read` | Mark as read | Yes |
| PUT | `/api/notifications/read-all` | Mark all as read | Yes |
| DELETE | `/api/notifications/:id` | Delete notification | Yes |

### **Export**
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/export/all` | Export all user data | Yes |
| GET | `/api/export/leads` | Export leads only | Yes |
| GET | `/api/export/messages` | Export messages only | Yes |
| GET | `/api/export/events` | Export calendar events | Yes |

---

## 📸 **Screenshots**

### Dashboard Overview
![Dashboard](https://via.placeholder.com/800x400?text=Dashboard+Preview)

### Lead Management
![Leads Page](https://via.placeholder.com/800x400?text=Leads+Page)

### Analytics & Reports
![Analytics](https://via.placeholder.com/800x400?text=Analytics+Preview)

### Calendar View
![Calendar](https://via.placeholder.com/800x400?text=Calendar+View)

### Messages & Notifications
![Messages](https://via.placeholder.com/800x400?text=Messages+Preview)

---

## 📖 **User Guide**

### **Getting Started**

1. **Create an Account**
   - Click "Sign Up" on the landing page
   - Enter username, email, and password
   - Or sign in with Google

2. **Add Your First Lead**
   - Navigate to the Leads page
   - Click "Add Lead"
   - Fill in lead details (name, email, source)
   - Click "Create Lead"

3. **Manage Lead Status**
   - Update status from dropdown: New → Contacted → Converted
   - Add follow-up notes to each lead
   - Track communication history

4. **Schedule Follow-ups**
   - Go to Calendar
   - Click on any date
   - Create event (Meeting, Call, Follow-up)
   - Set reminders and recurrence

5. **Send Messages**
   - Navigate to Messages
   - Click "New Message"
   - Enter recipient email and message
   - Message will be sent via email

6. **View Analytics**
   - Go to Reports page
   - Filter by date range
   - View conversion rates and trends
   - Export reports as CSV or JSON

### **Admin Features**
- Manage all leads and users
- View team performance metrics
- Access comprehensive analytics
- Configure system settings

---

## 🤝 **Contributing**

Contributions are welcome! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Commit your changes**
   ```bash
   git commit -m 'Add amazing feature'
   ```
4. **Push to the branch**
   ```bash
   git push origin feature/amazing-feature
   ```
5. **Open a Pull Request**

### **Development Guidelines**
- Follow ESLint and Prettier configurations
- Write meaningful commit messages
- Update documentation for new features
- Add tests for new functionality

---

## 🐛 **Troubleshooting**

| Issue | Solution |
|-------|----------|
| MongoDB connection error | Ensure MongoDB is running: `mongod` |
| JWT_SECRET not defined | Add JWT_SECRET to .env file |
| Email not sending | Use Gmail app password, not regular password |
| Google login fails | Verify GOOGLE_CLIENT_ID matches frontend and backend |
| Port already in use | Change PORT in .env or kill process on that port |
| IMAP connection error | Check email credentials and enable IMAP in Gmail settings |

### **Reset Database**
```bash
cd backend
node seed.js
```

### **Clear All Data**
```bash
# Connect to MongoDB
mongosh
use crm_db
db.dropDatabase()
```

---

## 📄 **License**

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👥 **Team**

- **Project Lead**: [Your Name](https://github.com/yourusername)
- **Backend Developer**: [Your Name](https://github.com/yourusername)
- **Frontend Developer**: [Your Name](https://github.com/yourusername)

---

## 🙏 **Acknowledgments**

- [React](https://reactjs.org/) - UI Framework
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [Node.js](https://nodejs.org/) - Backend Runtime
- [MongoDB](https://www.mongodb.com/) - Database
- [Google OAuth](https://developers.google.com/identity) - Authentication
- [Nodemailer](https://nodemailer.com/) - Email Service

---

## 📧 **Contact**

- **Email**: your-email@example.com
- **LinkedIn**: [Your Profile](https://linkedin.com/in/yourprofile)
- **Portfolio**: [yourportfolio.com](https://yourportfolio.com)

---

## 🌟 **Star the Project**

If you found this project helpful, please give it a ⭐ on GitHub!

[![GitHub stars](https://img.shields.io/github/stars/yourusername/client-lead-management-system)](https://github.com/yourusername/client-lead-management-system/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/yourusername/client-lead-management-system)](https://github.com/yourusername/client-lead-management-system/network)
[![GitHub issues](https://img.shields.io/github/issues/yourusername/client-lead-management-system)](https://github.com/yourusername/client-lead-management-system/issues)

---

**Built with ❤️ for Future Interns Task 2**
