const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const cors = require('cors');
const pdfParse = require('pdf-parse');
const documentScraper = require('./jobs/documentScraper');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// More permissive CORS configuration
app.use(cors({
  origin: '*', // Allow all origins
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// Add error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something broke!' });
});

app.use(express.json());

// Cache for storing documents
let documentCache = {
  data: null,
  timestamp: null,
  CACHE_DURATION: 1000 * 60 * 30 // 30 minutes
};

// Base URL for the parliamentary documents
const BASE_URL = 'https://www2.hcdn.gob.ar/secparl/dsecretaria/s_t_parlamentario/2025';

// Function to generate document URL
function generateDocumentUrl(documentNumber) {
  return `${BASE_URL}/tp_${String(documentNumber).padStart(3, '0')}.html`;
}


// Function to scrape documents from a specific page
async function scrapeDocumentsFromPage(documentNumber) {
  try {
    const url = generateDocumentUrl(documentNumber);
    console.log(`Scraping documents from: ${url}`);
    
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);
    const documents = [];
    const breadcrumbText = $('#breadcrumb').text();
    const parlamentaryDocumentNumber = breadcrumbText.match(/TRAMITE PARLAMENTARIO N°\s*(\d+)/i)[1];

    $('p').each((i, p) => {
    const bold = $(p).find('b').first();
    const authorText = bold.text().trim();
    const author = authorText.includes(':') ? authorText.split(':')[0].trim() : authorText;

    const nextSpan = bold.closest('p').find('span').eq(1); // second span
    const linkElement = nextSpan.find('a').first();

    if (linkElement.length) {
      const href = linkElement.attr('href');
      const fullUrl = new URL(href, url).toString();
      const filename = linkElement.text().trim() || href.split('/').pop();
      const documentNumber = filename.split('-')[0];

      documents.push({
        name: filename,
        link_to_pdf: fullUrl,
        authors_names: author,
        parliamentary_number: parlamentaryDocumentNumber
      });
    }
    });

    return documents;
  } catch (error) {
    if (error.response && error.response.status === 404) {
      console.log(`Document page ${documentNumber} not found`);
      return [];
    }
    console.error(`Error scraping documents from page ${documentNumber}:`, error);
    throw error;
  }
}

// Function to scrape documents from multiple pages
async function scrapeDocuments(startNumber = 26, endNumber = 30) {
  try {
    const allDocuments = [];
    
    for (let i = startNumber; i <= endNumber; i++) {
      try {
        const documents = await scrapeDocumentsFromPage(i);
        allDocuments.push(...documents);
      } catch (error) {
        console.error(`Failed to scrape page ${i}:`, error);
        // Continue with next page even if one fails
        continue;
      }
    }

    return allDocuments;
  } catch (error) {
    console.error('Error in scrapeDocuments:', error);
    throw error;
  }
}

// API endpoint to get documents
app.get('/api/documents', async (req, res) => {
  try {
    const startNumber = parseInt(req.query.start) || 26;
    const endNumber = parseInt(req.query.end) || 30;

    // Check if cache is valid
    const now = Date.now();
    if (!documentCache.data || !documentCache.timestamp || 
        (now - documentCache.timestamp) > documentCache.CACHE_DURATION) {
      documentCache.data = await scrapeDocuments(startNumber, endNumber);
      documentCache.timestamp = now;
    }

    res.json(documentCache.data);
  } catch (error) {
    console.error('Error in /api/documents:', error);
    res.status(500).json({ error: 'Failed to fetch documents' });
  }
});

// Add a simple test endpoint
app.get('/api/test', (req, res) => {
  res.json({ message: 'Backend is working!' });
});

// Manual trigger endpoint for the scraper
app.get('/run-scraper', async (req, res) => {
  try {
    await documentScraper.run();
    res.json({ message: 'Scraper job started successfully' });
  } catch (error) {
    console.error('Error triggering scraper:', error);
    res.status(500).json({ error: 'Failed to start scraper job' });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Test endpoint available at: http://localhost:${PORT}/api/test`);
  console.log(`Documents endpoint available at: http://localhost:${PORT}/api/documents`);
});

// Start the scheduled job
documentScraper.startScheduledJob();

// Export the scrapeDocuments function for CLI usage
module.exports = {
  scrapeDocuments
}; 