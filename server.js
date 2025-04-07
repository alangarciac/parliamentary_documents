const express = require('express');
const cors = require('cors');
const DocumentService = require('./services/documentService');
const documentScraper = require('./jobs/documentScraper');
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

// Get documents with pagination and optional filters
app.get('/api/documents', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const authorFilter = req.query.author || null;
    const tramitNumber = req.query.tramitNumber || null;
    const result = await DocumentService.getDocuments(page, 10, authorFilter, tramitNumber);
    res.json(result);
  } catch (error) {
    console.error('Error fetching documents:', error);
    res.status(500).json({ error: 'Failed to fetch documents' });
  }
});

// Get all authors for the filter dropdown
app.get('/api/authors', async (req, res) => {
  try {
    const authors = await DocumentService.getAuthors();
    res.json(authors);
  } catch (error) {
    console.error('Error fetching authors:', error);
    res.status(500).json({ error: 'Failed to fetch authors' });
  }
});

// Get tramit numbers for the range filter
app.get('/api/tramit-numbers', async (req, res) => {
  try {
    const tramitNumbers = await DocumentService.getTramitNumbers();
    res.json(tramitNumbers);
  } catch (error) {
    console.error('Error fetching tramit numbers:', error);
    res.status(500).json({ error: 'Failed to fetch tramit numbers' });
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