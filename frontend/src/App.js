import React, { useState, useEffect } from 'react';
import './App.css';

// Backend API URL
const API_URL = 'http://localhost:3001';

function App() {
  const [documents, setDocuments] = useState([]);
  const [filteredDocuments, setFilteredDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('');
  const [startNumber, setStartNumber] = useState(26);
  const [endNumber, setEndNumber] = useState(30);

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // First, test if the backend is accessible
        const testResponse = await fetch(`${API_URL}/api/test`);
        if (!testResponse.ok) {
          throw new Error('Backend server is not responding');
        }

        console.log(`Fetching documents from ${API_URL}/api/documents?start=${startNumber}&end=${endNumber}`);
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
    if (filter === '') {
      setFilteredDocuments(documents);
    } else {
      const filtered = documents.filter(doc => 
        doc.author.toLowerCase().includes(filter.toLowerCase()) ||
        doc.filename.toLowerCase().includes(filter.toLowerCase()) ||
        doc.documentNumber.toString().includes(filter)
      );
      setFilteredDocuments(filtered);
    }
  }, [filter, documents]);

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
      <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tramite Parlamentario
          </label>
          <input
            type="number"
            value={startNumber}
            onChange={(e) => setStartNumber(parseInt(e.target.value) || 26)}
            className="px-4 py-2 border rounded-lg w-full"
            min="1"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            End Document Number
          </label>
          <input
            type="number"
            value={endNumber}
            onChange={(e) => setEndNumber(parseInt(e.target.value) || 30)}
            className="px-4 py-2 border rounded-lg w-full"
            min={startNumber}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Search
          </label>
          <input
            type="text"
            placeholder="Search by filename, author, or document number..."
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
                Número de Tramite Parlamentario
              </th>
              <th className="px-6 py-3 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nombre del Documento
              </th>
              <th className="px-6 py-3 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Autores
              </th>
              <th className="px-6 py-3 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredDocuments.map((doc, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="px-6 py-4 border-b">
                  {doc.documentNumber}
                </td>
                <td className="px-6 py-4 border-b">
                  {doc.filename}
                </td>
                <td className="px-6 py-4 border-b">
                  {doc.author}
                </td>
                <td className="px-6 py-4 border-b">
                  <a
                    href={doc.link}
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