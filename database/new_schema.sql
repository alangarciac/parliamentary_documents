-- Create the database
CREATE DATABASE IF NOT EXISTS parliamentary_documents;
USE parliamentary_documents;

-- Create role table
CREATE TABLE role (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL
);

-- Create user table
CREATE TABLE user (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(150) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    password VARCHAR(255) NOT NULL,
    role_id INT,
    FOREIGN KEY (role_id) REFERENCES role(id)
);

-- Create author table
CREATE TABLE author (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL
);

-- Create type table
CREATE TABLE type (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL
);

-- Create comision table
CREATE TABLE comision (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL
);

-- Create parliamentary_tramit table
CREATE TABLE parliamentary_tramit (
    id INT AUTO_INCREMENT PRIMARY KEY,
    number VARCHAR(50) NOT NULL,
    date DATE
);

-- Create document table
CREATE TABLE document (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    link_to_pdf TEXT,
    description TEXT,
    parliamentary_tramit_id INT NOT NULL,
    type_id INT,
    FOREIGN KEY (parliamentary_tramit_id) REFERENCES parliamentary_tramit(id),
    FOREIGN KEY (type_id) REFERENCES type(id)
);

-- Create many-to-many: document-author
CREATE TABLE document_author (
    document_id INT,
    author_id INT,
    PRIMARY KEY (document_id, author_id),
    FOREIGN KEY (document_id) REFERENCES document(id) ON DELETE CASCADE,
    FOREIGN KEY (author_id) REFERENCES author(id) ON DELETE CASCADE
);

-- Create many-to-many: document-comision
CREATE TABLE document_comision (
    document_id INT,
    comision_id INT,
    PRIMARY KEY (document_id, comision_id),
    FOREIGN KEY (document_id) REFERENCES document(id) ON DELETE CASCADE,
    FOREIGN KEY (comision_id) REFERENCES comision(id) ON DELETE CASCADE
);

-- Create many-to-many: user-comision
CREATE TABLE user_comision (
    user_id INT,
    comision_id INT,
    PRIMARY KEY (user_id, comision_id),
    FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE,
    FOREIGN KEY (comision_id) REFERENCES comision(id) ON DELETE CASCADE
);

-- Create many-to-many: user-author
CREATE TABLE user_author (
    user_id INT,
    author_id INT,
    PRIMARY KEY (user_id, author_id),
    FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE,
    FOREIGN KEY (author_id) REFERENCES author(id) ON DELETE CASCADE
);
