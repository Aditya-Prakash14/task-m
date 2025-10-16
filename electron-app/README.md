# Todo Calendar - Desktop App

A beautiful cross-platform desktop application for managing todos and calendar events, built with Electron.

## 🚀 Features

- **Authentication**: Secure login and registration
- **Dashboard**: Overview of all your tasks and events with analytics
- **Todo Management**: Create, edit, and delete todos with priorities, due dates, and status tracking
- **Calendar**: Manage events with date/time scheduling
- **Categories & Tags**: Organize your tasks (coming soon)
- **Cross-platform**: Works on macOS, Windows, and Linux

## 📋 Prerequisites

Make sure the backend API is running:
- Node.js backend must be running on `http://localhost:3000`
- See the main README in the parent directory for backend setup

## 🛠️ Installation

1. **Navigate to the electron-app directory**
   ```bash
   cd electron-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Make sure the backend is running**
   ```bash
   # In the parent directory
   npm run dev
   ```

4. **Start the Electron app**
   ```bash
   npm start
   ```

## 🎯 Usage

### First Time Setup

1. Launch the application
2. Click "Register" tab
3. Create your account with:
   - Name
   - Email
   - Password (minimum 6 characters)
   - Timezone

### Main Features

#### Dashboard
- View statistics for todos and events
- See recent todos and upcoming events
- Quick access to create new items

#### Todos
- Create todos with title, description, priority, and due date
- Filter by status and priority
- Search todos
- Edit and delete todos

#### Calendar
- View events by date
- Create events with start/end times
- All-day event support
- Event locations and descriptions

### Keyboard Shortcuts

- `Cmd/Ctrl + N` - New Todo
- `Cmd/Ctrl + E` - New Event
- `Cmd/Ctrl + 1` - Dashboard
- `Cmd/Ctrl + 2` - Todos
- `Cmd/Ctrl + 3` - Calendar
- `Esc` - Close modal

## 🏗️ Building for Production

### Build for all platforms
```bash
npm run build
```

### Platform-specific builds
```bash
# macOS
npm run build:mac

# Windows
npm run build:win

# Linux
npm run build:linux
```

The built applications will be in the `dist` folder.

## 📁 Project Structure

```
electron-app/
├── main.js                 # Main process
├── preload.js             # Preload script for IPC
├── package.json           # Dependencies and build config
├── renderer/              # Renderer process files
│   ├── auth.html          # Login/Register page
│   ├── dashboard.html     # Dashboard page
│   ├── todos.html         # Todos management
│   ├── calendar.html      # Calendar view
│   ├── categories.html    # Categories (placeholder)
│   ├── tags.html          # Tags (placeholder)
│   ├── css/               # Stylesheets
│   │   ├── styles.css     # Global styles
│   │   └── dashboard.css  # Dashboard-specific styles
│   └── js/                # JavaScript files
│       ├── api.js         # API service layer
│       ├── dashboard.js   # Dashboard logic
│       └── todos.js       # Todos logic
└── assets/                # App icons and images
    └── icon.png           # App icon
```

## 🔧 Configuration

### API Endpoint
The API endpoint is configured in `renderer/js/api.js`:
```javascript
const API_BASE_URL = 'http://localhost:3000/api';
```

Change this if your backend is running on a different URL.

## 🎨 Tech Stack

- **Electron**: Cross-platform desktop framework
- **HTML/CSS/JavaScript**: Frontend
- **electron-store**: Secure local storage for tokens
- **Fetch API**: HTTP requests to backend

## 🔒 Security Features

- Context isolation enabled
- Node integration disabled
- Secure IPC communication through preload script
- JWT token storage in encrypted electron-store
- No remote module access

## 📝 Features in Progress

- [ ] Categories management UI
- [ ] Tags management UI
- [ ] Reminders notifications
- [ ] Recurring events UI
- [ ] Dark mode
- [ ] Export/Import data
- [ ] Offline mode

## 🐛 Troubleshooting

### Can't connect to backend
- Make sure the backend server is running on port 3000
- Check the console for any CORS errors
- Verify the API_BASE_URL in `renderer/js/api.js`

### Login/Register not working
- Check backend logs for errors
- Ensure MySQL database is running and migrated
- Verify your credentials

### App won't start
- Run `npm install` again
- Delete `node_modules` and reinstall
- Check for any error messages in the terminal

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📄 License

ISC License

## 👨‍💻 Support

For issues and questions, please open an issue on GitHub.

---

**Note**: This desktop app requires the backend API to be running. See the main project README for backend setup instructions.
