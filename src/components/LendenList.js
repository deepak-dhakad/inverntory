import React, { useState, useEffect } from 'react';
import axios from 'axios';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const LendenList = () => {
  const [lendenRecords, setLendenRecords] = useState([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingRecord, setEditingRecord] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', description: '', date: '', transType: '', amount: '' });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('Gorev'); // Active tab state

  useEffect(() => {
    fetchLendenRecords();
  }, [startDate, endDate]);

  const fetchLendenRecords = async () => {
    const { data } = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/lenden`, { params: { startDate, endDate } });
    const sortedData = data.sort((a, b) => new Date(b.date) - new Date(a.date));
    setLendenRecords(sortedData.reverse()); // Reverse to show the newest first
  };

  const downloadPDF = () => {
    const doc = new jsPDF();
    doc.text('Lenden Report', 20, 10);
    const recordsToDownload =
      activeTab === 'Gorev'
        ? lendenRecords.filter(record => record.name === 'Gorev')
        : lendenRecords.filter(record => record.name !== 'Gorev');

    doc.autoTable({
      head: [['Name', 'Description', 'Date', 'Type', 'Amount']],
      body: recordsToDownload.map(({ name, description, date, transType, amount }) => [
        name,
        description,
        new Date(date).toLocaleDateString(),
        transType,
        amount,
      ]),
    });

    const totalCredit = recordsToDownload
      .filter(r => r.transType === 'credit')
      .reduce((sum, r) => sum + r.amount, 0);
    const totalDebit = recordsToDownload
      .filter(r => r.transType === 'debit')
      .reduce((sum, r) => sum + r.amount, 0);
    const netBalance = totalCredit - totalDebit;

    doc.text(`Total Credit: ${totalCredit}`, 14, doc.autoTable.previous.finalY + 10);
    doc.text(`Total Debit: ${totalDebit}`, 14, doc.autoTable.previous.finalY + 20);
    doc.text(`Net Balance: ${netBalance}`, 14, doc.autoTable.previous.finalY + 30);

    doc.save('lenden_records.pdf');
  };

  const handleDelete = async (id) => {
    const isConfirmed = window.confirm('Are you sure you want to delete this transaction?');
    if (!isConfirmed) return;

    try {
      await axios.delete(`${process.env.REACT_APP_BACKEND_URL}/lenden/${id}`);
      setLendenRecords(lendenRecords.filter(record => record._id !== id));
    } catch (error) {
      console.error('Error deleting transaction:', error);
    }
  };

  const openEditModal = (record) => {
    setEditingRecord(record._id);
    setEditForm({
      name: record.name,
      description: record.description,
      date: new Date(record.date).toISOString().substr(0, 10),
      transType: record.transType,
      amount: record.amount,
    });
    setIsModalOpen(true);
  };

  const closeEditModal = () => {
    setIsModalOpen(false);
    setEditingRecord(null);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.put(`${process.env.REACT_APP_BACKEND_URL}/lenden/${editingRecord}`, editForm);
      const updatedRecords = lendenRecords.map(record => (record._id === data._id ? data : record));
      setLendenRecords(updatedRecords.sort((a, b) => new Date(b.date) - new Date(a.date))); // Sort by newest date
      closeEditModal();
    } catch (error) {
      console.error('Error updating transaction:', error);
    }
  };

  const filteredRecords = lendenRecords.filter(record =>
    record.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const recordsToShow =
    activeTab === 'Gorev'
      ? filteredRecords.filter(record => record.name === 'Gorev')
      : filteredRecords.filter(record => record.name !== 'Gorev');

  return (
    <div className="max-w-full sm:max-w-4xl mx-auto mt-10 p-4">
      <h2 className="text-2xl font-bold mb-6 text-center text-blue-600">Lenden Transactions</h2>

      {/* Tabs */}
      <div className="flex justify-center mb-4">
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

      <div className="flex flex-col gap-4 sm:flex-row justify-center mb-4">
        <input
          type="text"
          placeholder="Search by name"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
        />

        <div className="flex flex-row gap-2 w-full">
          <div className="flex-1">
            <label className="text-gray-700 font-medium mb-1" htmlFor="start-date">
              Start Date
            </label>
            <input
              type="date"
              id="start-date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
            />
          </div>
          <div className="flex-1">
            <label className="text-gray-700 font-medium mb-1" htmlFor="end-date">
              End Date
            </label>
            <input
              type="date"
              id="end-date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
            />
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row mb-4">
        <button
          onClick={downloadPDF}
          className="p-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition duration-300 w-full sm:w-auto"
        >
          Download PDF
        </button>
        <button
          onClick={() => {
            setStartDate('');
            setEndDate('');
          }}
          className="p-2 bg-gray-600 text-white font-semibold rounded-md hover:bg-gray-700 transition duration-300 w-full sm:w-auto"
        >
          Reset Filters
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white shadow-md rounded-md text-sm">
          <thead className="bg-blue-100">
            <tr>
              <th className="p-2 text-left font-medium text-gray-700">Name</th>
              <th className="p-2 text-left font-medium text-gray-700">Description</th>
              <th className="p-2 text-left font-medium text-gray-700">Date</th>
              <th className="p-2 text-left font-medium text-gray-700">Type</th>
              <th className="p-2 text-left font-medium text-gray-700">Amount</th>
              <th className="p-2 text-left font-medium text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {recordsToShow.map((record) => (
              <tr key={record._id} className="border-t">
                <td className="p-2">{record.name}</td>
                <td className="p-2">{record.description}</td>
                <td className="p-2">{new Date(record.date).toLocaleDateString()}</td>
                <td className="p-2">{record.transType}</td>
                <td className="p-2">{record.amount}</td>
                <td className="p-2 flex space-x-2">
                  <button onClick={() => openEditModal(record)} className="text-blue-500 hover:underline">
                    Edit
                  </button>
                  <button onClick={() => handleDelete(record._id)} className="text-red-500 hover:underline">
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex justify-center items-center z-50 p-4">
          <div className="bg-white p-4 sm:p-6 rounded-md shadow-md w-full sm:w-96">
            <h3 className="text-lg font-bold mb-4 text-blue-600">Edit Transaction</h3>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <input
                type="text"
                name="name"
                placeholder="Name"
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                required
                className="p-2 border border-gray-300 rounded-md w-full"
              />
              <input
                type="text"
                name="description"
                placeholder="Description"
                value={editForm.description}
                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                className="p-2 border border-gray-300 rounded-md w-full"
              />
              <input
                type="date"
                name="date"
                value={editForm.date}
                onChange={(e) => setEditForm({ ...editForm, date: e.target.value })}
                required
                className="p-2 border border-gray-300 rounded-md w-full"
              />
              <select
                name="transType"
                value={editForm.transType}
                onChange={(e) => setEditForm({ ...editForm, transType: e.target.value })}
                required
                className="p-2 border border-gray-300 rounded-md w-full"
              >
                <option value="credit">Credit</option>
                <option value="debit">Debit</option>
              </select>
              <input
                type="number"
                name="amount"
                placeholder="Amount"
                value={editForm.amount}
                onChange={(e) => setEditForm({ ...editForm, amount: e.target.value })}
                required
                className="p-2 border border-gray-300 rounded-md w-full"
              />
              <div className="flex justify-end gap-4">
                <button type="button" onClick={closeEditModal} className="p-2 bg-gray-500 text-white rounded-md">
                  Cancel
                </button>
                <button type="submit" className="p-2 bg-blue-600 text-white rounded-md">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LendenList;
