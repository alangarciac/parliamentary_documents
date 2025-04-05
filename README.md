# Parliamentary Documents Viewer

A simple web application to view and filter parliamentary documents from the Argentine Chamber of Deputies.

## Features

- Backend API to fetch and cache documents
- Frontend interface with filtering capabilities
- Responsive design using Tailwind CSS
- Simple and maintainable code structure

## Setup

### Backend

1. Navigate to the root directory
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the server:
   ```bash
   npm run dev
   ```

### Frontend

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm start
   ```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001

## Project Structure

```
.
├── frontend/           # React frontend application
│   ├── src/
│   │   ├── App.js     # Main React component
│   │   └── App.css    # Styles
│   └── package.json   # Frontend dependencies
├── server.js          # Express backend server
└── package.json       # Backend dependencies
```

## Technologies Used

- Frontend: React, Tailwind CSS
- Backend: Node.js, Express
- Data Fetching: Axios, Cheerio 