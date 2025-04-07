# Parlaments v1

Aplicación web para gestionar y visualizar documentos parlamentarios del Congreso de la Nación Argentina.

## Características

- Gestión de documentos parlamentarios
- Integración con base de datos MySQL
- Control manual del scraper
- Filtrado por autor y número de trámite
- Paginación de resultados
- Interfaz de usuario intuitiva

## Stack Técnico

- Frontend: React.js
- Backend: Node.js con Express
- Base de datos: MySQL con Sequelize ORM
- Scraper: Node.js con Puppeteer

## Base de Datos

### Esquema Inicial

La aplicación utiliza una base de datos MySQL con el siguiente esquema:

```sql
CREATE TABLE parliamentary_tramits (
    id INT AUTO_INCREMENT PRIMARY KEY,
    number VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE documents (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    link_to_pdf VARCHAR(255) NOT NULL,
    parliamentary_tramit_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (parliamentary_tramit_id) REFERENCES parliamentary_tramits(id)
);

CREATE TABLE authors (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE document_authors (
    document_id INT,
    author_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (document_id, author_id),
    FOREIGN KEY (document_id) REFERENCES documents(id),
    FOREIGN KEY (author_id) REFERENCES authors(id)
);

CREATE TABLE subscribers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE subscriber_authors (
    subscriber_id INT,
    author_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (subscriber_id, author_id),
    FOREIGN KEY (subscriber_id) REFERENCES subscribers(id),
    FOREIGN KEY (author_id) REFERENCES authors(id)
);
```

### Configuración Inicial

1. Crear una base de datos MySQL:
```sql
CREATE DATABASE parlaments_db;
```

2. Configurar las variables de entorno:
```env
DB_HOST=localhost
DB_USER=tu_usuario
DB_PASSWORD=tu_contraseña
DB_NAME=parlaments_db
```

3. La aplicación creará automáticamente las tablas al iniciar si no existen.

### Modelos

La aplicación utiliza Sequelize ORM con los siguientes modelos:

- `ParliamentaryTramit`: Representa un trámite parlamentario
- `Document`: Almacena información de documentos
- `Author`: Gestiona autores de documentos
- `Subscriber`: Maneja suscriptores
- `DocumentAuthor`: Relación muchos a muchos entre documentos y autores
- `SubscriberAuthor`: Relación muchos a muchos entre suscriptores y autores

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