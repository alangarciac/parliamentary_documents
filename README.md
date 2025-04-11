# Parlaments v1

A web application for managing and viewing parliamentary documents with advanced filtering capabilities.

**Author:** Alan Garcia Camiña

## Features

### Authentication System
- Secure login with JWT token-based authentication
- Role-based access control (ADMIN and USER roles)
- Protected routes and API endpoints
- Automatic token refresh

### Document Management
- View parliamentary documents with detailed information
- Filter documents by multiple criteria:
  - Search by document name or description
  - Filter by author (supports multiple authors per document)
  - Filter by document type
  - Filter by commission
- Pagination support for large document sets
- Clear filters functionality

### UI Components
- Modern and responsive design
- Interactive filter buttons for authors and commissions
- Visual feedback for selected filters
- Loading states and error handling
- Clean document information display
- PDF document access

### Database Structure
The application uses a relational database with the following key tables:
- `document`: Core document information
- `author`: Document authors
- `comision`: Parliamentary commissions
- `type`: Document types
- `parliamentary_tramit`: Parliamentary process tracking
- `user`: User accounts
- `role`: User roles

## Technical Stack

- Frontend: React.js
- Backend: Node.js with Express
- Database: MySQL with Sequelize ORM
- Scraper: Node.js with Puppeteer

## Application Architecture

### Database Structure

The application uses a MySQL database with a well-structured schema that includes:

- **Parliamentary Procedures**: Stores information about parliamentary procedures
- **Documents**: Contains document details including names and PDF links
- **Authors**: Manages author information
- **Subscribers**: Handles user subscriptions
- **Relationship Tables**: Manages many-to-many relationships between documents and authors, and subscribers and authors

The database is designed with proper indexing, foreign key constraints, and timestamp tracking for all records.

![image](https://github.com/user-attachments/assets/b09fc896-2ade-49d9-b2f2-27e5d821381f)


### Application Composition

The application is divided into several key components:

1. **Frontend (React.js)**
   - Modern, responsive UI built with React
   - Real-time document filtering and search
   - Pagination system for document navigation
   - Interactive author and procedure number filters

2. **Backend (Node.js/Express)**
   - RESTful API endpoints
   - Document management services
   - Database operations through Sequelize ORM
   - Error handling and validation

3. **Database Layer (MySQL/Sequelize)**
   - Efficient data storage and retrieval
   - Optimized queries for document filtering
   - Proper relationship management
   - Automatic timestamp tracking

4. **Scraper System**
   - Automated document collection
   - Scheduled updates
   - Manual trigger capability
   - Error handling and logging

### Configuration

1. Database Setup:
```env
DB_HOST=localhost
DB_USER=your_username
DB_PASSWORD=your_password
DB_NAME=parlaments_db
```

2. The application will automatically create the necessary database tables on first run.

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MySQL database
- npm or yarn

### Installation
1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables:
   ```bash
   cp .env.example .env
   ```
4. Configure your database connection in `.env`
5. Run database migrations:
   ```bash
   npm run migrate
   ```
6. Start the development server:
   ```bash
   npm run dev
   ```

## API Endpoints

### Authentication
- `POST /api/auth/login`: User login
- `POST /api/auth/refresh`: Token refresh
- `POST /api/auth/logout`: User logout

### Documents
- `GET /api/documents`: Get documents with pagination and filtering
- `GET /api/documents/authors`: Get all authors
- `GET /api/documents/types`: Get all document types
- `GET /api/documents/comisions`: Get all commissions

## Filtering System

The application provides a comprehensive filtering system:

### Search Filter
- Full-text search across document names and descriptions
- Case-insensitive matching
- Partial word matching

### Author Filter
- Filter by single or multiple authors
- Visual highlighting of selected authors
- Supports partial name matching

### Type Filter
- Filter by document type
- Clear type categorization

### Commission Filter
- Filter by parliamentary commission
- Visual highlighting of selected commissions
- Supports multiple commissions per document

### Clear Filters
- One-click reset of all active filters
- Restores default view

## UI/UX Features

### Document Display
- Clean, organized layout
- Essential information at a glance
- Type indicators with visual styling
- PDF access with clear call-to-action

### Interactive Elements
- Clickable author and commission buttons
- Visual feedback on hover and selection
- Responsive design for all screen sizes
- Loading indicators for async operations

### Error Handling
- User-friendly error messages
- Graceful fallbacks for missing data
- Network error recovery
- Form validation feedback

## Development

### Project Structure
```
parlaments_v1/
├── frontend/           # React frontend
│   ├── src/
│   │   ├── components/ # React components
│   │   ├── services/   # API services
│   │   └── utils/      # Utility functions
├── backend/            # Node.js backend
│   ├── models/         # Database models
│   ├── routes/         # API routes
│   └── services/       # Business logic
└── database/           # Database scripts
```

### Available Scripts
- `npm run dev`: Start development server
- `npm run build`: Build for production
- `npm run test`: Run tests
- `npm run migrate`: Run database migrations

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details. 
