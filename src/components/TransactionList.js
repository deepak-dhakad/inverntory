import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const TransactionList = () => {
  const [nominees, setNominees] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  // Fetch nominees on component load
  useEffect(() => {
    fetchNominees();
  }, []);

  const fetchNominees = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/nominees`);
      setNominees(response.data);
    } catch (error) {
      console.error('Error fetching nominees:', error);
    }
  };

  // Filter nominees based on search query and type 'Material'
  const filteredNominees = nominees
    .filter(nominee => nominee.type === 'Material')
    .filter(nominee => nominee.name.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-3xl font-bold text-center mb-6">Nominee List</h2>

      <input
        type="text"
        placeholder="Search Nominee"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="w-full border border-gray-300 p-2 rounded-md mb-4 focus:ring focus:ring-blue-300"
      />

      <ul className="space-y-4">
        {filteredNominees.map((nominee) => (
          <li key={nominee._id} className="p-4 border rounded-md flex justify-between items-center bg-gray-50">
            <div>
              <span className="text-lg font-medium">{nominee.name}</span>
              
            </div>
            <button
              onClick={() => navigate(`/nominee-transactions/${nominee._id}`)}
              className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-1 px-4 rounded-md"
            >
              View
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TransactionList;
