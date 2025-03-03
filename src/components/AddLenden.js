import React, { useState } from 'react';
import axios from 'axios';

const AddLenden = () => {
  const [form, setForm] = useState({ name: '', description: '', date: '', transType: '', amount: '' });
  const [success, setSuccess] = useState(false); // Success message state
  const [activeTab, setActiveTab] = useState('Other'); // Tab state

  // Handle input changes
  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  // Submit the form
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Ensure the "Gorev" name is set explicitly
      const dataToSubmit = { ...form, name: activeTab === 'Gorev' ? 'Gorev' : form.name };

      await axios.post(`${process.env.REACT_APP_BACKEND_URL}/lenden/add`, dataToSubmit);
      setForm({ name: '', description: '', date: '', transType: '', amount: '' });
      setSuccess(true); // Show success message
      setTimeout(() => setSuccess(false), 3000); // Hide message after 3 seconds
    } catch (error) {
      console.error('Error adding transaction:', error);
    }
  };

  return (
    <div className="max-w-lg mx-auto mt-10 p-6 bg-white shadow-md rounded-md">
      <h2 className="text-2xl font-bold mb-6 text-center text-blue-600">Add Lenden Transaction</h2>

      {success && (
        <div className="mb-4 p-2 text-green-800 bg-green-100 border border-green-200 rounded-md">
          Transaction added successfully!
        </div>
      )}

      {/* Tabs */}
      <div className="flex justify-center mb-6">
        <button
          onClick={() => setActiveTab('Gorev')}
          className={`px-4 py-2 ${activeTab === 'Gorev' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'} rounded-l-md`}
        >
          Gorev
        </button>
        <button
          onClick={() => setActiveTab('Other')}
          className={`px-4 py-2 ${activeTab === 'Other' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'} rounded-r-md`}
        >
          Other
        </button>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name Field */}
        <div className="flex flex-col">
          <label className="text-gray-700 font-medium mb-1" htmlFor="name">Name</label>
          <input
            type="text"
            name="name"
            id="name"
            placeholder="Name"
            value={activeTab === 'Gorev' ? 'Gorev' : form.name} // Fixed for Gorev tab
            onChange={activeTab === 'Other' ? handleChange : undefined} // Allow changes only in Other tab
            disabled={activeTab === 'Gorev'} // Disable input for Gorev tab
            required
            className={`p-2 border border-gray-300 rounded-md focus:outline-none ${
              activeTab === 'Gorev' ? 'bg-gray-100 cursor-not-allowed' : 'focus:ring-2 focus:ring-blue-500'
            }`}
          />
        </div>

        {/* Other Fields */}
        <div className="flex flex-col">
          <label className="text-gray-700 font-medium mb-1" htmlFor="description">Description</label>
          <input
            type="text"
            name="description"
            id="description"
            placeholder="Description"
            value={form.description}
            onChange={handleChange}
            className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex flex-col">
          <label className="text-gray-700 font-medium mb-1" htmlFor="date">Date</label>
          <input
            type="date"
            name="date"
            id="date"
            value={form.date}
            onChange={handleChange}
            required
            className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex flex-col">
          <label className="text-gray-700 font-medium mb-1" htmlFor="transType">Transaction Type</label>
          <select
            name="transType"
            id="transType"
            value={form.transType}
            onChange={handleChange}
            required
            className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select Type</option>
            <option value="credit">Credit</option>
            <option value="debit">Debit</option>
          </select>
        </div>

        <div className="flex flex-col">
          <label className="text-gray-700 font-medium mb-1" htmlFor="amount">Amount</label>
          <input
            type="number"
            name="amount"
            id="amount"
            placeholder="Amount"
            value={form.amount}
            onChange={handleChange}
            required
            className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full p-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition duration-300"
        >
          Add Transaction
        </button>
      </form>
    </div>
  );
};

export default AddLenden;
