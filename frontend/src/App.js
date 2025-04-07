import React, { useState, useEffect } from 'react';
import './App.css';

// Backend API URL
const API_URL = 'http://localhost:3001';

// Utility function to process author names
const processAuthorNames = (authorString) => {
  if (!authorString || authorString === 'Unknown') return [];
  
  // Split by semicolon and trim each part
  const authors = authorString.split(';').map(author => author.trim());
  
  // Process each author to handle "Y" cases
  const processedAuthors = authors.flatMap(author => {
    // Check if the author string contains " Y " (with spaces)
    if (author.includes(' Y ')) {
      return author.split(' Y ').map(name => name.trim());
    }
    return [author];
  });
  
  return processedAuthors.filter(author => author.length > 0);
};

function App() {
  const [documents, setDocuments] = useState([]);
  const [authors, setAuthors] = useState([]);
  const [tramitNumbers, setTramitNumbers] = useState([]);
  const [selectedAuthor, setSelectedAuthor] = useState('');
  const [selectedTramit, setSelectedTramit] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchAuthors();
    fetchTramitNumbers();
    fetchDocuments();
  }, [currentPage, selectedAuthor, selectedTramit]);

  const fetchAuthors = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/authors');
      const data = await response.json();
      setAuthors(data);
    } catch (error) {
      console.error('Error fetching authors:', error);
    }
  };

  const fetchTramitNumbers = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/tramit-numbers');
      const data = await response.json();
      setTramitNumbers(data.map(item => item.number));
    } catch (error) {
      console.error('Error fetching tramit numbers:', error);
    }
  };

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const url = new URL('http://localhost:3001/api/documents');
      url.searchParams.append('page', currentPage);
      if (selectedAuthor) {
        url.searchParams.append('author', selectedAuthor);
      }
      if (selectedTramit) {
        url.searchParams.append('tramitNumber', selectedTramit);
      }

      const response = await fetch(url);
      const data = await response.json();
      setDocuments(data.documents);
      setTotalPages(data.totalPages);
    } catch (error) {
      console.error('Error fetching documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAuthorChange = (author) => {
    setSelectedAuthor(author);
    setCurrentPage(1);
  };

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleTramitChange = (value) => {
    setSelectedTramit(value);
    setCurrentPage(1);
  };

  const filteredDocuments = documents.filter(doc => 
    doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.authors.some(author => 
      author.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const renderPagination = () => {
    const pages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    // First page
    if (startPage > 1) {
      pages.push(
        <button
          key="first"
          onClick={() => handlePageChange(1)}
          className="pagination-button"
        >
          1
        </button>
      );
      if (startPage > 2) {
        pages.push(<span key="ellipsis1" className="pagination-ellipsis">...</span>);
      }
    }

    // Page numbers
    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`pagination-button ${currentPage === i ? 'active' : ''}`}
        >
          {i}
        </button>
      );
    }

    // Last page
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pages.push(<span key="ellipsis2" className="pagination-ellipsis">...</span>);
      }
      pages.push(
        <button
          key="last"
          onClick={() => handlePageChange(totalPages)}
          className="pagination-button"
        >
          {totalPages}
        </button>
      );
    }

    return (
      <div className="pagination-container">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="pagination-button navigation"
        >
          Anterior
        </button>
        <div className="pagination-numbers">
          {pages}
        </div>
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="pagination-button navigation"
        >
          Siguiente
        </button>
      </div>
    );
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Documentos Parlamentarios</h1>
      </header>

      <div className="filters">
      <label className="filter-label">Buscar por nombre o autor</label>
        <div className="search-box">
          <input
            type="text"
            placeholder="Buscar por nombre o autor..."
            value={searchTerm}
            onChange={handleSearch}
            className="search-input"
          />
        </div>

        <div className="author-filter">
          <label className="filter-label">Autor</label>
          <select
            value={selectedAuthor}
            onChange={(e) => handleAuthorChange(e.target.value)}
            className="author-select"
          >
            <option value="">Todos los autores</option>
            {authors.map(author => (
              <option key={author.id} value={author.name}>
                {author.name}
              </option>
            ))}
          </select>
        </div>

        <div className="tramit-filter">
          <label className="filter-label">Trámite Parlamentario</label>
          <select
            value={selectedTramit}
            onChange={(e) => handleTramitChange(e.target.value)}
            className="tramit-select"
          >
            <option value="">Todos los trámites</option>
            {tramitNumbers
              .sort((a, b) => parseInt(a) - parseInt(b))
              .map((number) => (
                <option key={number} value={number}>
                  Trámite {number}
                </option>
              ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="loading">
          <div className="spinner"></div>
          <p>Cargando documentos...</p>
        </div>
      ) : (
        <>
          <div className="table-container">
            <table className="documents-table">
              <thead>
                <tr>
                  <th>Trámite Parlamentario</th>
                  <th>Documento</th>
                  <th>Autores</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredDocuments.map((doc) => (
                  <tr key={doc.id}>
                    <td>{doc.parliamentaryTramit.number}</td>
                    <td>{doc.name}</td>
                    <td>
                      {doc.authors.map((author, index) => (
                        <span key={author.id}>
                          {index > 0 && ', '}
                          <button
                            className="author-button"
                            onClick={() => handleAuthorChange(author.name)}
                          >
                            {author.name}
                          </button>
                        </span>
                      ))}
                    </td>
                    <td>
                      <a
                        href={doc.link_to_pdf}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="pdf-link"
                      >
                        Ver PDF
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {renderPagination()}
        </>
      )}
    </div>
  );
}

export default App; 