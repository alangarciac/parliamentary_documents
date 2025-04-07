const cron = require('node-cron');
const { Document, Author, ParliamentaryTramit, DocumentAuthor } = require('../models');
const { scrapeDocumentsFromPage } = require('../utils/scraper');

class DocumentScraper {
  constructor() {
    this.isRunning = false;
    this.defaultStartPage = 1;
    this.defaultEndPage = 5;
  }

  validatePageRange(startPage, endPage) {
    if (typeof startPage !== 'number' || typeof endPage !== 'number') {
      throw new Error('startPage and endPage must be numbers');
    }
    if (startPage < 1) {
      throw new Error('startPage must be greater than 0');
    }
    if (endPage < startPage) {
      throw new Error('endPage must be greater than or equal to startPage');
    }
    return true;
  }

  async processDocument(documentData) {
    try {
      // Check if document already exists by link_to_pdf
      const existingDocument = await Document.findOne({
        where: { link_to_pdf: documentData.link_to_pdf }
      });

      // Find or create parliamentary tramit
      const [parliamentaryTramit] = await ParliamentaryTramit.findOrCreate({
        where: { number: documentData.parliamentary_tramit_id.toString() },
        defaults: { number: documentData.parliamentary_tramit_id.toString() }
      });

      if (existingDocument) {
        // Update existing document
        await existingDocument.update({
          name: documentData.name,
          description: documentData.description,
          date: documentData.date,
          parliamentary_tramit_id: parliamentaryTramit.id
        });

        // Update authors
        await this.updateDocumentAuthors(existingDocument, documentData.authors);
        return existingDocument;
      }

      // Create new document
      const document = await Document.create({
        name: documentData.name,
        link_to_pdf: documentData.link_to_pdf,
        description: documentData.description,
        date: documentData.date,
        parliamentary_tramit_id: parliamentaryTramit.id
      });

      // Process authors
      await this.updateDocumentAuthors(document, documentData.authors);

      return document;
    } catch (error) {
      console.error('Error processing document:', error);
      throw error;
    }
  }

  async updateDocumentAuthors(document, authors) {
    try {
      // Remove existing author associations
      await DocumentAuthor.destroy({
        where: { document_id: document.id }
      });

      // Create new author associations
      for (const authorName of authors) {
        const [author] = await Author.findOrCreate({
          where: { name: authorName },
          defaults: { name: authorName }
        });

        await DocumentAuthor.create({
          document_id: document.id,
          author_id: author.id
        });
      }
    } catch (error) {
      console.error('Error updating document authors:', error);
      throw error;
    }
  }

  async run(startPage = null, endPage = null) {
    if (this.isRunning) {
      console.log('Scraper is already running');
      return;
    }

    this.isRunning = true;
    console.log('Starting document scraper job');

    try {
      // Use provided range or defaults
      const start = startPage !== null ? parseInt(startPage) : this.defaultStartPage;
      const end = endPage !== null ? parseInt(endPage) : this.defaultEndPage;

      // Validate page range
      this.validatePageRange(start, end);

      console.log(`Processing pages from ${start} to ${end}`);

      for (let page = start; page <= end; page++) {
        console.log(`Processing page ${page}`);
        const documents = await scrapeDocumentsFromPage(page);

        for (const documentData of documents) {
          try {
            await this.processDocument(documentData);
            console.log(`Processed document: ${documentData.name}`);
          } catch (error) {
            console.error(`Error processing document from page ${page}:`, error);
            // Continue with next document even if one fails
            continue;
          }
        }
      }

      console.log('Document scraper job completed successfully');
    } catch (error) {
      console.error('Error in document scraper job:', error);
      throw error;
    } finally {
      this.isRunning = false;
    }
  }

  startScheduledJob() {
    // Run every 5 hours with default range
    cron.schedule('0 */5 * * *', () => {
      console.log('Running scheduled document scraper job');
      this.run();
    });
  }
}

module.exports = new DocumentScraper(); 