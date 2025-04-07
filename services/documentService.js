const { Document, Author, ParliamentaryTramit } = require('../models');
const { Op } = require('sequelize');

class DocumentService {
  static async getDocuments(page = 1, limit = 10, authorFilter = null, tramitNumber = null) {
    const offset = (page - 1) * limit;
    
    const include = [
      {
        model: Author,
        as: 'authors',
        attributes: ['id', 'name'],
        through: { attributes: [] },
        ...(authorFilter ? { where: { name: authorFilter } } : {})
      },
      {
        model: ParliamentaryTramit,
        as: 'parliamentaryTramit',
        attributes: ['id', 'number'],
        ...(tramitNumber ? { where: { number: tramitNumber } } : {})
      }
    ];

    const { count, rows } = await Document.findAndCountAll({
      include,
      order: [['date', 'DESC']],
      limit,
      offset,
      distinct: true
    });

    return {
      documents: rows,
      total: count,
      totalPages: Math.ceil(count / limit),
      currentPage: page
    };
  }

  static async getAuthors() {
    return await Author.findAll({
      attributes: ['id', 'name'],
      order: [['name', 'ASC']]
    });
  }

  static async getTramitNumbers() {
    return await ParliamentaryTramit.findAll({
      attributes: ['number'],
      order: [['number', 'ASC']],
      limit: 100 // Get the 100 most recent tramit numbers
    });
  }
}

module.exports = DocumentService; 