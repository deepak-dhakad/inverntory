import React, { useState } from 'react';
import axios from 'axios';

const AddNominee = () => {
  const [nominee, setNominee] = useState({
    name: '',
    contact: '',
    currentBalance: { fine: 0, amount: 0 }, // Initialize currentBalance with fine and amount
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Prepare two nominees: one as 'Material' and the other as 'Product'
    const nomineeMaterial = {
      ...nominee,
      type: 'Material',
    };

    const nomineeProduct = {
      ...nominee,
      type: 'Product',
    };

    try {
      // Save the 'Material' nominee
      await axios.post(`${process.env.REACT_APP_BACKEND_URL}/nominees`, nomineeMaterial);

      // Save the 'Product' nominee
      await axios.post(`${process.env.REACT_APP_BACKEND_URL}/nominees`, nomineeProduct);

      alert('Nominee added successfully as both Material and Product');
      
      // Reset the form fields
      setNominee({
        name: '',
        contact: '',
        currentBalance: { fine: 0, amount: 0 },
      });
    } catch (err) {
      alert('Error adding nominee');
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white shadow-lg rounded-lg">
      <h2 className="text-2xl font-bold text-center mb-6">Add Nominee</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-gray-700 font-medium mb-1" htmlFor="name">Name</label>
          <input
            type="text"
            id="name"
            placeholder="Name"
            value={nominee.name}
            onChange={(e) => setNominee({ ...nominee, name: e.target.value })}
            className="w-full border border-gray-300 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <div>
          <label className="block text-gray-700 font-medium mb-1" htmlFor="contact">Contact</label>
          <input
            type="text"
            id="contact"
            placeholder="Contact"
            value={nominee.contact}
            onChange={(e) => setNominee({ ...nominee, contact: e.target.value })}
            className="w-full border border-gray-300 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        {/* <div>
          <label className="block text-gray-700 font-medium mb-1" htmlFor="fine">Initial Fine Balance</label>
          <input
            type="number"
            id="fine"
            placeholder="Fine Balance"
            value={nominee.currentBalance.fine}
            onChange={(e) =>
              setNominee({
                ...nominee,
                currentBalance: { ...nominee.currentBalance, fine: Number(e.target.value) },
              })
            }
            className="w-full border border-gray-300 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <div>
          <label className="block text-gray-700 font-medium mb-1" htmlFor="amount">Initial Amount Balance</label>
          <input
            type="number"
            id="amount"
            placeholder="Amount Balance"
            value={nominee.currentBalance.amount}
            onChange={(e) =>
              setNominee({
                ...nominee,
                currentBalance: { ...nominee.currentBalance, amount: Number(e.target.value) },
              })
            }
            className="w-full border border-gray-300 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div> */}
        
        <button
          type="submit"
          className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-md transition-colors duration-300"
        >
          Add Nominee
        </button>
      </form>
    </div>
  );
};

export default AddNominee;
