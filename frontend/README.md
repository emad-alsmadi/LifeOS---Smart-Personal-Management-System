# LifeOS - Life Management Platform

A comprehensive web application for managing goals, objectives, projects, and tasks with a hierarchical approach to productivity and life organization.

## 🎯 Features

### Core Functionality
- **Goal Management**: Set and track meaningful goals with clear objectives
- **Objective Planning**: Break down goals into actionable objectives with priority levels
- **Project Organization**: Manage complex projects with deadlines and team collaboration
- **Task Management**: Create, assign, and track tasks with priorities and statuses
- **Habit Building**: Build lasting habits with streak tracking and daily reminders
- **Calendar Integration**: View tasks and events in a beautiful calendar interface
- **Note Taking**: Capture ideas and important information with rich text notes
- **Analytics Dashboard**: Track progress with detailed analytics and insights

### Technical Features
- **Modern UI/UX**: Clean, professional design with smooth animations
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile
- **Real-time Updates**: Instant synchronization across all components
- **User Authentication**: Secure login and registration system
- **Data Persistence**: MongoDB backend with reliable data storage

## 🏗️ Architecture

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **Framer Motion** for animations
- **React Router** for navigation
- **Lucide React** for icons

### Backend
- **Node.js** with Express
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **Nodemon** for development

## 🚀 Installation

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- MongoDB (local or cloud)

### Frontend Setup
```bash
# Navigate to project directory
cd project

# Install dependencies
npm install

# Start development server
npm run dev
```

### Backend Setup
```bash
# Navigate to backend directory
cd "backend code"

# Install dependencies
npm install

# Create .env file with your configuration
echo "MONGO_URI=your_mongodb_connection_string
PORT=5000
NODE_ENV=development
JWT_SECRET=your_jwt_secret" > .env

# Start development server
npm run dev
```

## 📁 Project Structure

```
project/
├── src/
│   ├── components/          # Reusable UI components
│   ├── pages/              # Page components
│   ├── layouts/            # Layout components
│   ├── contexts/           # React contexts
│   ├── lib/                # API and utilities
│   └── index.css           # Global styles
├── backend code/
│   ├── controllers/        # API controllers
│   ├── models/            # MongoDB models
│   ├── routes/            # API routes
│   └── server.js          # Express server
└── README.md
```

## 🎨 Design System

The application uses a corporate/professional design system with:
- **Color Palette**: Muted blue/gray tones
- **Typography**: Playfair Display for headings, Inter for body text
- **Components**: Consistent UI components with hover effects and animations
- **Spacing**: Systematic spacing scale for visual hierarchy

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the backend directory:

```env
MONGO_URI=mongodb://localhost:27017/lifeos
PORT=5000
NODE_ENV=development
JWT_SECRET=your_secret_key_here
```

## 📱 Usage

1. **Register/Login**: Create an account or sign in
2. **Create Goals**: Start with your big-picture vision
3. **Add Objectives**: Break down goals into actionable steps
4. **Create Projects**: Organize work under objectives
5. **Manage Tasks**: Break projects into individual tasks
6. **Track Progress**: Monitor completion and analytics

## 🎯 Hierarchy Structure

```
Goal
├── Objective 1
│   ├── Project A
│   │   ├── Task 1
│   │   ├── Task 2
│   │   └── Task 3
│   └── Project B
│       ├── Task 1
│       └── Task 2
└── Objective 2
    └── Project C
        └── Task 1
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with React and Node.js
- Styled with Tailwind CSS
- Icons from Lucide React
- Animations with Framer Motion

## 📞 Support

For support, email support@lifeos.com or create an issue in this repository.

---

**LifeOS** - Organize. Achieve. Succeed. 