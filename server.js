const express = require('express');
const cors = require('cors');
const DocumentService = require('./services/documentService');
const documentScraper = require('./jobs/documentScraper');
const AuthService = require('./services/authService');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// More permissive CORS configuration
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.use(express.json());

// Add error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something broke!' });
});

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  try {
    const { user } = AuthService.verifyToken(token);
    req.user = user;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid token' });
  }
};

// Login route
app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const result = await AuthService.login(username, password);
    res.json(result);
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
});

// Verify token route
app.get('/api/verify-token', authenticateToken, (req, res) => {
  res.json({ user: req.user });
});

// Get documents with filters
app.get('/api/documents', authenticateToken, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const filters = {
      author: req.query.author || '',
      tramitNumber: req.query.tramitNumber || '',
      type: req.query.type || '',
      comision: req.query.comision || ''
    };
    
    const result = await DocumentService.getDocuments(page, 10, filters);
    res.json(result);
  } catch (error) {
    console.error('Error fetching documents:', error);
    res.status(500).json({ error: 'Failed to fetch documents' });
  }
});

// Get all authors for the filter dropdown
app.get('/api/authors', authenticateToken, async (req, res) => {
  try {
    const authors = await DocumentService.getAuthors();
    res.json(authors);
  } catch (error) {
    console.error('Error fetching authors:', error);
    res.status(500).json({ error: 'Failed to fetch authors' });
  }
});

// Get all tramit numbers for the filter dropdown
app.get('/api/tramit-numbers', authenticateToken, async (req, res) => {
  try {
    const tramitNumbers = await DocumentService.getTramitNumbers();
    res.json(tramitNumbers);
  } catch (error) {
    console.error('Error fetching tramit numbers:', error);
    res.status(500).json({ error: 'Failed to fetch tramit numbers' });
  }
});

// Get all types for the filter dropdown
app.get('/api/types', authenticateToken, async (req, res) => {
  try {
    const types = await DocumentService.getTypes();
    res.json(types);
  } catch (error) {
    console.error('Error fetching types:', error);
    res.status(500).json({ error: 'Failed to fetch types' });
  }
});

// Get all commissions for the filter dropdown
app.get('/api/comisions', authenticateToken, async (req, res) => {
  try {
    const comisions = await DocumentService.getComisions();
    res.json(comisions);
  } catch (error) {
    console.error('Error fetching commissions:', error);
    res.status(500).json({ error: 'Failed to fetch commissions' });
  }
});

// Manual trigger endpoint for the scraper with optional page range
app.get('/run-scraper', async (req, res) => {
  try {
    const startPage = req.query.startPage ? parseInt(req.query.startPage) : null;
    const endPage = req.query.endPage ? parseInt(req.query.endPage) : null;

    // Validate parameters if provided
    if (startPage !== null && endPage !== null) {
      if (isNaN(startPage) || isNaN(endPage)) {
        return res.status(400).json({ error: 'startPage and endPage must be numbers' });
      }
      if (startPage < 1) {
        return res.status(400).json({ error: 'startPage must be greater than 0' });
      }
      if (endPage < startPage) {
        return res.status(400).json({ error: 'endPage must be greater than or equal to startPage' });
      }
    }

    // Run the scraper with the provided range or defaults
    await documentScraper.run(startPage, endPage);
    res.json({ 
      message: 'Scraper job started successfully',
      range: {
        startPage: startPage || documentScraper.defaultStartPage,
        endPage: endPage || documentScraper.defaultEndPage
      }
    });
  } catch (error) {
    console.error('Error starting scraper:', error);
    res.status(500).json({ error: error.message || 'Failed to start scraper' });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Documents endpoint available at: http://localhost:${PORT}/api/documents`);
  console.log(`Scraper endpoint available at: http://localhost:${PORT}/run-scraper`);
});

// Start the scheduled job
documentScraper.startScheduledJob(); 