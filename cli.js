const { scrapeDocuments } = require('./server');

const args = process.argv.slice(2);
const startNumber = parseInt(args[0]) || 26;
const endNumber = parseInt(args[1]) || 30;

console.log(`Scraping documents from page ${startNumber} to ${endNumber}...`);

scrapeDocuments(startNumber, endNumber)
  .then(documents => {
    console.log(`Found ${documents.length} documents:`);
    documents.forEach(doc => {
      console.log(`- ${doc.filename} (Page ${doc.documentNumber})`);
    });
  })
  .catch(error => {
    console.error('Error:', error);
    process.exit(1);
  }); 