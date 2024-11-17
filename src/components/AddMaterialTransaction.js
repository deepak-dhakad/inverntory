import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AddMaterialTransaction = () => {
  const [transaction, setTransaction] = useState({
    nomineeId: '',
    date: '',
    product: '',
    netWeight: 0,
    tunch: 0,
    wastage: 0,
    pieces: 0,
    fine: 0,
    bhav: 0,
    bhav_amount: 0,
    badla: 0,
    amount: 0,
    description: '',
    transType: '',
    mode: ''
  });

  const [activeToggle, setActiveToggle] = useState(''); // "cash", "metal", or "cut_bhav"
  const [bhavType, setBhavType] = useState('cash'); 
  const [searchQuery, setSearchQuery] = useState('');
  const [nomineeSuggestions, setNomineeSuggestions] = useState([]);
  const [metalWeight, setMetalWeight] = useState(0);

  const [errors, setErrors] = useState({});

  const handleSearchChange = async (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    if (query.length > 1) {
      try {
        const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/nominees/search`, {
          params: { query, type: 'Material' }
        });
        setNomineeSuggestions(response.data);
      } catch (err) {
        console.error("Error fetching nominee suggestions", err);
      }
    } else {
      setNomineeSuggestions([]);
    }
  };

  const handleSuggestionClick = (nominee) => {
    setTransaction({ ...transaction, nomineeId: nominee._id });
    setSearchQuery(nominee.name);
    setNomineeSuggestions([]);
  };

  useEffect(() => {
    if (activeToggle === 'cut_bhav' && transaction.bhav) {
      if (bhavType === 'metal' && metalWeight > 0) {
        const calculatedBhavAmount = metalWeight * transaction.bhav/1000;
        const calculatedFine = metalWeight+metalWeight * (transaction.badla )/ 1000;
        setTransaction((prev) => ({
          ...prev,
          bhav_amount: calculatedBhavAmount,
          fine: calculatedFine
        }));
      } else if (bhavType === 'cash' && transaction.bhav_amount) {
        const baseFine = transaction.bhav_amount / transaction.bhav;
        const adjustedFine = baseFine + (baseFine * transaction.badla / 1000);
        setTransaction((prev) => ({ ...prev, fine: adjustedFine * 1000 }));
      }
    }
  }, [transaction.bhav, transaction.bhav_amount, transaction.badla, metalWeight, activeToggle, bhavType]);
  const handleBhavTypeToggle = (type) => {
    setBhavType(type);
    setTransaction((prev) => ({ ...prev, bhav_amount: 0, fine: 0 }));
  };

  const validateFields = () => {
    const validationErrors = {};
    if (!transaction.product) validationErrors.product = 'Product is required';
    
    // Only validate `transType` if activeToggle is not 'cut_bhav'
    if (activeToggle !== 'cut_bhav' && !transaction.transType) {
      validationErrors.transType = 'Transaction type is required';
    }
    
    setErrors(validationErrors);
    return Object.keys(validationErrors).length === 0;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateFields()) return;

    if (activeToggle === 'cut_bhav') {
      // Prepare "Naam" transaction
      const calculatedFine = transaction.bhav_amount / transaction.bhav;
      const adjustedFine = calculatedFine + (calculatedFine * transaction.badla / 1000);

      const { fine, ...naamTransactionData } = {
        ...transaction,
        amount: transaction.bhav_amount,
        description: `${transaction.description} ${transaction.bhav}`,
        badla: transaction.badla,
        transType: 'Naam',
      };

      // Prepare "Jama" transaction
      const jamaTransaction = {
          ...transaction,
          netWeight: calculatedFine*1000,
          tunch: 100,
          fine: adjustedFine*1000,
          badla: transaction.badla,
          transType: 'Jama',
          
      };

      // Send transactions separately if the backend does not support arrays
      await axios.post(`${process.env.REACT_APP_BACKEND_URL}/material-transactions`, naamTransactionData);

      await axios.post(`${process.env.REACT_APP_BACKEND_URL}/material-transactions`, jamaTransaction);
      alert('Material transactions for "Naam" and "Jama" added successfully');
      resetForm();

  } else {
      // Handle other toggles like cash or metal
      const submissionData = { ...transaction };
      try {
        await axios.post(`${process.env.REACT_APP_BACKEND_URL}/material-transactions`, submissionData);
        alert('Material transaction added successfully');
        resetForm();
      } catch (err) {
        alert('Error adding transaction');
      }
    }
  };

  const resetForm = () => {
    setTransaction({
      nomineeId: '',
      product: '',
      date: '',
      netWeight: 0,
      tunch: 0,
      wastage: 0,
      pieces: 0,
      fine: 0,
      bhav: 0,
      bhav_amount: 0,
      badla: 0,
      amount: 0,
      description: '',
      transType: '',
    mode: ''
    });
    setSearchQuery('');
    setActiveToggle('');
  };

  useEffect(() => {
    if (activeToggle === 'metal') {
      const tunch = parseFloat(transaction.tunch) || 0;
      const wastage = parseFloat(transaction.wastage) || 0;
      const fineBase = transaction.netWeight * ((tunch + wastage) / 100);
      const adjustedFine = fineBase + (fineBase * (transaction.badla / 1000));
      setTransaction((prev) => ({ ...prev, fine: adjustedFine }));
    }
  }, [transaction.netWeight, transaction.tunch, transaction.wastage, transaction.badla, activeToggle]);

  const toggleActive = (toggle) => {
    // Set the mode based on the toggle
    const mode = toggle === 'cash' ? 'cash' : toggle === 'metal' ? 'metal' : 'bhav';
  
    // Update the active toggle and set the mode in the transaction state
    setActiveToggle(toggle === activeToggle ? '' : toggle);
    setTransaction((prev) => ({ ...prev, mode: toggle === activeToggle ? '' : mode }));
  };
  

  return (
    <div className="max-w-lg mx-auto p-6 bg-white shadow-md rounded-lg">
      <h2 className="text-2xl font-bold text-center mb-6">Add Transaction</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <label className="block text-gray-700 font-medium mb-1" htmlFor="search">Search Nominee</label>
          <input
            type="text"
            id="search"
            placeholder="Search Nominee"
            value={searchQuery}
            onChange={handleSearchChange}
            className="w-full border border-gray-300 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {nomineeSuggestions.length > 0 && (
            <ul className="absolute z-10 bg-white border border-gray-300 w-full mt-1 rounded-md shadow-lg max-h-40 overflow-y-auto">
              {nomineeSuggestions.map((nominee) => (
                <li
                  key={nominee._id}
                  onClick={() => handleSuggestionClick(nominee)}
                  className="p-2 cursor-pointer hover:bg-blue-500 hover:text-white"
                >
                  {nominee.name}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div>
          <label className="block text-gray-700 font-medium mb-1" htmlFor="product">Product</label>
          <input
            type="text"
            id="product"
            placeholder="Product"
            value={transaction.product}
            onChange={(e) => setTransaction({ ...transaction, product: e.target.value })}
            className={`w-full border ${errors.product ? 'border-red-500' : 'border-gray-300'} p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
          />
          {errors.product && <p className="text-red-500 text-sm mt-1">{errors.product}</p>}
        </div>
        <div>
          <label className="block text-gray-700 font-medium mb-1" htmlFor="date">Date</label>
          <input
            type="date"
            id="date"
            value={transaction.date}
            onChange={(e) => setTransaction({ ...transaction, date: e.target.value })}
            className="w-full border border-gray-300 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-gray-700 font-medium mb-1" htmlFor="description">Description</label>
          <input
            type="text"
            id="description"
            placeholder="Description"
            value={transaction.description}
            onChange={(e) => setTransaction({ ...transaction, description: e.target.value })}
            className={`w-full border  p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
          />
          
        </div>
        <div>
          <label className="block text-gray-700 font-medium mb-1">Transaction Type</label>
          <select
            value={transaction.transType}
            onChange={(e) => setTransaction({ ...transaction, transType: e.target.value })}
            className={`w-full border ${errors.transType ? 'border-red-500' : 'border-gray-300'} p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
          >
            <option value="">Select Transaction Type</option>
            <option value="Naam">Lena</option>
            <option value="Jama">Jama</option>
          </select>
          {errors.transType && <p className="text-red-500 text-sm mt-1">{errors.transType}</p>}
        </div>

        <div className="flex space-x-4">
          <button type="button" onClick={() => toggleActive('cash')} className={`px-4 py-2 font-semibold rounded-md ${activeToggle === 'cash' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}>Cash</button>
          <button type="button" onClick={() => toggleActive('metal')} className={`px-4 py-2 font-semibold rounded-md ${activeToggle === 'metal' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}>Metal</button>
          <button type="button" onClick={() => toggleActive('cut_bhav')} className={`px-4 py-2 font-semibold rounded-md ${activeToggle === 'cut_bhav' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}>Cut Bhav</button>
        </div>

        {activeToggle === 'cash' && (
          <div>
            <label className="block text-gray-700 font-medium mb-1" htmlFor="amount">Amount</label>
            <input
              type="number"
              id="amount"
              placeholder="Amount"
              value={transaction.amount}
              onChange={(e) => setTransaction({ ...transaction, amount: e.target.value })}
              className="w-full border border-gray-300 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        )}

        {activeToggle === 'metal' && (
          <>
            <label className="block text-gray-700 font-medium mb-1" htmlFor="netWeight">Net Weight</label>
            <input
              type="number"
              id="netWeight"
              placeholder="Net Weight"
              value={transaction.netWeight}
              onChange={(e) => setTransaction({ ...transaction, netWeight: parseFloat(e.target.value) })}
              className="w-full border border-gray-300 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            <label className="block text-gray-700 font-medium mb-1" htmlFor="tunch">Tunch</label>
            <input
              type="number"
              id="tunch"
              placeholder="Tunch"
              value={transaction.tunch}
              onChange={(e) => setTransaction({ ...transaction, tunch: parseFloat(e.target.value) })}
              className="w-full border border-gray-300 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            <label className="block text-gray-700 font-medium mb-1" htmlFor="wastage">Wastage</label>
            <input
              type="number"
              id="wastage"
              placeholder="Wastage"
              value={transaction.wastage}
              onChange={(e) => setTransaction({ ...transaction, wastage: parseFloat(e.target.value) })}
              className="w-full border border-gray-300 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <label className="block text-gray-700 font-medium mb-1" htmlFor="pieces">Pieces</label>
            <input
              type="number"
              id="pieces"
              placeholder="Pieces"
              value={transaction.pieces}
              onChange={(e) => setTransaction({ ...transaction, pieces: e.target.value })}
              className="w-full border border-gray-300 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            <label className="block text-gray-700 font-medium mb-1" htmlFor="badla">Badla</label>
            <select
  id="badla"
  value={transaction.badla}
  onChange={(e) => setTransaction({ ...transaction, badla: e.target.value })}
  className="w-full border border-gray-300 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
>
  <option value="">Select Badla</option>
  <option value="0">0</option>
  <option value="10">10</option>
  <option value="12">12</option>
</select>


            <label className="block text-gray-700 font-medium mb-1" htmlFor="fine">Fine</label>
            <input
              type="number"
              id="fine"
              placeholder="Fine"
              value={transaction.fine}
              readOnly
              className="w-full border border-gray-300 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-100"
            />
          </>
        )}

{activeToggle === 'cut_bhav' && (
          <>
            <label className="block text-gray-700 font-medium mb-1">Bhav Type</label>
            <div className="flex space-x-4">
              <button
                type="button"
                onClick={() => handleBhavTypeToggle('cash')}
                className={`px-4 py-2 font-semibold rounded-md ${bhavType === 'cash' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
              >
                Bhav by Cash
              </button>
              <button
                type="button"
                onClick={() => handleBhavTypeToggle('metal')}
                className={`px-4 py-2 font-semibold rounded-md ${bhavType === 'metal' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
              >
                Bhav by Metal
              </button>
            </div>

            <label className="block text-gray-700 font-medium mb-1" htmlFor="bhav">Bhav</label>
            <input
              type="number"
              id="bhav"
              placeholder="Bhav"
              value={transaction.bhav}
              onChange={(e) => setTransaction({ ...transaction, bhav: parseFloat(e.target.value) })}
              className="w-full border border-gray-300 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            {bhavType === 'metal' ? (
              <>
                <label className="block text-gray-700 font-medium mb-1" htmlFor="metalWeight">Metal Weight</label>
                <input
                  type="number"
                  id="metalWeight"
                  placeholder="Metal Weight"
                  value={metalWeight}
                  onChange={(e) => setMetalWeight(parseFloat(e.target.value))}
                  className="w-full border border-gray-300 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </>
            ) : (
              <>
                <label className="block text-gray-700 font-medium mb-1" htmlFor="bhav_amount">Bhav Amount</label>
                <input
                  type="number"
                  id="bhav_amount"
                  placeholder="Bhav Amount"
                  value={transaction.bhav_amount}
                  onChange={(e) => setTransaction({ ...transaction, bhav_amount: parseFloat(e.target.value) })}
                  className="w-full border border-gray-300 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </>
            )}

            <label className="block text-gray-700 font-medium mb-1" htmlFor="badla">Badla</label>
            <select
              id="badla"
              value={transaction.badla}
              onChange={(e) => setTransaction({ ...transaction, badla: parseInt(e.target.value) })}
              className="w-full border border-gray-300 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="0">0</option>
              <option value="10">10</option>
              <option value="12">12</option>
            </select>

            <label className="block text-gray-700 font-medium mb-1" htmlFor="fine">Fine</label>
            <input
              type="number"
              id="fine"
              placeholder="Fine"
              value={transaction.fine}
              readOnly
              className="w-full border border-gray-300 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-100"
            />
          </>
        )}

        <button
          type="submit"
          className="w-full bg-blue-500 text-white py-2 rounded-md font-semibold hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Submit Transaction
        </button>
      </form>
    </div>
  );
};

export default AddMaterialTransaction;
