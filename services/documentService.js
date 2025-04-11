const { Document, Author, ParliamentaryTramit, Type, Comision } = require('../models');
const { Op } = require('sequelize');

class DocumentService {
  static async getDocuments(page = 1, limit = 10, filters = {}) {
    const offset = (page - 1) * limit;
    
    const include = [
      {
        model: Author,
        as: 'authors',
        attributes: ['id', 'name'],
        through: { attributes: [] },
        ...(filters.author ? { where: { name: filters.author } } : {})
      },
      {
        model: ParliamentaryTramit,
        as: 'parliamentaryTramit',
        attributes: ['id', 'number'],
        ...(filters.tramitNumber ? { where: { number: filters.tramitNumber } } : {})
      },
      {
        model: Type,
        as: 'type',
        attributes: ['id', 'name'],
        ...(filters.type ? { where: { name: filters.type } } : {})
      },
      {
        model: Comision,
        as: 'comisions',
        attributes: ['id', 'name'],
        through: { attributes: [] },
        ...(filters.comision ? { where: { name: filters.comision } } : {})
      }
    ];

    const { count, rows } = await Document.findAndCountAll({
      include,
      order: [['id', 'DESC']],
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
      limit: 100
    });
  }

  static async getTypes() {
    return await Type.findAll({
      attributes: ['id', 'name'],
      order: [['name', 'ASC']]
    });
  }

  static async getComisions() {
    return await Comision.findAll({
      attributes: ['id', 'name'],
      order: [['name', 'ASC']]
    });
  }
}

module.exports = DocumentService; 