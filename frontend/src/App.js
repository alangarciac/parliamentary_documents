import React, { useState, useEffect, useCallback } from 'react';
import './App.css';
import Login from './Login';

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
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
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
    comision: '',
    search: ''
  });
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      verifyToken(token);
    } else {
      setLoading(false);
    }
  }, []);

  const verifyToken = async (token) => {
    try {
      if (!token) {
        throw new Error('No token provided');
      }

      const formattedToken = token.startsWith('Bearer ') ? token : `Bearer ${token}`;

      const response = await fetch(`${API_URL}/api/verify-token`, {
        headers: {
          'Authorization': formattedToken
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.user) {
          setUser(data.user);
          setIsAuthenticated(true);
        } else {
          throw new Error('Invalid user data');
        }
      } else {
        throw new Error('Token verification failed');
      }
    } catch (error) {
      console.error('Error verifying token:', error);
      localStorage.removeItem('token');
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (userData) => {
    if (userData && userData.token) {
      // Ensure the token is properly formatted
      const token = userData.token.startsWith('Bearer ') ? userData.token : `Bearer ${userData.token}`;
      localStorage.setItem('token', token);
      // Store user data without the token
      const { token: _, ...userWithoutToken } = userData;
      setUser(userWithoutToken);
      setIsAuthenticated(true);
      setError(''); // Clear any previous errors
    } else {
      localStorage.removeItem('token');
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setIsAuthenticated(false);
    setDocuments([]);
    setAuthors([]);
    setTramitNumbers([]);
    setTypes([]);
    setComisions([]);
    setError('');
  };

  const getFormattedToken = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('No token found in localStorage');
      return null;
    }
    return token.startsWith('Bearer ') ? token : `Bearer ${token}`;
  };

  const fetchAuthors = useCallback(async () => {
    try {
      const token = getFormattedToken();
      if (!token) throw new Error('No token available');

      const response = await fetch(`${API_URL}/api/authors`, {
        headers: {
          'Authorization': token
        }
      });
      if (!response.ok) throw new Error('Failed to fetch authors');
      const data = await response.json();
      setAuthors(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching authors:', error);
      setAuthors([]);
    }
  }, []);

  const fetchTramitNumbers = useCallback(async () => {
    try {
      const token = getFormattedToken();
      if (!token) throw new Error('No token available');

      const response = await fetch(`${API_URL}/api/tramit-numbers`, {
        headers: {
          'Authorization': token
        }
      });
      if (!response.ok) throw new Error('Failed to fetch tramit numbers');
      const data = await response.json();
      setTramitNumbers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching tramit numbers:', error);
      setTramitNumbers([]);
    }
  }, []);

  const fetchTypes = useCallback(async () => {
    try {
      const token = getFormattedToken();
      if (!token) throw new Error('No token available');

      const response = await fetch(`${API_URL}/api/types`, {
        headers: {
          'Authorization': token
        }
      });
      if (!response.ok) throw new Error('Failed to fetch types');
      const data = await response.json();
      setTypes(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching types:', error);
      setTypes([]);
    }
  }, []);

  const fetchComisions = useCallback(async () => {
    try {
      const token = getFormattedToken();
      if (!token) throw new Error('No token available');

      const response = await fetch(`${API_URL}/api/comisions`, {
        headers: {
          'Authorization': token
        }
      });
      if (!response.ok) throw new Error('Failed to fetch comisions');
      const data = await response.json();
      setComisions(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching comisions:', error);
      setComisions([]);
    }
  }, []);

  const fetchData = useCallback(async () => {
    if (!isAuthenticated) {
      console.log('Not authenticated, skipping data fetch');
      return;
    }

    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        page: currentPage,
        limit: 10,
        ...(filters.author && { author: filters.author }),
        ...(filters.tramitNumber && { tramitNumber: filters.tramitNumber }),
        ...(filters.type && { type: filters.type }),
        ...(filters.comision && { comision: filters.comision }),
        ...(filters.search && { search: filters.search })
      });

      const token = getFormattedToken();
      if (!token) {
        throw new Error('Authentication required');
      }

      console.log('Fetching documents with filters:', Object.fromEntries(queryParams));
      console.log('Using token:', token.substring(0, 20) + '...'); // Log first 20 chars of token

      const response = await fetch(`${API_URL}/api/documents?${queryParams}`, {
        headers: {
          'Authorization': token
        }
      });
      
      console.log('Response status:', response.status);
      
      if (response.status === 401) {
        // Token expired or invalid
        localStorage.removeItem('token');
        setIsAuthenticated(false);
        setUser(null);
        throw new Error('Session expired. Please log in again.');
      }
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Error response:', errorData);
        throw new Error(errorData.message || `Failed to fetch documents: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('Documents data:', data);
      
      if (!data || !Array.isArray(data.documents)) {
        throw new Error('Invalid response format from server');
      }
      
      setDocuments(data.documents);
      setTotalPages(data.totalPages || 1);
    } catch (error) {
      console.error('Error fetching documents:', error);
      if (error.message === 'Session expired. Please log in again.') {
        setError(error.message);
      } else {
        setError(`Error loading documents: ${error.message}`);
      }
      setDocuments([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  }, [currentPage, filters, isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchData();
      fetchAuthors();
      fetchTramitNumbers();
      fetchTypes();
      fetchComisions();
    }
  }, [currentPage, filters, isAuthenticated, fetchData, fetchAuthors, fetchTramitNumbers, fetchTypes, fetchComisions]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
    setCurrentPage(1);
  };

  const handleFilterButtonClick = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Add a function to process author names for display
  const formatAuthorName = (name) => {
    if (!name) return '';
    // Remove any colons and trim whitespace
    return name.replace(/:/g, '').trim();
  };

  // Add a function to check if an author matches the filter
  const isAuthorMatch = (authorName, filterValue) => {
    if (!filterValue) return true;
    const formattedAuthor = formatAuthorName(authorName);
    return formattedAuthor.toLowerCase().includes(filterValue.toLowerCase());
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
        <p>Loading...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="App">
      {loading ? (
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading...</p>
        </div>
      ) : !isAuthenticated ? (
        <Login onLogin={handleLogin} />
      ) : (
        <div className="app-container">
          <header className="app-header">
            <div className="header-content">
              <div className="header-title">
                <img src="https://images.icon-icons.com/3179/PNG/512/file_archive_icon_193973.png" alt="Archive Icon" className="archive-icon" />
                <h1>Parli Documents</h1>
              </div>
              <div className="user-info">
                <span>Welcome, {user?.name || 'User'}</span>
                <button onClick={handleLogout} className="logout-button">
                  Logout
                </button>
              </div>
            </div>
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
                onChange={handleFilterChange}
                name="author"
              >
                <option value="">All Authors</option>
                {Array.isArray(authors) && authors.map(author => (
                  <option key={author.id} value={formatAuthorName(author.name)}>
                    {formatAuthorName(author.name)}
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
                {Array.isArray(types) && types.map(type => (
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
                {Array.isArray(comisions) && comisions.map(comision => (
                  <option key={comision.id} value={comision.name}>
                    {comision.name}
                  </option>
                ))}
              </select>
            </div>

            <button 
              className="clear-filters-button"
              onClick={() => setFilters({
                author: '',
                type: '',
                comision: '',
                search: ''
              })}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
              Clear Filters
            </button>
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
                {Array.isArray(documents) && documents.map((doc) => (
                  <tr key={doc.id}>
                    <td>Trámite {doc.parliamentaryTramit?.number || 'N/A'}</td>
                    <td>
                      <div className="document-info">
                        <h3>{doc.name}</h3>
                        <div className="document-type">
                          <span className="type-label">Tipo:</span>
                          <span className="type-value">{doc.type?.name || 'No especificado'}</span>
                        </div>
                        <p className="document-description">{doc.description || 'No disponible'}</p>
                      </div>
                    </td>
                    <td>
                      {Array.isArray(doc.authors) && doc.authors.map((author) => (
                        <button
                          key={author.id}
                          className={`author-button ${isAuthorMatch(author.name, filters.author) ? 'highlighted' : ''}`}
                          onClick={() => handleFilterButtonClick('author', formatAuthorName(author.name))}
                        >
                          {formatAuthorName(author.name)}
                        </button>
                      ))}
                    </td>
                    <td>
                      {Array.isArray(doc.comisions) && doc.comisions.map((comision) => (
                        <button
                          key={comision.id}
                          className={`comision-button ${comision.name === filters.comision ? 'highlighted' : ''}`}
                          onClick={() => handleFilterButtonClick('comision', comision.name)}
                        >
                          {comision.name}
                        </button>
                      ))}
                    </td>
                    <td>
                      {doc.link_to_pdf && (
                        <a
                          href={doc.link_to_pdf}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="pdf-link"
                        >
                          Ver PDF
                        </a>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {renderPagination()}
        </div>
      )}
    </div>
  );
}

export default App; 