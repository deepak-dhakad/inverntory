import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Home = () => {
  const navigate = useNavigate();

  const [transactions, setTransactions] = useState([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const transactionsPerPage = 12; // Set number of transactions per page

  useEffect(() => {
    fetchTransactions();
  }, []);

  useEffect(() => {
    if (startDate || endDate) {
      fetchFilteredTransactions();
    } else {
      fetchTransactions();
    }
  }, [startDate, endDate]);

  const fetchTransactions = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/transactions/all`);
      const materialTransactions = response.data
        .filter((transaction) => transaction.type === 'Material')
        .map((transaction) => ({ ...transaction, likeCount: 0 })); // Add likeCount property
      setTransactions(materialTransactions);
      setCurrentPage(1); // Reset to the first page on data fetch
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  };

  const fetchFilteredTransactions = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/transactions/all`, {
        params: { startDate, endDate },
      });
      const materialTransactions = response.data
        .filter((transaction) => transaction.type === 'Material')
        .map((transaction) => ({ ...transaction, likeCount: 0 }));
      setTransactions(materialTransactions);
      setCurrentPage(1); // Reset to the first page on data fetch
    } catch (error) {
      console.error('Error fetching filtered transactions:', error);
    }
  };

  const handleDeleteTransaction = async (transactionId) => {
    const confirmed = window.confirm("Are you sure you want to delete this transaction?");
    if (!confirmed) return;

    try {
      await axios.delete(`${process.env.REACT_APP_BACKEND_URL}/transactions/${transactionId}`, {
        params: { type: 'Material' },
      });
      fetchTransactions();
    } catch (error) {
      console.error('Error deleting transaction:', error);
    }
  };

  const handleLikeTransaction = (transactionId) => {
    setTransactions((prevTransactions) =>
      prevTransactions.map((transaction) =>
        transaction._id === transactionId
          ? { ...transaction, likeCount: transaction.likeCount + 1 }
          : transaction
      )
    );
  };

  const getTransTypeClassName = (transType) => {
    switch (transType) {
      case 'Naam':
        return 'text-blue-600 font-semibold';
      case 'Jama':
        return 'text-purple-600 font-semibold';
      default:
        return 'text-gray-500';
    }
  };

  // Pagination controls
  const indexOfLastTransaction = currentPage * transactionsPerPage;
  const indexOfFirstTransaction = indexOfLastTransaction - transactionsPerPage;
  const currentTransactions = transactions.slice(indexOfFirstTransaction, indexOfLastTransaction);
  const totalPages = Math.ceil(transactions.length / transactionsPerPage);

  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-gray-50 rounded-lg shadow-lg">
      <h2 className="text-4xl font-bold text-center text-blue-600 mb-8">Inventory Management System</h2>

      <div className="mb-8 p-4 bg-white rounded-lg shadow-sm border border-gray-200">
  <h3 className="text-xl font-semibold text-gray-800 mb-3 text-center">Filter Material Transactions by Date</h3>
  <div className="flex flex-col gap-3 items-center">
  <div className="w-full flex space-x-4">
  <div className="flex-1 flex flex-col">
    <label htmlFor="start-date" className="text-sm text-gray-600 font-medium mb-1">Start Date</label>
    <input
      type="date"
      id="start-date"
      value={startDate}
      onChange={(e) => setStartDate(e.target.value)}
      className="border border-gray-300 p-2 rounded-md text-sm focus:ring focus:ring-blue-300"
    />
  </div>
  <div className="flex-1 flex flex-col">
    <label htmlFor="end-date" className="text-sm text-gray-600 font-medium mb-1">End Date</label>
    <input
      type="date"
      id="end-date"
      value={endDate}
      onChange={(e) => setEndDate(e.target.value)}
      className="border border-gray-300 p-2 rounded-md text-sm focus:ring focus:ring-blue-300"
    />
  </div>
</div>

    <button
      onClick={() => {
        setStartDate('');
        setEndDate('');
      }}
      className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-2 rounded-md shadow-md hover:shadow-lg text-sm transition-all mt-2"
    >
      Reset
    </button>
  </div>
</div>


      <h3 className="text-2xl font-semibold text-gray-700 mb-6">Latest Material Transactions</h3>

      <ul className="space-y-4">
        {currentTransactions.map((transaction) => (
          <li key={transaction._id} className="bg-white shadow-md rounded-lg p-4 border border-gray-200 flex items-center justify-between">
            <div className="flex flex-wrap items-center gap-4">
              <div className={`text-lg ${getTransTypeClassName(transaction.transType)}`}>
                <span>Transaction Type:</span> <span>{transaction.transType}</span>
              </div>
              {Object.entries(transaction)
                .filter(([key, value]) =>
                  value &&
                  key !== '_id' &&
                  key !== '__v' &&
                  key !== 'type' &&
                  key !== 'transType' &&
                  key !== 'createdAt' &&
                  key !== 'updatedAt' &&
                  typeof value !== 'object'
                )
                .map(([key, value]) => (
                  <div key={key} className="flex items-center text-sm mr-4">
                    <span className="font-medium text-gray-800 capitalize mr-1">
                      {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}:
                    </span>
                    <span className="text-gray-600">
                      {key === 'date' ? new Date(value).toLocaleDateString() : value}
                    </span>
                  </div>
                ))}
              {transaction.nomineeId && typeof transaction.nomineeId === 'object' && transaction.nomineeId.name && (
                <div className="flex items-center text-sm mr-4">
                  <span className="font-medium text-gray-800 mr-1">Nominee Name:</span>
                  <span className="text-gray-600">{transaction.nomineeId.name}</span>
                </div>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => handleDeleteTransaction(transaction._id)}
                className="bg-red-500 hover:bg-red-600 text-white font-semibold py-1 px-2 rounded-md text-xs w-20"
              >
                Delete
              </button>
              <button
                onClick={() => navigate(`/edit-transaction/${transaction._id}`)}
                className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-1 px-2 rounded-md text-xs w-20"
              >
                Edit
              </button>
             
            </div>
          </li>
        ))}
      </ul>

      {/* Pagination Controls with Page Numbers */}
      <div className="flex justify-center items-center mt-6 gap-2">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 px-4 rounded-md"
          disabled={currentPage === 1}
        >
          Previous
        </button>
        {Array.from({ length: totalPages }, (_, index) => (
          <button
            key={index + 1}
            onClick={() => handlePageChange(index + 1)}
            className={`${
              currentPage === index + 1 ? 'bg-blue-500 text-white' : 'bg-gray-300 text-gray-800'
            } font-semibold py-2 px-4 rounded-md`}
          >
            {index + 1}
          </button>
        ))}
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 px-4 rounded-md"
          disabled={currentPage === totalPages}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default Home;
