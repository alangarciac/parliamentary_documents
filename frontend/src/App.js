import React, { useState, useEffect, useCallback } from 'react';
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
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [authors, setAuthors] = useState([]);
  const [tramitNumbers, setTramitNumbers] = useState([]);
  const [types, setTypes] = useState([]);
  const [comisions, setComisions] = useState([]);
  const [filters, setFilters] = useState({
    author: '',
    tramitNumber: '',
    type: '',
    comision: ''
  });

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        page: currentPage,
        ...(filters.author && { author: filters.author }),
        ...(filters.tramitNumber && { tramitNumber: filters.tramitNumber }),
        ...(filters.type && { type: filters.type }),
        ...(filters.comision && { comision: filters.comision })
      });

      const response = await fetch(`http://localhost:3001/api/documents?${queryParams}`);
      const data = await response.json();
      setDocuments(data.documents);
      setTotalPages(data.totalPages);
    } catch (error) {
      console.error('Error fetching documents:', error);
    } finally {
      setLoading(false);
    }
  }, [currentPage, filters]);

  const fetchAuthors = useCallback(async () => {
    try {
      const response = await fetch('http://localhost:3001/api/authors');
      const data = await response.json();
      setAuthors(data);
    } catch (error) {
      console.error('Error fetching authors:', error);
    }
  }, []);

  const fetchTramitNumbers = useCallback(async () => {
    try {
      const response = await fetch('http://localhost:3001/api/tramit-numbers');
      const data = await response.json();
      setTramitNumbers(data);
    } catch (error) {
      console.error('Error fetching tramit numbers:', error);
    }
  }, []);

  const fetchTypes = useCallback(async () => {
    try {
      const response = await fetch('http://localhost:3001/api/types');
      const data = await response.json();
      setTypes(data);
    } catch (error) {
      console.error('Error fetching types:', error);
    }
  }, []);

  const fetchComisions = useCallback(async () => {
    try {
      const response = await fetch('http://localhost:3001/api/comisions');
      const data = await response.json();
      setComisions(data);
    } catch (error) {
      console.error('Error fetching commissions:', error);
    }
  }, []);

  useEffect(() => {
    fetchData();
    fetchAuthors();
    fetchTramitNumbers();
    fetchTypes();
    fetchComisions();
  }, [fetchData, fetchAuthors, fetchTramitNumbers, fetchTypes, fetchComisions]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const renderPagination = () => {
    const pages = [];
    const maxPagesToShow = 5;

    let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

    if (endPage - startPage + 1 < maxPagesToShow) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }

    if (startPage > 1) {
      pages.push(
        <button key="1" onClick={() => handlePageChange(1)} className="pagination-button">
          1
        </button>
      );
      if (startPage > 2) {
        pages.push(<span key="start-ellipsis" className="pagination-ellipsis">...</span>);
      }
    }

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

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pages.push(<span key="end-ellipsis" className="pagination-ellipsis">...</span>);
      }
      pages.push(
        <button key={totalPages} onClick={() => handlePageChange(totalPages)} className="pagination-button">
          {totalPages}
        </button>
      );
    }

    return (
      <div className="pagination-container">
        <button
          className="pagination-button navigation"
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          Previous
        </button>
        <div className="pagination-numbers">{pages}</div>
        <button
          className="pagination-button navigation"
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          Next
        </button>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <p>Loading documents...</p>
      </div>
    );
  }

  return (
    <div className="App">
      <header className="App-header">
        <h1>Parlaments v1</h1>
      </header>
      <div className="filters">
        <div className="filter-group">
          <label className="filter-label">Search</label>
          <div className="search-box">
            <input
              type="text"
              placeholder="Search documents..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            />
          </div>
        </div>

        <div className="filter-group">
          <label className="filter-label">Author</label>
          <select
            className="author-select"
            value={filters.author}
            onChange={(e) => setFilters({ ...filters, author: e.target.value })}
          >
            <option value="">All Authors</option>
            {authors.map(author => (
              <option key={author.id} value={author.name}>
                {author.name}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label className="filter-label">Tramit Number</label>
          <select
            className="tramit-select"
            value={filters.tramitNumber}
            onChange={(e) => setFilters({ ...filters, tramitNumber: e.target.value })}
          >
            <option value="">All Tramit Numbers</option>
            {tramitNumbers.map(tramit => (
              <option key={tramit.number} value={tramit.number}>
                {tramit.number}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label className="filter-label">Type</label>
          <select
            className="type-select"
            value={filters.type}
            onChange={(e) => setFilters({ ...filters, type: e.target.value })}
          >
            <option value="">All Types</option>
            {types.map(type => (
              <option key={type.id} value={type.name}>
                {type.name}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label className="filter-label">Commission</label>
          <select
            className="comision-select"
            value={filters.comision}
            onChange={(e) => setFilters({ ...filters, comision: e.target.value })}
          >
            <option value="">All Commissions</option>
            {comisions.map(comision => (
              <option key={comision.id} value={comision.name}>
                {comision.name}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="table-container">
        <table className="documents-table">
          <thead>
            <tr>
              <th>Trámite Parlamentario</th>
              <th>Documento</th>
              <th>Autores</th>
              <th>Comisiones</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {documents.map((doc) => (
              <tr key={doc.id}>
                <td>Trámite {doc.parliamentaryTramit?.number}</td>
                <td>
                  <div className="document-info">
                    <div className="document-name">{doc.name}</div>
                    <div className="document-type">{doc.type?.name}</div>
                    <div className="document-description">{doc.description}</div>
                  </div>
                </td>
                <td>
                  {doc.authors?.map((author) => (
                    <button
                      key={author.id}
                      className="author-button"
                      onClick={() => setFilters(prev => ({ ...prev, author: author.name.replace(/:/g, '').trim() }))}
                    >
                      {author.name.replace(/:/g, '').trim()}
                    </button>
                  ))}
                </td>
                <td>
                  {doc.comisions?.map((comision) => (
                    <button
                      key={comision.id}
                      className="comision-button"
                      onClick={() => setFilters(prev => ({ ...prev, comision: comision.name }))}
                    >
                      {comision.name}
                    </button>
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
    </div>
  );
}

export default App; 