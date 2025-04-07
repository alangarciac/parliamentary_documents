const axios = require('axios');
const cheerio = require('cheerio');
const { parseAuthorNames } = require('./authorParser');

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
      const authors = parseAuthorNames(authorText);

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
          authors: authors,
          parliamentary_tramit_id: parseInt(parlamentaryDocumentNumber)
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

module.exports = {
  scrapeDocumentsFromPage
}; 