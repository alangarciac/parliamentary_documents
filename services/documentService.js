const { Document, Author, ParliamentaryTramit } = require('../models');

class DocumentService {
  static async getDocuments(page = 1, limit = 10, authorFilter = null) {
    const offset = (page - 1) * limit;
    
    const whereClause = authorFilter ? {
      '$authors.name$': authorFilter
    } : {};

    const { count, rows } = await Document.findAndCountAll({
      include: [
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
          attributes: ['id', 'number']
        }
      ],
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
}

module.exports = DocumentService; 