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
      // Extract authors from first span
      const authorSpan = $(p).find('b span').first();
      const authorText = authorSpan.text().trim();
      // Clean author names by removing colons and extra spaces
      const cleanAuthorText = authorText.replace(/:/g, '').trim();
      // Split by semicolons and handle "Y" separators
      const authors = cleanAuthorText.split(';').flatMap(part => {
        return part.split(' Y ').map(name => name.trim());
      }).filter(name => name);

      // Get the second span containing document details
      const docSpan = $(p).find('span').eq(1);
      const docText = docSpan.text().trim();
      const linkElement = docSpan.find('a').first();

      if (linkElement.length) {
        // Extract document name from link text
        const documentName = linkElement.text().trim();

        // Extract PDF link
        const href = linkElement.attr('href');
        const fullUrl = new URL(href, url).toString();

        // Extract type (text before first period)
        const typeMatch = docText.match(/^([^.]+)\./);
        const documentType = typeMatch ? typeMatch[1].trim() : '';

        // Extract description (text between type and link)
        const descriptionMatch = docText.match(/\.\s*([^(]+)\(/);
        const documentDescription = descriptionMatch ? descriptionMatch[1].trim() : '';

        // Extract commissions from bold tags after the link
        const comisions = [];
        docSpan.find('b').each((i, b) => {
          const comisionText = $(b).text().trim();
          if (comisionText) {
            comisions.push(comisionText);
          }
        });

        documents.push({
          name: documentName,
          link_to_pdf: fullUrl,
          type: documentType,
          description: documentDescription,
          authors: authors,
          comisions: comisions,
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