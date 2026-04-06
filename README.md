# 📊 Client Lead Management System (Mini CRM)

## 🎯 **Project Overview**

A professional, enterprise-grade CRM application designed for agencies, freelancers, and small businesses to efficiently manage client leads, track communications, schedule meetings, and analyze conversion metrics. This full-stack solution provides a centralized platform for end-to-end lead management with real-time notifications and cloud-based media storage.

---

## ✨ **Live Demo**

[![Live Demo](https://img.shields.io/badge/Live-Demo-00C7B7?style=for-the-badge&logo=vercel&logoColor=white)](https://your-demo-link.com)
[![API Docs](https://img.shields.io/badge/API-Docs-FF6B6B?style=for-the-badge&logo=postman&logoColor=white)](https://your-api-docs.com)

---

## 📋 **Table of Contents**

- [Features](#-features)
- [Technology Stack](#-technology-stack)
- [Architecture](#-architecture)
- [Project Structure](#-project-structure)
- [Installation](#-installation)
- [Environment Variables](#-environment-variables)
- [API Endpoints](#-api-endpoints)
- [Screenshots](#-screenshots)
- [User Guide](#-user-guide)
- [Deployment](#-deployment)
- [Troubleshooting](#-troubleshooting)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🚀 **Features**

### 🔐 **Authentication & Security**
- JWT-based authentication with secure token storage
- Google OAuth 2.0 integration for social login
- Password reset with email verification (1-hour token expiration)
- Protected routes and role-based access control (RBAC)
- Session management with "Remember Me" functionality
- Password hashing with bcrypt (10 salt rounds)
- Rate limiting and security headers

### 📊 **Lead Management**
- Complete CRUD operations with user isolation
- Status tracking workflow (New → Contacted → Converted)
- Source tracking (Website, Referral, Social Media, LinkedIn, etc.)
- Advanced search and filtering by name, email, status, source
- CSV/JSON export functionality
- Bulk status updates
- Follow-up notes with timestamps and user attribution
- Lead assignment and ownership tracking

### 💬 **Messaging System**
- Real-time internal messaging with conversation threads
- Email integration with Nodemailer (Gmail SMTP)
- Professional responsive email templates
- Two-way communication tracking via IMAP
- Message threading with conversation history
- Star important messages for quick access
- Delete messages with confirmation
- Email reply tracking and auto-conversation creation

### 📅 **Calendar & Scheduling**
- Multiple views (Month, Week, Day)
- Event management (Meetings, Calls, Video, Follow-ups)
- Reminder notifications (5 min to 1 day)
- Recurring events (Daily, Weekly, Monthly)
- Color-coded events for visual organization
- Lead association with calendar events
- Event location/meeting link support

### 📈 **Analytics & Reports**
- Interactive dashboard with real-time KPIs
- Lead trend charts (Bar/Line toggle)
- Source distribution analytics with percentages
- Status distribution visualization
- Conversion funnel analysis with drop-off points
- Performance metrics (response time, conversion rates)
- Export reports (CSV, JSON formats)
- Time-based filtering (Weekly/Monthly/Yearly/Custom)
- Team performance tracking

### 👤 **User Profile Management**
- Profile picture upload to Cloudinary (CDN)
- Password change with validation
- Personal information management
- Account deletion with confirmation dialog
- Dark mode preference persistence
- Session management

### 🔔 **Notifications System**
- Real-time notification bell with unread count badge
- Email notifications for messages and replies
- Calendar event reminders (15/30/60 minutes)
- Lead status change alerts
- New message notifications
- Bulk read/unread operations
- Notification filtering by type and status
- Auto-refresh every 30 seconds

### 🌓 **Dark Mode**
- Full dark mode support across 15+ pages
- Persistent theme preference in localStorage
- Smooth CSS transitions
- System preference detection (prefers-color-scheme)

### 📱 **Responsive Design**
- Mobile-first approach with Tailwind CSS
- Collapsible sidebar for mobile devices
- Touch-friendly interactions
- Responsive tables with horizontal scroll

### ☁️ **Cloud Integration**
- Cloudinary CDN for profile picture storage
- Automatic image optimization and transformation
- Secure HTTPS delivery

---

## 🛠️ **Technology Stack**

### **Frontend**
| Technology | Version | Purpose |
|------------|---------|---------|
| React | 18.2.0 | UI Framework with Hooks |
| Vite | 4.4.5 | Build Tool & Dev Server |
| Tailwind CSS | 3.3.5 | Utility-first Styling |
| React Router DOM | 6.20.0 | Client-side Routing |
| Axios | 1.6.0 | HTTP Client with Interceptors |
| Lucide React | 0.263.1 | Modern Icon Library |
| React Hot Toast | 2.4.0 | Toast Notifications |

### **Backend**
| Technology | Version | Purpose |
|------------|---------|---------|
| Node.js | 18+ | JavaScript Runtime |
| Express.js | 4.18.2 | Web Framework |
| MongoDB | 7.0.0 | NoSQL Database |
| Mongoose | 7.0.0 | ODM with Schema Validation |
| JSON Web Token | 9.0.0 | Authentication |
| Bcryptjs | 2.4.3 | Password Hashing |
| Nodemailer | 6.9.0 | Email Service (SMTP) |
| Multer | 1.4.5 | File Upload Handling |
| Cloudinary | 1.41.0 | Cloud Image Storage |
| Google Auth Library | 8.9.0 | Google OAuth Integration |
| IMAP | 0.8.19 | Email Receiving Protocol |
| Mailparser | 3.6.5 | Email Parsing |

### **Database Design**
```javascript
// 7 Core Models with Relationships
- User (Authentication & Profile)
- Lead (Lead Management)
- Conversation & Message (Messaging)
- Event (Calendar)
- Notification (Alert System)
- PasswordReset (Security)
```

---

## 🏗️ **Architecture**

```
┌─────────────────────────────────────────────────────────────┐
│                        Client Browser                        │
│                   (React SPA with Vite)                      │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ HTTPS / JWT
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      Express.js Server                       │
│                   (REST API with Middleware)                 │
└─────────────────────────────────────────────────────────────┘
                              │
              ┌───────────────┼───────────────┐
              ▼               ▼               ▼
      ┌─────────────┐ ┌─────────────┐ ┌─────────────┐
      │   MongoDB   │ │  Cloudinary │ │   Gmail     │
      │   Database  │ │   (CDN)     │ │   SMTP/IMAP │
      └─────────────┘ └─────────────┘ └─────────────┘
```

### **Data Flow**
1. User authentication → JWT token generation
2. Lead creation → Database storage → Notification trigger
3. Message sending → Email delivery → IMAP reply tracking
4. Calendar events → Reminder notifications
5. Analytics → Aggregated data visualization

---

## 📁 **Project Structure**

```
client-lead-management-system/
├── backend/
│   ├── config/
│   │   ├── cloudinary.js      # Cloudinary configuration
│   │   └── db.js         # MongoDB connection
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
│   │   └── authMiddleware.js              # JWT verification
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
│   │   ├── emailReceiver.js    # IMAP email polling
│   │   └── emailService.js      # SMTP email sending
│   ├── uploads/
│   │   └── temp/                # Temporary uploads
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
- Cloudinary account (for image storage)

### **Step 1: Clone the Repository**
```bash
git clone https://github.com/ahmedseid9392/FUTURE_FS_02.git
cd client-lead-management-system
```

### **Step 2: Backend Setup**
```bash
cd backend
npm install
```

Create a `.env` file in the backend directory:
```env
# Server Configuration
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

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
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

### **Step 4: Create Required Directories**
```bash
cd ../backend
mkdir -p uploads/temp
```

### **Step 5: Seed Database (Optional)**
```bash
node seed.js
```
This creates an admin user:
- **Email:** admin@leadcrm.com
- **Password:** Admin@123

### **Step 6: Run the Application**

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
| `JWT_SECRET` | JWT signing secret | Yes | `your-secret-key-min-32-chars` |
| `NODE_ENV` | Environment | No | `development` |
| `EMAIL_USER` | Gmail email address | For email | `your-email@gmail.com` |
| `EMAIL_PASS` | Gmail app password | For email | `16-digit-app-password` |
| `FRONTEND_URL` | Frontend URL | For reset | `http://localhost:5173` |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | For Google | `xxx.apps.googleusercontent.com` |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name | For images | `your_cloud_name` |
| `CLOUDINARY_API_KEY` | Cloudinary API key | For images | `1234567890` |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret | For images | `abc123def456` |

### **Frontend (.env)**

| Variable | Description | Required | Example |
|----------|-------------|----------|---------|
| `VITE_API_URL` | Backend API URL | Yes | `http://localhost:5000/api` |
| `VITE_GOOGLE_CLIENT_ID` | Google OAuth client ID | For Google | `xxx.apps.googleusercontent.com` |

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
| GET | `/api/leads` | Get user's leads | Yes |
| GET | `/api/leads/:id` | Get single lead | Yes |
| POST | `/api/leads` | Create lead | Yes |
| PUT | `/api/leads/:id` | Update lead | Yes |
| DELETE | `/api/leads/:id` | Delete lead | Yes |
| POST | `/api/leads/:id/notes` | Add note | Yes |
| GET | `/api/leads/:id/notes` | Get notes | Yes |

### **Messages**
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/messages/conversations` | Get conversations | Yes |
| GET | `/api/messages/:id` | Get messages | Yes |
| POST | `/api/messages` | Create conversation | Yes |
| POST | `/api/messages/:id` | Send message | Yes |
| PUT | `/api/messages/:id/read` | Mark as read | Yes |
| PUT | `/api/messages/:id/star` | Star message | Yes |
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
| GET | `/api/reports` | Get analytics | Yes |
| GET | `/api/reports/export/csv` | Export CSV | Yes |
| GET | `/api/reports/export/json` | Export JSON | Yes |

### **Notifications**
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/notifications` | Get notifications | Yes |
| PUT | `/api/notifications/:id/read` | Mark as read | Yes |
| PUT | `/api/notifications/read-all` | Mark all read | Yes |
| DELETE | `/api/notifications/:id` | Delete notification | Yes |

### **Profile & Export**
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| PUT | `/api/auth/profile` | Update profile | Yes |
| PUT | `/api/auth/change-password` | Change password | Yes |
| POST | `/api/auth/upload-avatar` | Upload avatar | Yes |
| DELETE | `/api/auth/avatar` | Remove avatar | Yes |
| GET | `/api/export/all` | Export all data | Yes |

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
   - Navigate to landing page
   - Click "Sign Up" or "Sign Up Free"
   - Enter username, email, and password (min 6 chars)
   - Or click "Sign in with Google"

2. **Add Your First Lead**
   - Go to Leads page from sidebar
   - Click "Add Lead" button
   - Fill in name, email, phone, source
   - Click "Create Lead"

3. **Manage Lead Status**
   - Update status from dropdown: New → Contacted → Converted
   - Add follow-up notes in Lead Details
   - Track communication history

4. **Schedule Follow-ups**
   - Open Calendar from sidebar
   - Click any date to create event
   - Select type (Meeting/Call/Video/Follow-up)
   - Set reminder and recurrence

5. **Send Messages**
   - Go to Messages page
   - Click "New Message"
   - Enter recipient email and subject
   - Compose and send (email delivered via SMTP)

6. **View Analytics**
   - Navigate to Reports page
   - Filter by date range (Today/Week/Month/Year/Custom)
   - Toggle between bar/line charts
   - Export data as CSV or JSON

### **Admin Features**
- View all leads in the system
- Access comprehensive analytics
- Manage user profiles and settings
- Configure system preferences

### **Keyboard Shortcuts**
| Action | Shortcut |
|--------|----------|
| Save | `Ctrl/Cmd + S` |
| Search | `Ctrl/Cmd + K` |
| New Lead | `Ctrl/Cmd + N` |
| Dark Mode | `Ctrl/Cmd + D` |

---

## 🚀 **Deployment**

### **Backend Deployment (Render/Railway/Heroku)**

1. **Push code to GitHub**
2. **Connect to deployment platform**
3. **Add environment variables**
4. **Deploy**

### **Frontend Deployment (Vercel/Netlify)**

1. **Build the project:**
```bash
cd frontend
npm run build
```

2. **Deploy the `dist` folder**

3. **Configure environment variables in hosting platform**

### **Docker Deployment (Optional)**

```dockerfile
# Dockerfile for backend
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
```

---

## 🐛 **Troubleshooting**

| Issue | Solution |
|-------|----------|
| MongoDB connection error | Run `mongod` to start MongoDB service |
| JWT_SECRET not defined | Add JWT_SECRET to .env file |
| Email not sending | Use Gmail app password, not regular password |
| Google login fails | Verify GOOGLE_CLIENT_ID matches frontend/backend |
| Port already in use | Change PORT in .env or kill process |
| IMAP connection error | Enable IMAP in Gmail settings |
| Cloudinary upload fails | Check API credentials and cloud name |
| 404 errors | Verify API endpoints are registered in server.js |
| 500 errors | Check console logs for detailed error messages |

### **Reset Database**
```bash
cd backend
node seed.js
```

### **Clear All Data**
```bash
mongosh
use crm_db
db.dropDatabase()
```

### **View Logs**
```bash
# Backend logs
cd backend
npm run dev

# MongoDB logs
mongod --logpath /var/log/mongodb/mongod.log
```

---

## 🤝 **Contributing**

We welcome contributions! Please follow these steps:

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
- Ensure dark mode compatibility

---

## 📄 **License**

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👥 **Team**

| Role | Name | GitHub |
|------|------|--------|
| Project Lead | Ahmed Seid| [@AhmedSeid]((https://github.com/ahmedseid9392)) |
| Backend Developer | Ahmed Seid | [@AhmedSeid(https://github.com/ahmedseid9392) |
| Frontend Developer | Ahmed Seid| [@AhmedSeid]((https://github.com/ahmedseid9392) |

---

## 🙏 **Acknowledgments**

- [React](https://reactjs.org/) - UI Framework
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [Node.js](https://nodejs.org/) - Backend Runtime
- [MongoDB](https://www.mongodb.com/) - Database
- [Express](https://expressjs.com/) - Web Framework
- [Cloudinary](https://cloudinary.com/) - Image Storage
- [Google OAuth](https://developers.google.com/identity) - Authentication
- [Nodemailer](https://nodemailer.com/) - Email Service

---

## 📊 **Project Status**



---

## 📧 **Contact**

- **Email**: ahmedseid4451@gmail.com
- **LinkedIn**: [Your Profile](https://linkedin.com/in/AhmedSeid4451)
- **Portfolio**: [yourportfolio.com](https://ahmedseidali.vercel.app)


---



---





*Last Updated: April 2026*
