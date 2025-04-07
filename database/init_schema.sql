-- Create database
CREATE DATABASE IF NOT EXISTS parliamentary_documents;
USE parliamentary_documents;

-- Table: parliamentary_tramit
CREATE TABLE parliamentary_tramit (
    id INT AUTO_INCREMENT PRIMARY KEY,
    number VARCHAR(50) NOT NULL
);

-- Table: document
CREATE TABLE document (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    link_to_pdf TEXT NOT NULL,
    description TEXT,
    date DATE,
    parliamentary_tramit_id INT NOT NULL,
    FOREIGN KEY (parliamentary_tramit_id) REFERENCES parliamentary_tramit(id)
        ON DELETE CASCADE
);

-- Table: author
CREATE TABLE author (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL
);

-- Join table: document_author (many-to-many)
CREATE TABLE document_author (
    document_id INT NOT NULL,
    author_id INT NOT NULL,
    PRIMARY KEY (document_id, author_id),
    FOREIGN KEY (document_id) REFERENCES document(id) ON DELETE CASCADE,
    FOREIGN KEY (author_id) REFERENCES author(id) ON DELETE CASCADE
);

-- Table: subscriber
CREATE TABLE subscriber (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE
);

-- Join table: subscriber_author (many-to-many)
CREATE TABLE subscriber_author (
    subscriber_id INT NOT NULL,
    author_id INT NOT NULL,
    PRIMARY KEY (subscriber_id, author_id),
    FOREIGN KEY (subscriber_id) REFERENCES subscriber(id) ON DELETE CASCADE,
    FOREIGN KEY (author_id) REFERENCES author(id) ON DELETE CASCADE
);
