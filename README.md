# AI-Powered Code Debugger

An interactive web application that helps you debug and improve your code using AI. This application supports multiple programming languages, provides real-time feedback, and offers AI-powered suggestions to fix your code.

## Features

- 🔍 **Multi-language Support**: Debug code in Python, JavaScript, Java, C, and C++
- 🤖 **AI-Powered Debugging**: Get intelligent suggestions to fix your code
- 🔄 **Real-time Feedback**: See errors and output immediately
- 🔒 **User Authentication**: Secure access with Google Sign-In
- 📊 **Coding History**: Track your previous debugging sessions
- ✨ **Beautiful UI**: Modern, responsive interface with animations

## Project Structure

- **Frontend**: React application with authentication and interactive UI
- **Backend**: FastAPI server that handles code execution and AI integration

## Getting Started

### Prerequisites

- Node.js (for frontend)
- Python 3.8+ (for backend)
- Firebase account (for authentication)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/ai-powered-debugger.git
cd ai-powered-debugger
```

2. Set up the backend:
```bash
cd backend
pip install -r requirements.txt
```

3. Set up the frontend:
```bash
cd frontend
npm install
```

4. Create a Firebase project and set up authentication:
   - Go to the [Firebase Console](https://console.firebase.google.com/)
   - Create a new project
   - Enable Google Authentication
   - Create a web app and copy the configuration

5. Update Firebase configuration:
   - Open `frontend/src/firebase.js`
   - Replace the placeholder config with your Firebase config

### Running Locally

1. Start the backend server:
```bash
cd backend
python -m uvicorn app:app --reload
```

2. Start the frontend development server:
```bash
cd frontend
npm start
```

3. Open your browser and navigate to: `http://localhost:3000`

## Free Hosting Options

You can deploy this application for free using the following services:

### Backend Hosting Options

1. **Render**
   - Sign up at [render.com](https://render.com)
   - Create a new Web Service
   - Connect your GitHub repository
   - Set the build command: `pip install -r requirements.txt`
   - Set the start command: `uvicorn app:app --host 0.0.0.0 --port $PORT`
   - Deploy

2. **Railway**
   - Sign up at [railway.app](https://railway.app)
   - Create a new project and select Python
   - Connect your GitHub repository
   - Add environment variables as needed
   - Deploy

3. **Fly.io**
   - Sign up at [fly.io](https://fly.io)
   - Install Flyctl
   - Run `flyctl launch` in your backend directory

### Frontend Hosting Options

1. **Vercel**
   - Sign up at [vercel.com](https://vercel.com)
   - Connect your GitHub repository
   - Configure build settings:
     - Build Command: `npm run build`
     - Output Directory: `build`
   - Add environment variables (including backend API URL)
   - Deploy

2. **Netlify**
   - Sign up at [netlify.com](https://netlify.com)
   - Create a new site from Git
   - Configure build settings:
     - Build Command: `npm run build`
     - Publish Directory: `build`
   - Add environment variables
   - Deploy

3. **GitHub Pages**
   - Add `"homepage": "https://yourusername.github.io/ai-powered-debugger"` to package.json
   - Install gh-pages: `npm install --save-dev gh-pages`
   - Add deploy scripts to package.json:
     ```json
     "predeploy": "npm run build",
     "deploy": "gh-pages -d build"
     ```
   - Run `npm run deploy`

### Database (For User Data)

1. **Firebase Firestore**
   - Go to the Firebase Console
   - Enable Firestore
   - Set up security rules
   - Use the same Firebase project as your authentication

## Configuration

### Environment Variables

Backend:
- `GEMINI_API_KEY`: Your Google Gemini API key
- `RAPIDAPI_KEY`: Your RapidAPI key (for Judge0 API)

Frontend:
- `REACT_APP_API_URL`: URL to your backend API
- Firebase configuration variables are set in `firebase.js`

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
