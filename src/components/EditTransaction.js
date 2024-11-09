import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const EditTransaction = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [transaction, setTransaction] = useState(null);
  const [activeToggle, setActiveToggle] = useState('');
  const [nomineeName, setNomineeName] = useState('');
  const [errors, setErrors] = useState({});
  const [bhavType, setBhavType] = useState('cash');
  const [metalWeight, setMetalWeight] = useState(0);

  useEffect(() => {
    const fetchTransaction = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/transactions/${id}`);
        const transactionData = response.data;
        setTransaction(transactionData);
        setActiveToggle(transactionData.mode); // Set active toggle based on the saved mode
        if (transactionData.nomineeId) setNomineeName(transactionData.nomineeId.name);
      } catch (error) {
        console.error('Error fetching transaction:', error);
      }
    };
    fetchTransaction();
  }, [id]);

  useEffect(() => {
    if (activeToggle === 'bhav' && transaction?.bhav) {
      if (bhavType === 'metal' && metalWeight > 0) {
        const calculatedBhavAmount = metalWeight * transaction.bhav / 1000;
        const calculatedFine = metalWeight + metalWeight * (transaction.badla || 0) / 1000;
        setTransaction((prev) => ({
          ...prev,
          bhav_amount: calculatedBhavAmount,
          fine: calculatedFine,
        }));
      } else if (bhavType === 'cash' && transaction.bhav_amount) {
        const baseFine = transaction.bhav_amount / transaction.bhav;
        const adjustedFine = baseFine + (baseFine * (transaction.badla || 0) / 1000);
        setTransaction((prev) => ({ ...prev, fine: adjustedFine * 1000 }));
      }
    } else if (activeToggle === 'metal') {
      const tunch = parseFloat(transaction.tunch) || 0;
      const wastage = parseFloat(transaction.wastage) || 0;
      const fineBase = transaction.netWeight * ((tunch + wastage) / 100);
      const adjustedFine = fineBase + (fineBase * (transaction.badla || 0) / 1000);
      setTransaction((prev) => ({ ...prev, fine: adjustedFine }));
    }
  }, [transaction?.bhav, transaction?.bhav_amount, transaction?.badla, transaction?.netWeight, transaction?.tunch, transaction?.wastage, metalWeight, activeToggle, bhavType]);
  useEffect(() => {
    if (activeToggle === 'bhav' && transaction?.bhav) {
      if (transaction.transType === 'Jama') {
        // Calculate fine dynamically based on netWeight, tunch, and wastage
        const netWeight = parseFloat(transaction.netWeight) || 1000; // default to 1000
        const tunch = parseFloat(transaction.tunch) || 100; // default to 100
        const wastage = parseFloat(transaction.wastage) || 0; // default to 0

        // Calculate fine based on netWeight, tunch, and wastage
        const fineBase = netWeight * ((tunch + wastage) / 100);
        const adjustedFine = fineBase + (fineBase * (transaction.badla || 0) / 1000);
        
        setTransaction((prev) => ({ ...prev, fine: adjustedFine }));
      } else if (transaction.transType === 'Naam' && bhavType === 'cash' && transaction.bhav_amount) {
        const baseFine = transaction.bhav_amount / transaction.bhav;
        const adjustedFine = baseFine + (baseFine * (transaction.badla || 0) / 1000);
        setTransaction((prev) => ({ ...prev, fine: adjustedFine * 1000 }));
      }
    }
  }, [transaction?.bhav, transaction?.bhav_amount, transaction?.badla, transaction?.netWeight, transaction?.tunch, transaction?.wastage, activeToggle, bhavType, transaction?.transType]);
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setTransaction({ ...transaction, [name]: value });
  };

  const toggleActive = (mode) => {
    setActiveToggle(mode);
    setTransaction((prev) => ({ ...prev, mode })); // Update mode in transaction
  };

  const handleBhavTypeToggle = (type) => {
    setBhavType(type);
    setTransaction((prev) => ({ ...prev, bhav_amount: 0, fine: 0 }));
  };

  const validateFields = () => {
    const validationErrors = {};
    if (!transaction.product) validationErrors.product = 'Product is required';
    setErrors(validationErrors);
    return Object.keys(validationErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateFields()) return;

    try {
      await axios.put(`${process.env.REACT_APP_BACKEND_URL}/transactions/${id}`, transaction);
      alert('Transaction updated successfully');
      navigate('/');
    } catch (error) {
      console.error('Error updating transaction:', error);
      alert('Error updating transaction');
    }
  };

  if (!transaction) return <p>Loading...</p>;

  return (
    <div className="max-w-lg mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6">Edit Transaction</h2>
      <form onSubmit={handleSubmit} className="space-y-4">

        {/* Display Nominee Name */}
        <div className="relative">
          <label className="block text-gray-700 font-medium mb-1">Nominee</label>
          <div className="w-full border border-gray-300 p-2 rounded-md bg-gray-100 text-gray-800">
            {nomineeName || 'No nominee selected'}
          </div>
        </div>
        <div>
          <label className="block text-gray-700 font-medium mb-1">Date</label>
          <input
            type="date"
            name="date"
            value={transaction.date ? transaction.date.split('T')[0] : ''} // Display date only, without time
            onChange={handleInputChange}
            className="w-full border border-gray-300 p-2 rounded-md focus:ring focus:ring-blue-500"
          />
        </div>

        {/* Product Field */}
        <div>
          <label className="block text-gray-700 font-medium mb-1">Product</label>
          <input
            type="text"
            name="product"
            value={transaction.product || ''}
            onChange={handleInputChange}
            className={`w-full border ${errors.product ? 'border-red-500' : 'border-gray-300'} p-2 rounded-md focus:ring focus:ring-blue-500`}
          />
          {errors.product && <p className="text-red-500 text-sm">{errors.product}</p>}
        </div>

        {/* Transaction Type Selection */}
        <div>
          <label className="block text-gray-700 font-medium mb-1">Transaction Type</label>
          <select
            name="transType"
            value={transaction.transType || ''}
            onChange={handleInputChange}
            className="w-full border border-gray-300 p-2 rounded-md focus:ring focus:ring-blue-500"
          >
            <option value="">Select Transaction Type</option>
            <option value="Naam">Naam</option>
            <option value="Jama">Jama</option>
          </select>
        </div>

        {/* Mode Selection */}
        <div className="flex space-x-4">
          <button type="button" onClick={() => toggleActive('cash')} className={`px-4 py-2 font-semibold rounded-md ${activeToggle === 'cash' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}>Cash</button>
          <button type="button" onClick={() => toggleActive('metal')} className={`px-4 py-2 font-semibold rounded-md ${activeToggle === 'metal' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}>Metal</button>
          <button type="button" onClick={() => toggleActive('bhav')} className={`px-4 py-2 font-semibold rounded-md ${activeToggle === 'bhav' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}>Bhav</button>
        </div>

        {/* Conditionally Render Fields Based on Mode */}
        {activeToggle === 'cash' && (
          <div>
            <label className="block text-gray-700 font-medium mb-1">Amount</label>
            <input
              type="number"
              name="amount"
              value={transaction.amount || ''}
              onChange={handleInputChange}
              className="w-full border border-gray-300 p-2 rounded-md focus:ring focus:ring-blue-500"
            />
          </div>
        )}

        {activeToggle === 'metal' && (
          <>
            <div>
              <label className="block text-gray-700 font-medium mb-1">Net Weight</label>
              <input
                type="number"
                name="netWeight"
                value={transaction.netWeight || ''}
                onChange={handleInputChange}
                className="w-full border border-gray-300 p-2 rounded-md focus:ring focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-1">Tunch</label>
              <input
                type="number"
                name="tunch"
                value={transaction.tunch || ''}
                onChange={handleInputChange}
                className="w-full border border-gray-300 p-2 rounded-md focus:ring focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-1">Wastage</label>
              <input
                type="number"
                name="wastage"
                value={transaction.wastage || ''}
                onChange={handleInputChange}
                className="w-full border border-gray-300 p-2 rounded-md focus:ring focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-1">Pieces</label>
              <input
                type="number"
                name="pieces"
                value={transaction.pieces || ''}
                onChange={handleInputChange}
                className="w-full border border-gray-300 p-2 rounded-md focus:ring focus:ring-blue-500"
              />
              <div>
          <label className="block text-gray-700 font-medium mb-1">Fine</label>
          <input
            type="number"
            name="fine"
            value={transaction.fine || ''}
            onChange={handleInputChange}
            className="w-full border border-gray-300 p-2 rounded-md focus:ring focus:ring-blue-500"
          />
        </div>
            </div>
          </>
        )}

{activeToggle === 'bhav' && (
  <>
    {transaction.transType === 'Naam' && (
      <>
        <div>
          <label className="block text-gray-700 font-medium mb-1">Bhav</label>
          <input
            type="number"
            name="bhav"
            value={transaction.bhav || ''}
            onChange={(e) => setTransaction({ ...transaction, bhav: parseInt(e.target.value) })}
            className="w-full border border-gray-300 p-2 rounded-md focus:ring focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-gray-700 font-medium mb-1">Amount</label>
          <input
            type="number"
            name="amount"
            value={transaction.amount || ''}
            onChange={(e) => setTransaction({ ...transaction, amount: parseInt(e.target.value) })}
            className="w-full border border-gray-300 p-2 rounded-md focus:ring focus:ring-blue-500"
          />
        </div>
      </>
    )}

    {transaction.transType === 'Jama' && (
      <>
        <div>
          <label className="block text-gray-700 font-medium mb-1">Net Weight</label>
          <input
            type="number"
            name="netWeight"
            value={transaction.netWeight || 1000} // default value 1000
            onChange={(e) => setTransaction({ ...transaction, netWeight: parseInt(e.target.value) })}
            className="w-full border border-gray-300 p-2 rounded-md focus:ring focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-gray-700 font-medium mb-1">Tunch</label>
          <input
            type="number"
            name="tunch"
            value={transaction.tunch || 100} // default value 100
            onChange={(e) => setTransaction({ ...transaction, tunch: parseInt(e.target.value) })}
            className="w-full border border-gray-300 p-2 rounded-md focus:ring focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-gray-700 font-medium mb-1">Wastage</label>
          <input
            type="number"
            name="wastage"
            value={transaction.wastage || 0} // default value 0
            onChange={(e) => setTransaction({ ...transaction, wastage: parseInt(e.target.value) })}
            className="w-full border border-gray-300 p-2 rounded-md focus:ring focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-gray-700 font-medium mb-1">Pieces</label>
          <input
            type="number"
            name="pieces"
            value={transaction.pieces || 0} // default value 0
            onChange={(e) => setTransaction({ ...transaction, pieces: parseInt(e.target.value) })}
            className="w-full border border-gray-300 p-2 rounded-md focus:ring focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-gray-700 font-medium mb-1">Fine</label>
          <input
            type="number"
            name="fine"
            value={transaction.fine || 1000} // default value 1000
            onChange={(e) => setTransaction({ ...transaction, fine: parseInt(e.target.value) })}
            className="w-full border border-gray-300 p-2 rounded-md focus:ring focus:ring-blue-500"
          />
        </div>
      </>
    )}
  </>
)}

        {/* Fine Field */}
        

        {/* Description */}
        <div>
          <label className="block text-gray-700 font-medium mb-1">Description</label>
          <input
            type="text"
            name="description"
            value={transaction.description || ''}
            onChange={handleInputChange}
            className="w-full border border-gray-300 p-2 rounded-md focus:ring focus:ring-blue-500"
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full bg-blue-500 text-white py-2 rounded-md font-semibold hover:bg-blue-600 focus:ring focus:ring-blue-500"
        >
          Update Transaction
        </button>
      </form>
    </div>
  );
};

export default EditTransaction;
