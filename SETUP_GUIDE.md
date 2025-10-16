# Todo Calendar App - Complete Setup Guide

This project consists of two parts:
1. **Backend API** (Node.js + Express + Prisma + MySQL)
2. **Desktop App** (Electron)

## 📁 Project Structure

```
todo_alarm-app/
├── Backend (API Server)
│   ├── controllers/
│   ├── routes/
│   ├── middleware/
│   ├── prisma/
│   ├── server.js
│   └── package.json
│
└── electron-app/ (Desktop Application)
    ├── main.js
    ├── preload.js
    ├── renderer/
    └── package.json
```

## 🚀 Quick Start

### Step 1: Setup Backend

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Create .env file**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` with your MySQL credentials:
   ```env
   DATABASE_URL="mysql://username:password@localhost:3306/todo_calendar_db"
   JWT_SECRET="your-secret-key"
   JWT_EXPIRE="7d"
   PORT=3000
   NODE_ENV=development
   ```

3. **Setup database**
   ```bash
   # Create database
   mysql -u root -p
   CREATE DATABASE todo_calendar_db;
   exit;

   # Run migrations
   npx prisma migrate dev --name init
   npx prisma generate
   ```

4. **Start backend server**
   ```bash
   npm run dev
   ```

   The backend API will be running at `http://localhost:3000`

### Step 2: Setup Desktop App

1. **Navigate to electron-app directory**
   ```bash
   cd electron-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the desktop app**
   ```bash
   npm start
   ```

## 📝 Usage Guide

### Backend API
- API documentation: See `/README.md` in root directory
- Endpoints available at: `http://localhost:3000/api`
- Test with tools like Postman or curl

### Desktop App
1. **First Launch**
   - Register a new account
   - Choose your timezone
   - Login with your credentials

2. **Dashboard**
   - View all statistics
   - See recent todos and upcoming events
   - Quick actions to create new items

3. **Todos**
   - Create, edit, delete todos
   - Set priorities (Low, Medium, High, Urgent)
   - Set due dates
   - Track status (Pending, In Progress, Completed)
   - Filter and search

4. **Calendar**
   - View events by date
   - Create new events
   - Set start and end times
   - Add location and description

## 🔧 Development

### Backend Development
```bash
# Start in development mode with auto-reload
npm run dev

# View database in Prisma Studio
npm run prisma:studio

# Create new migration
npx prisma migrate dev --name migration_name
```

### Desktop App Development
```bash
cd electron-app

# Start app in development mode
npm start

# Build for production
npm run build

# Platform-specific builds
npm run build:mac
npm run build:win
npm run build:linux
```

## 🎯 Features

### ✅ Completed Features
- User authentication (register/login)
- Todo management with priorities and status
- Calendar events with scheduling
- Dashboard with analytics
- Categories and tags system
- Reminders
- Search and filtering
- Desktop application with native UI

### 🚧 Advanced Features Available
- Sub-todos (hierarchical tasks)
- Recurring events (RRULE support)
- Event conflict detection
- Time tracking
- Productivity analytics
- Multiple attendees per event

## 📚 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile

### Todos
- `GET /api/todos` - Get all todos
- `POST /api/todos` - Create todo
- `GET /api/todos/:id` - Get single todo
- `PUT /api/todos/:id` - Update todo
- `DELETE /api/todos/:id` - Delete todo

### Events
- `GET /api/events` - Get all events
- `POST /api/events` - Create event
- `GET /api/events/by-date?date=YYYY-MM-DD` - Get events by date
- `PUT /api/events/:id` - Update event
- `DELETE /api/events/:id` - Delete event

### Analytics
- `GET /api/analytics/dashboard` - Dashboard statistics
- `GET /api/analytics/productivity` - Productivity metrics

## 🔒 Security

- JWT-based authentication
- Password hashing with bcryptjs
- SQL injection prevention via Prisma ORM
- Context isolation in Electron
- Secure token storage

## 🛠️ Tech Stack

### Backend
- Node.js & Express
- Prisma ORM
- MySQL Database
- JWT for authentication
- bcryptjs for password hashing

### Desktop App
- Electron
- HTML/CSS/JavaScript
- electron-store for secure storage
- Fetch API for HTTP requests

## 📦 Building for Production

### Backend
```bash
# Production mode
npm start
```

### Desktop App
```bash
cd electron-app
npm run build
```

Executables will be in `electron-app/dist/`

## 🐛 Troubleshooting

### Backend Issues
- **Database connection fails**: Check MySQL is running and credentials in `.env`
- **Prisma errors**: Run `npx prisma generate` again
- **Port already in use**: Change PORT in `.env`

### Desktop App Issues
- **Can't connect to API**: Ensure backend is running on port 3000
- **Login fails**: Check backend logs and network tab
- **White screen**: Check DevTools console for errors (View > Toggle Developer Tools)

## 📖 Documentation

- Backend API: `/README.md`
- Desktop App: `/electron-app/README.md`
- Prisma Schema: `/prisma/schema.prisma`

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

ISC License

---

**Happy Task Managing! 📅✅**
