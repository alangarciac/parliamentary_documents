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
  const [filteredDocuments, setFilteredDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('');
  const [startNumber, setStartNumber] = useState(26);
  const [endNumber, setEndNumber] = useState(30);
  const [selectedAuthor, setSelectedAuthor] = useState(null);

  // Get unique authors from documents
  const uniqueAuthors = [...new Set(
    documents.flatMap(doc => processAuthorNames(doc.authors_names))
  )].filter(author => author !== 'Unknown');

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const testResponse = await fetch(`${API_URL}/api/test`);
        if (!testResponse.ok) {
          throw new Error('Backend server is not responding');
        }

        const response = await fetch(
          `${API_URL}/api/documents?start=${startNumber}&end=${endNumber}`,
          {
            method: 'GET',
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json',
            },
            mode: 'cors'
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        if (!Array.isArray(data)) {
          throw new Error('Invalid response format from server');
        }

        setDocuments(data);
        setFilteredDocuments(data);
        setSelectedAuthor(null);
      } catch (err) {
        console.error('Error fetching documents:', err);
        setError(`Failed to fetch documents: ${err.message}. Please make sure the backend server is running at ${API_URL}`);
      } finally {
        setLoading(false);
      }
    };

    fetchDocuments();
  }, [startNumber, endNumber]);

  useEffect(() => {
    let filtered = documents;
    
    // Apply text search filter first
    if (filter !== '') {
      filtered = filtered.filter(doc => 
        doc.name.toLowerCase().includes(filter.toLowerCase()) ||
        doc.authors_names.toLowerCase().includes(filter.toLowerCase()) ||
        doc.parliamentary_number.toString().includes(filter)
      );
    }
    
    // Apply author filter only if an author is selected
    if (selectedAuthor) {
      filtered = filtered.filter(doc => 
        processAuthorNames(doc.authors_names).includes(selectedAuthor)
      );
    }
    
    setFilteredDocuments(filtered);
  }, [filter, documents, selectedAuthor]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-500 text-xl p-4 bg-red-100 rounded-lg">
          {error}
          <div className="mt-4 text-sm">
            Make sure the backend server is running at {API_URL}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Documentos Parlamentarios</h1>
      <p className="text-sm mb-8">Listado de Documentos Parlamentarios del congreso Argentino</p>
      
      {/* Author Filter Dropdown */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Filtrar por Autor
        </label>
        <div className="relative">
          <select
            value={selectedAuthor || ''}
            onChange={(e) => setSelectedAuthor(e.target.value || null)}
            className="appearance-none px-4 py-2 border rounded-lg w-full bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todos los autores</option>
            {uniqueAuthors.map((author) => (
              <option key={author} value={author}>
                {author}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
              <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
            </svg>
          </div>
        </div>
      </div>

      <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tramite Parlamentario
          </label>
          <select
            value={startNumber}
            onChange={(e) => {
              const newStart = parseInt(e.target.value);
              setStartNumber(newStart);
              // Ensure end number is not less than start number
              if (endNumber < newStart) {
                setEndNumber(newStart);
              }
            }}
            className="px-4 py-2 border rounded-lg w-full"
          >
            {Array.from({length: 50}, (_, i) => i + 1).map((num) => (
              <option key={num} value={num}>
                {num}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            End Document Number
          </label>
          <select
            value={endNumber}
            onChange={(e) => {
              const newEnd = parseInt(e.target.value);
              // Only allow setting end number if it's greater than or equal to start number
              if (newEnd >= startNumber) {
                setEndNumber(newEnd);
              }
            }}
            className="px-4 py-2 border rounded-lg w-full"
          >
            {Array.from({length: 50 - startNumber + 1}, (_, i) => startNumber + i).map((num) => (
              <option key={num} value={num}>
                {num}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Search
          </label>
          <input
            type="text"
            placeholder="Search by name, author, or parliamentary number..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-4 py-2 border rounded-lg w-full"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200">
          <thead>
            <tr className="bg-gray-100">
              <th className="px-6 py-3 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                N° Tramite Parlamentario
              </th>
              <th className="px-6 py-3 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Documento
              </th>
              <th className="px-6 py-3 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Autores
              </th>
              <th className="px-6 py-3 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredDocuments.map((doc, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="px-6 py-4 border-b">
                  {doc.parliamentary_number}
                </td>
                <td className="px-6 py-4 border-b">
                  {doc.name}
                </td>
                <td className="px-6 py-4 border-b">
                  <div className="flex flex-wrap gap-2">
                    {processAuthorNames(doc.authors_names).map((author, authorIndex) => (
                      <button
                        key={authorIndex}
                        onClick={() => setSelectedAuthor(author)}
                        className={`px-3 py-1 rounded-full text-sm font-medium transition-colors
                          ${selectedAuthor === author 
                            ? 'bg-blue-600 text-white' 
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                      >
                        {author}
                      </button>
                    ))}
                  </div>
                </td>
                <td className="px-6 py-4 border-b">
                  <a
                    href={doc.link_to_pdf}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:text-blue-700"
                  >
                    Ver PDF
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default App; 