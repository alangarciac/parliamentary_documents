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

// Define Role model
const Role = sequelize.define('Role', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false
  }
}, {
  tableName: 'role',
  timestamps: false
});

// Define User model
const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  email: {
    type: DataTypes.STRING(150),
    allowNull: false,
    unique: true
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  password: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  role_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  }
}, {
  tableName: 'user',
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
    type: DataTypes.STRING(150),
    allowNull: false
  }
}, {
  tableName: 'author',
  timestamps: false
});

// Define Type model
const Type = sequelize.define('Type', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false
  }
}, {
  tableName: 'type',
  timestamps: false
});

// Define Comision model
const Comision = sequelize.define('Comision', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(150),
    allowNull: false
  }
}, {
  tableName: 'comision',
  timestamps: false
});

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
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: true
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
    type: DataTypes.STRING(150),
    allowNull: false
  },
  link_to_pdf: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  parliamentary_tramit_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  type_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  }
}, {
  tableName: 'document',
  timestamps: false
});

// Define junction models
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

const DocumentComision = sequelize.define('DocumentComision', {
  document_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    references: {
      model: Document,
      key: 'id'
    }
  },
  comision_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    references: {
      model: Comision,
      key: 'id'
    }
  }
}, {
  tableName: 'document_comision',
  timestamps: false
});

const UserComision = sequelize.define('UserComision', {
  user_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    references: {
      model: User,
      key: 'id'
    }
  },
  comision_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    references: {
      model: Comision,
      key: 'id'
    }
  }
}, {
  tableName: 'user_comision',
  timestamps: false
});

const UserAuthor = sequelize.define('UserAuthor', {
  user_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    references: {
      model: User,
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
  tableName: 'user_author',
  timestamps: false
});

// Define relationships
User.belongsTo(Role, { foreignKey: 'role_id' });
Role.hasMany(User, { foreignKey: 'role_id' });

Document.belongsTo(ParliamentaryTramit, { foreignKey: 'parliamentary_tramit_id', as: 'parliamentaryTramit' });
ParliamentaryTramit.hasMany(Document, { foreignKey: 'parliamentary_tramit_id', as: 'documents' });

Document.belongsTo(Type, { foreignKey: 'type_id', as: 'type' });
Type.hasMany(Document, { foreignKey: 'type_id', as: 'documents' });

// Many-to-many relationships
Document.belongsToMany(Author, { 
  through: DocumentAuthor, 
  as: 'authors',
  foreignKey: 'document_id',
  otherKey: 'author_id'
});
Author.belongsToMany(Document, { 
  through: DocumentAuthor, 
  as: 'documents',
  foreignKey: 'author_id',
  otherKey: 'document_id'
});

Document.belongsToMany(Comision, { 
  through: DocumentComision, 
  as: 'comisions',
  foreignKey: 'document_id',
  otherKey: 'comision_id'
});
Comision.belongsToMany(Document, { 
  through: DocumentComision, 
  as: 'documents',
  foreignKey: 'comision_id',
  otherKey: 'document_id'
});

User.belongsToMany(Comision, { through: UserComision });
Comision.belongsToMany(User, { through: UserComision });

User.belongsToMany(Author, { through: UserAuthor });
Author.belongsToMany(User, { through: UserAuthor });

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
  Role,
  User,
  Author,
  Type,
  Comision,
  ParliamentaryTramit,
  Document,
  DocumentAuthor,
  DocumentComision,
  UserComision,
  UserAuthor
}; 