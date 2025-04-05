const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const cors = require('cors');
const pdfParse = require('pdf-parse');
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

// Function to extract author from PDF text
async function extractAuthorFromPdf(pdfBuffer) {
  try {
    const data = await pdfParse(pdfBuffer);
    const text = data.text;
    
    // Split text into lines and find the first line containing a colon
    const lines = text.split('\n');
    for (const line of lines) {
      const colonIndex = line.indexOf(':');
      if (colonIndex > 0) {
        // Extract everything before the colon and trim whitespace
        const author = line.substring(0, colonIndex).trim();
        if (author) {
          return author;
        }
      }
    }
    
    return 'Unknown';
  } catch (error) {
    console.error('Error extracting author from PDF:', error);
    return 'Unknown';
  }
}

// Function to scrape documents from a specific page
async function scrapeDocumentsFromPage(documentNumber) {
  try {
    const url = generateDocumentUrl(documentNumber);
    console.log(`Scraping documents from: ${url}`);
    
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);
    const documents = [];

    // Find all document entries
    $('b').each((i, element) => {
      const text = $(element).text().trim();
      if (text.includes(':')) {
        const author = text.split(':')[0].trim();
        
        // Find the PDF link associated with this entry
        const nextLink = $(element).next('a');
        if (nextLink.length) {
          const href = nextLink.attr('href');
          if (href && href.match(/\.pdf$/i)) {
            const fullUrl = new URL(href, url).toString();
            documents.push({
              filename: nextLink.text().trim() || href.split('/').pop(),
              link: fullUrl,
              author: author,
              documentNumber: documentNumber
            });
          }
        }
      }
    });

    // If no documents found with the first method, try alternative method
    if (documents.length === 0) {
      $('a').each((i, element) => {
        const href = $(element).attr('href');
        if (href && href.match(/\.pdf$/i)) {
          const fullUrl = new URL(href, url).toString();
          const filename = $(element).text().trim() || href.split('/').pop();
          
          // Try to find the author in the previous elements
          let author = 'Unknown';
          let prevElement = $(element).prev();
          while (prevElement.length) {
            const prevText = prevElement.text().trim();
            if (prevText.includes(':')) {
              author = prevText.split(':')[0].trim();
              break;
            }
            prevElement = prevElement.prev();
          }
          
          documents.push({
            filename: filename,
            link: fullUrl,
            author: author,
            documentNumber: documentNumber
          });
        }
      });
    }

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

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Test endpoint available at: http://localhost:${PORT}/api/test`);
  console.log(`Documents endpoint available at: http://localhost:${PORT}/api/documents`);
});

// Export the scrapeDocuments function for CLI usage
module.exports = {
  scrapeDocuments
}; 