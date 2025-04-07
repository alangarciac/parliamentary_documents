const { Sequelize, DataTypes } = require('sequelize');
require('dotenv').config();

// Initialize Sequelize with database credentials
const sequelize = new Sequelize(
  process.env.DB_NAME || 'parliamentary_documents',
  process.env.DB_USER || 'root',
  process.env.DB_PASSWORD || '',
  {
    host: process.env.DB_HOST || 'localhost',
    dialect: 'mysql',
    logging: false
  }
);

// Define ParliamentaryTramit model
const ParliamentaryTramit = sequelize.define('ParliamentaryTramit', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  number: {
    type: DataTypes.STRING(50),
    allowNull: false
  }
}, {
  tableName: 'parliamentary_tramit',
  timestamps: false
});

// Define Document model
const Document = sequelize.define('Document', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  link_to_pdf: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: true
  }
}, {
  tableName: 'document',
  timestamps: false
});

// Define Author model
const Author = sequelize.define('Author', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(255),
    allowNull: false
  }
}, {
  tableName: 'author',
  timestamps: false
});

// Define Subscriber model
const Subscriber = sequelize.define('Subscriber', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true
  }
}, {
  tableName: 'subscriber',
  timestamps: false
});

// Define DocumentAuthor junction model
const DocumentAuthor = sequelize.define('DocumentAuthor', {
  document_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    references: {
      model: Document,
      key: 'id'
    }
  },
  author_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    references: {
      model: Author,
      key: 'id'
    }
  }
}, {
  tableName: 'document_author',
  timestamps: false
});

// Define SubscriberAuthor junction model
const SubscriberAuthor = sequelize.define('SubscriberAuthor', {
  subscriber_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    references: {
      model: Subscriber,
      key: 'id'
    }
  },
  author_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    references: {
      model: Author,
      key: 'id'
    }
  }
}, {
  tableName: 'subscriber_author',
  timestamps: false
});

// Define relationships
Document.belongsTo(ParliamentaryTramit, {
  foreignKey: 'parliamentary_tramit_id',
  as: 'parliamentaryTramit'
});

ParliamentaryTramit.hasMany(Document, {
  foreignKey: 'parliamentary_tramit_id',
  as: 'documents'
});

// Many-to-many relationship between Document and Author
Document.belongsToMany(Author, {
  through: DocumentAuthor,
  foreignKey: 'document_id',
  otherKey: 'author_id',
  as: 'authors'
});

Author.belongsToMany(Document, {
  through: DocumentAuthor,
  foreignKey: 'author_id',
  otherKey: 'document_id',
  as: 'documents'
});

// Many-to-many relationship between Subscriber and Author
Subscriber.belongsToMany(Author, {
  through: SubscriberAuthor,
  foreignKey: 'subscriber_id',
  otherKey: 'author_id',
  as: 'authors'
});

Author.belongsToMany(Subscriber, {
  through: SubscriberAuthor,
  foreignKey: 'author_id',
  otherKey: 'subscriber_id',
  as: 'subscribers'
});

// Test the database connection
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connection has been established successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
};

testConnection();

module.exports = {
  sequelize,
  ParliamentaryTramit,
  Document,
  Author,
  Subscriber,
  DocumentAuthor,
  SubscriberAuthor
}; 