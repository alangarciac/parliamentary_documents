const { Document, Author, ParliamentaryTramit, Type, Comision } = require('../models');
const { Op } = require('sequelize');

class DocumentService {
  static async getDocuments(page = 1, limit = 10, filters = {}) {
    try {
      console.log('Getting documents with filters:', filters);
      const offset = (page - 1) * limit;
      const whereClause = {};

      // Add search filter if provided
      if (filters.search) {
        whereClause[Op.or] = [
          { name: { [Op.like]: `%${filters.search}%` } },
          { description: { [Op.like]: `%${filters.search}%` } }
        ];
      }

      // Add tramit number filter if provided
      if (filters.tramitNumber) {
        whereClause['$parliamentaryTramit.number$'] = filters.tramitNumber;
      }

      console.log('Where clause:', whereClause);

      const { count, rows } = await Document.findAndCountAll({
        where: whereClause,
        include: [
          {
            model: Author,
            as: 'authors',
            attributes: ['id', 'name'],
            through: { attributes: [] },
            where: filters.author ? {
              name: {
                [Op.like]: `%${filters.author}%`
              }
            } : undefined,
            required: !!filters.author
          },
          {
            model: Comision,
            as: 'comisions',
            attributes: ['id', 'name'],
            through: { attributes: [] },
            where: filters.comision ? {
              name: filters.comision
            } : undefined,
            required: !!filters.comision
          },
          {
            model: Type,
            as: 'type',
            attributes: ['id', 'name'],
            where: filters.type ? {
              name: filters.type
            } : undefined,
            required: !!filters.type
          },
          {
            model: ParliamentaryTramit,
            as: 'parliamentaryTramit',
            attributes: ['id', 'number']
          }
        ],
        order: [['id', 'DESC']],
        limit,
        offset,
        distinct: true
      });

      console.log(`Found ${count} documents`);

      return {
        documents: rows,
        totalPages: Math.ceil(count / limit)
      };
    } catch (error) {
      console.error('Error in getDocuments:', error);
      console.error('Error details:', {
        message: error.message,
        name: error.name,
        stack: error.stack
      });
      throw error;
    }
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