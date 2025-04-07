# Parlaments v1

A web application for managing and viewing parliamentary documents from the Argentine Congress.

## Features

### Document Management
- View parliamentary documents in a structured table format
- Search documents by name or author
- Filter documents by author
- Filter documents by parliamentary procedure number
- View document details including:
  - Parliamentary procedure number
  - Document name
  - Author(s)
  - PDF link
- Pagination support (10 documents per page)
- Responsive design for all screen sizes

### Database Integration
- MySQL database for document storage
- Automatic document scraping and database population
- Scheduled updates every 5 hours
- Manual trigger option for immediate updates
- Efficient data relationships between documents and authors

### Scraper Control
- Manual control of scraping range
- Customizable start and end pages
- Parameter validation for page ranges
- Default range (1-5) for scheduled jobs
- Real-time status updates and error handling

## Technical Stack

### Frontend
- React.js
- CSS3 with responsive design
- Modern UI components
- Client-side filtering and search

### Backend
- Node.js with Express
- MySQL database
- Sequelize ORM
- Automated scraping system
- Scheduled tasks with node-cron

## API Endpoints

### Document Management
- `GET /api/documents` - Get documents with pagination and filters
  - Query parameters:
    - `page`: Page number (default: 1)
    - `author`: Filter by author name
    - `tramitNumber`: Filter by parliamentary procedure number

- `GET /api/authors` - Get all authors for filtering
- `GET /api/tramit-numbers` - Get available parliamentary procedure numbers

### Scraper Control
- `GET /run-scraper` - Manually trigger the scraper
  - Query parameters:
    - `startPage`: Starting page number (optional)
    - `endPage`: Ending page number (optional)
  - Example: `/run-scraper?startPage=10&endPage=15`
  - Default range: 1-5 (if no parameters provided)

## Installation

1. Clone the repository:
```bash
git clone [repository-url]
cd parlaments_v1
```

2. Install dependencies:
```bash
# Install backend dependencies
npm install

# Install frontend dependencies
cd frontend
npm install
```

3. Set up the database:
- Create a MySQL database
- Update the database configuration in `.env`
- Run the database initialization script

4. Start the application:
```bash
# Start the backend server
npm start

# Start the frontend development server
cd frontend
npm start
```

## Configuration

Create a `.env` file in the root directory with the following variables:

```env
DB_NAME=parliamentary_documents
DB_USER=your_username
DB_PASSWORD=your_password
DB_HOST=localhost
PORT=3001
```

## Usage

### Viewing Documents
- Access the application at `http://localhost:3000`
- Use the search bar to find specific documents
- Filter documents by author using the dropdown
- Filter documents by parliamentary procedure number
- Navigate through pages using the pagination controls
- Click on author names to filter by that author
- Click "Ver PDF" to view the document

### Scraper Control
- The scraper runs automatically every 5 hours with default range (1-5)
- Manually trigger the scraper with custom range:
  ```bash
  # Using default range
  curl http://localhost:3001/run-scraper

  # Using custom range
  curl http://localhost:3001/run-scraper?startPage=10&endPage=15
  ```
- Validation rules:
  - Both parameters must be numbers
  - startPage must be greater than 0
  - endPage must be greater than or equal to startPage

## Development

### Adding New Features
1. Create a new branch for your feature
2. Implement the changes
3. Test thoroughly
4. Submit a pull request

### Running Tests
```bash
# Run backend tests
npm test

# Run frontend tests
cd frontend
npm test
```

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details. 