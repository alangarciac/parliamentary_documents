# Parlaments v1

A web application for managing and viewing parliamentary documents from the Argentine Congress.

## Features

### Document Management
- View parliamentary documents in a structured table format
- Search documents by name or author
- Filter documents by author
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

### User Interface
- Clean, modern table-based layout
- Intuitive pagination controls
- Interactive author filtering
- Real-time search functionality
- Loading states and error handling
- Responsive design for mobile devices

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

## Database Schema

The application uses the following database structure:

```sql
-- Parliamentary procedures
CREATE TABLE parliamentary_tramit (
    id INT AUTO_INCREMENT PRIMARY KEY,
    number VARCHAR(50) NOT NULL
);

-- Documents
CREATE TABLE document (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    link_to_pdf TEXT NOT NULL,
    description TEXT,
    date DATE,
    parliamentary_tramit_id INT NOT NULL,
    FOREIGN KEY (parliamentary_tramit_id) REFERENCES parliamentary_tramit(id)
);

-- Authors
CREATE TABLE author (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL
);

-- Document-Author relationships
CREATE TABLE document_author (
    document_id INT NOT NULL,
    author_id INT NOT NULL,
    PRIMARY KEY (document_id, author_id),
    FOREIGN KEY (document_id) REFERENCES document(id),
    FOREIGN KEY (author_id) REFERENCES author(id)
);
```

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
- Navigate through pages using the pagination controls
- Click on author names to filter by that author
- Click "Ver PDF" to view the document

### Admin Functions
- Access the scraper endpoint at `http://localhost:3001/run-scraper` to manually trigger document updates
- The scraper runs automatically every 5 hours

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