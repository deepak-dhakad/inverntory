import React, { useState, useEffect } from 'react';
import axios from 'axios';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
const AddProductGiveTransaction = () => {
  const [transaction, setTransaction] = useState({
    nomineeId: '',
    date: '',
    description: '',
    Totalfine: 0, // Initialize Totalfine in the state
    products: [
      {
        name: '',
        grossWeight: 0,
        tunch: 0,
        wastage: 0,
        fine: 0, // Individual fine calculated based on inputs
        boxes: [{ quantity: 0, weight: 0 }],
        polythene: [{ quantity: 0, weight: 0 }],
      },
    ],
  });
  const [nomineeName, setNomineeName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [nomineeSuggestions, setNomineeSuggestions] = useState([]);

  const handleSearchChange = async (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    if (query.length > 1) {
      try {
        const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/nominees/search`, {
          params: { query, type: 'Material' },
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
    setNomineeName(nominee.name);
    setSearchQuery(nominee.name);
    setNomineeSuggestions([]);
  };
  const calculateFine = (product) => {
    const totalBoxWeight = product.boxes.reduce((sum, box) => sum + box.weight * box.quantity, 0);
    const totalPolytheneWeight = product.polythene.reduce((sum, poly) => sum + poly.weight * poly.quantity, 0);
    const netWeight = product.grossWeight - totalBoxWeight - totalPolytheneWeight;
  
    // Ensure tunch and wastage are treated as numbers
    const tunch = parseFloat(product.tunch) || 0;
    const wastage = parseFloat(product.wastage) || 0;
  
    // Calculate fine using the correct formula
    const fine = netWeight * ((tunch + wastage) / 100);
  
   
  
    return fine;
  };
  
  

  // Calculate total fine for the transaction
  const calculateTotalFine = () => {
    return transaction.products.reduce((sum, product) => sum + product.fine, 0);
  };

  // Handle changes to product fields and update fine calculation
  const handleProductChange = (index, field, value) => {
    const updatedProducts = [...transaction.products];
    updatedProducts[index][field] = value;
    
    // Recalculate individual fine and total fine whenever a relevant field changes
    updatedProducts[index].fine = calculateFine(updatedProducts[index]);
    const updatedTotalFine = calculateTotalFine();

    setTransaction({ ...transaction, products: updatedProducts, Totalfine: updatedTotalFine });
  };

  const handleBoxChange = (productIndex, boxIndex, field, value) => {
    const updatedProducts = [...transaction.products];
    updatedProducts[productIndex].boxes[boxIndex][field] = value;
    
    // Recalculate individual and total fine when box weight changes
    updatedProducts[productIndex].fine = calculateFine(updatedProducts[productIndex]);
    const updatedTotalFine = calculateTotalFine();

    setTransaction({ ...transaction, products: updatedProducts, Totalfine: updatedTotalFine });
  };

  const handlePolytheneChange = (productIndex, polytheneIndex, field, value) => {
    const updatedProducts = [...transaction.products];
    updatedProducts[productIndex].polythene[polytheneIndex][field] = value;
    
    // Recalculate individual and total fine when polythene weight changes
    updatedProducts[productIndex].fine = calculateFine(updatedProducts[productIndex]);
    const updatedTotalFine = calculateTotalFine();

    setTransaction({ ...transaction, products: updatedProducts, Totalfine: updatedTotalFine });
  };

  const addProduct = () => {
    setTransaction({
      ...transaction,
      products: [
        ...transaction.products,
        { name: '', grossWeight: 0, tunch: 0, wastage: 0, fine: 0, boxes: [{ quantity: 0, weight: 0 }], polythene: [{ quantity: 0, weight: 0 }] },
      ],
    });
  };

  const addBox = (productIndex) => {
    const updatedProducts = [...transaction.products];
    updatedProducts[productIndex].boxes.push({ quantity: 0, weight: 0 });
    setTransaction({ ...transaction, products: updatedProducts });
  };

  const addPolythene = (productIndex) => {
    const updatedProducts = [...transaction.products];
    updatedProducts[productIndex].polythene.push({ quantity: 0, weight: 0 });
    setTransaction({ ...transaction, products: updatedProducts });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Submit product give transaction (all products together)
      await axios.post(`${process.env.REACT_APP_BACKEND_URL}/product-give-transactions`, transaction);
  
      // Loop through each product to create individual material transactions
      for (let product of transaction.products) {
        const totalBoxWeight = product.boxes.reduce((sum, box) => sum + box.weight * box.quantity, 0);
        const totalPolytheneWeight = product.polythene.reduce((sum, poly) => sum + poly.weight * poly.quantity, 0);
        const netWeight = product.grossWeight - totalBoxWeight - totalPolytheneWeight;
        const tunch = parseFloat(product.tunch) || 0;
        const wastage = parseFloat(product.wastage) || 0;
        const fine = product.fine;
  
        // Prepare material transaction data for each product
        const materialTransaction = {
          nomineeId: transaction.nomineeId,
          product: product.name, // Use the name of each product
          netWeight,
          tunch,
          wastage,
          transType: 'Naam', // Adjust based on form or transaction type logic
          fine,
          description: transaction.description,
          mode:'metal',
          date: transaction.date

        };
  
        // Submit material transaction for each product
        await axios.post(`${process.env.REACT_APP_BACKEND_URL}/material-transactions`, materialTransaction);
      }
  
      alert('Material transactions for each product added successfully');
  
      // Reset form
      setTransaction({
        nomineeId: '',
        date: '',
        description: '',
        Totalfine: 0,
        products: [
          {
            name: '',
            grossWeight: 0,
            tunch: 0,
            wastage: 0,
            fine: 0,
            boxes: [{ quantity: 0, weight: 0 }],
            polythene: [{ quantity: 0, weight: 0 }],
          },
        ],
      });
      setSearchQuery('');
      generateInvoice();
    } catch (err) {
      alert('Error adding transaction');
    }
  };
  
  const removeBox = (productIndex, boxIndex) => {
    const updatedProducts = [...transaction.products];
    updatedProducts[productIndex].boxes.splice(boxIndex, 1);
    updatedProducts[productIndex].fine = calculateFine(updatedProducts[productIndex]);
    setTransaction({ ...transaction, products: updatedProducts, Totalfine: calculateTotalFine() });
  };

  const removePolythene = (productIndex, polytheneIndex) => {
    const updatedProducts = [...transaction.products];
    updatedProducts[productIndex].polythene.splice(polytheneIndex, 1);
    updatedProducts[productIndex].fine = calculateFine(updatedProducts[productIndex]);
    setTransaction({ ...transaction, products: updatedProducts, Totalfine: calculateTotalFine() });
  };

  const removeProduct = (productIndex) => {
    const updatedProducts = [...transaction.products];
    updatedProducts.splice(productIndex, 1);
    setTransaction({ ...transaction, products: updatedProducts, Totalfine: calculateTotalFine() });
  };
  const generateInvoice = () => {
    const date = transaction.date;
    const doc = new jsPDF();
  
    // Title and general info
    doc.setFontSize(18);
    doc.setFontSize(11);
    doc.text(`Nominee: ${nomineeName}`, 14, 20);
    doc.text(`Date: ${date}`, 14, 26);
   
  
    let currentY = 40;
    let overallGrossWeight = 0;
    let overallBoxWeight = 0;
    let overallPolytheneWeight = 0;
    let overallFine = 0;
  
    transaction.products.forEach((product, index) => {
      overallGrossWeight += Number(product.grossWeight);

      const totalBoxWeight = product.boxes.reduce((sum, box) => sum + box.weight * box.quantity, 0);
      const totalPolytheneWeight = product.polythene.reduce((sum, poly) => sum + poly.weight * poly.quantity, 0);
      overallBoxWeight += totalBoxWeight;
      overallPolytheneWeight += totalPolytheneWeight;
      overallFine += product.fine;
  
      doc.setFontSize(12);
      doc.text(`Product ${index + 1}: ${product.name}`, 14, currentY);
      currentY += 6;
  
      // Product details table with gross weight, tunch, wastage, and net fine
      
  
      // Box details table
      doc.text("Box Details", 14, currentY);
      currentY += 4;
      doc.autoTable({
        startY: currentY,
        head: [['#', 'Quantity', 'Weight per Box', 'Total Weight']],
        body: product.boxes.map((box, i) => [
          i + 1,
          box.quantity,
          box.weight,
          (box.quantity * box.weight).toFixed(2),
        ]),
        theme: 'grid',
        styles: { fontSize: 9 },
        headStyles: { fillColor: [180, 180, 255] },
        margin: { left: 14, right: 14 },
      });
      currentY = doc.lastAutoTable.finalY + 6;
  
      // Polythene details table
      doc.text("Polythene Details", 14, currentY);
      currentY += 4;
      doc.autoTable({
        startY: currentY,
        head: [['#', 'Quantity', 'Weight per Polythene', 'Total Weight']],
        body: product.polythene.map((poly, i) => [
          i + 1,
          poly.quantity,
          poly.weight,
          (poly.quantity * poly.weight).toFixed(2),
        ]),
        theme: 'grid',
        styles: { fontSize: 9 },
        headStyles: { fillColor: [180, 180, 255] },
        margin: { left: 14, right: 14 },
      });
      currentY = doc.lastAutoTable.finalY + 6;
      doc.autoTable({
        startY: currentY,
        head: [['Gross Weight', 'Box Weight', 'Polythene Weight', 'Tunch (%)', 'Wastage (%)', 'Net Fine']],
        body: [[
          product.grossWeight,
          product.boxes.reduce((sum, box) => sum + box.weight * box.quantity, 0), // Total Box Weight
          product.polythene.reduce((sum, poly) => sum + poly.weight * poly.quantity, 0), // Total Polythene Weight
          product.tunch,
          product.wastage,
          product.fine.toFixed(2),
        ]],
        theme: 'striped',
        styles: { fontSize: 9 },
        headStyles: { fillColor: [60, 100, 200] },
        margin: { left: 14, right: 14 },
      });
      currentY = doc.lastAutoTable.finalY + 8;
      
    });
  
    // Overall summary at the end of the PDF
    doc.setFontSize(12);
    doc.text("Overall Summary", 14, currentY);
    currentY += 6;
    doc.autoTable({
      startY: currentY,
      body: [
        ['Overall Gross Weight', overallGrossWeight],
        ['Overall Net Weight', overallGrossWeight - overallBoxWeight - overallPolytheneWeight],
        ['Overall Box Weight', overallBoxWeight],
        ['Overall Polythene Weight', overallPolytheneWeight],
        ['Overall Total Fine', overallFine.toFixed(2)],
      ],
      theme: 'plain',
      styles: { fontSize: 10, fontStyle: 'bold' },
      margin: { left: 14, right: 14 },
    });
  
    // Save the PDF
    doc.save(`Invoice-${nomineeName}-${date}-naam.pdf`);
  };
  
  return (
    <div className="max-w-lg mx-auto p-6 bg-white shadow-lg rounded-lg">
      <h2 className="text-2xl font-bold text-center mb-6">Bill</h2>

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
            className="w-full border border-gray-300 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        
        {transaction.products.map((product, productIndex) => (
  <div key={productIndex} className="p-4 border rounded-lg bg-gray-50 space-y-2">
    <h3 className="text-lg font-semibold text-gray-700">Product {productIndex + 1}</h3>
    
    {[{ id: 'name', label: 'Name', value: product.name }, { id: 'grossWeight', label: 'Gross Weight', value: product.grossWeight }, { id: 'tunch', label: 'Tunch', value: product.tunch }, { id: 'wastage', label: 'Wastage', value: product.wastage }].map((field) => (
      <div key={field.id}>
        <label className="block text-gray-700 font-medium mb-1" htmlFor={`${field.id}-${productIndex}`}>{field.label}</label>
        <input
          type={field.id === 'name' ? 'text' : 'number'}
          id={`${field.id}-${productIndex}`}
          placeholder={field.label}
          value={field.value}
          onChange={(e) => handleProductChange(productIndex, field.id, e.target.value)}
          className="w-full border border-gray-300 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
    ))}
              <button type="button" onClick={() => removeProduct(productIndex)} className="text-red-500">Remove Product</button>


    {/* Boxes Section within each Product */}
    <div className="mt-4">
      <h4 className="text-md font-semibold text-gray-700">Boxes</h4>
      {product.boxes.map((box, boxIndex) => (
        <div key={boxIndex} className="space-y-2">
          {[{ id: 'quantity', label: 'Quantity', value: box.quantity }, { id: 'weight', label: 'Weight', value: box.weight }].map((field) => (
            <div key={field.id}>
              <label className="block text-gray-700 font-medium mb-1" htmlFor={`${field.id}-box-${productIndex}-${boxIndex}`}>{field.label}</label>
              <input
                type="number"
                id={`${field.id}-box-${productIndex}-${boxIndex}`}
                placeholder={field.label}
                value={field.value}
                onChange={(e) => handleBoxChange(productIndex, boxIndex, field.id, e.target.value)}
                className="w-full border border-gray-300 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              
            </div>
            
          ))}
                          <button type="button" onClick={() => removeBox(productIndex, boxIndex)} className="text-red-500">Remove Box</button>

        </div>
      ))}
      <button type="button" onClick={() => addBox(productIndex)} className="mt-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-1 px-2 rounded-md">Add Another Box</button>
    </div>

    {/* Polythene Section within each Product */}
    <div className="mt-4">
      <h4 className="text-md font-semibold text-gray-700">Polythenes</h4>
      {product.polythene.map((polythene, polytheneIndex) => (
        <div key={polytheneIndex} className="space-y-2">
          {[{ id: 'quantity', label: 'Quantity', value: polythene.quantity }, { id: 'weight', label: 'Weight', value: polythene.weight }].map((field) => (
            <div key={field.id}>
              <label className="block text-gray-700 font-medium mb-1" htmlFor={`${field.id}-polythene-${productIndex}-${polytheneIndex}`}>{field.label}</label>
              <input
                type="number"
                id={`${field.id}-polythene-${productIndex}-${polytheneIndex}`}
                placeholder={field.label}
                value={field.value}
                onChange={(e) => handlePolytheneChange(productIndex, polytheneIndex, field.id, e.target.value)}
                className="w-full border border-gray-300 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          ))}
                          <button type="button" onClick={() => removePolythene(productIndex, polytheneIndex)} className="text-red-500">Remove Polythene</button>

        </div>
      ))}
      <button type="button" onClick={() => addPolythene(productIndex)} className="mt-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-1 px-2 rounded-md">Add Another Polythene</button>
    </div>

    {/* Fine field at the bottom of everything */}
    <div className="mt-4">
      <label className="block text-gray-700 font-medium mb-1" htmlFor={`fine-${productIndex}`}>Fine</label>
      <input
        type="number"
        id={`fine-${productIndex}`}
        placeholder="Fine"
        value={product.fine}
        readOnly
        className="w-full border border-gray-300 p-2 rounded-md bg-gray-100"
      />
    </div>
  </div>
))}

       
        <button type="button" onClick={addProduct} className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-2 px-4 rounded-md">Add Another Product</button>
        <div>
          <label className="block text-gray-700 font-medium mb-1" htmlFor="Totalfine">Total Fine</label>
          <input
            type="number"
            id="Totalfine"
            placeholder="Total Fine"
            value={transaction.Totalfine}
            readOnly
            className="w-full border border-gray-300 p-2 rounded-md bg-gray-100"
          />
        </div>

        <button type="submit" className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-md">Add Product Give Transaction</button>
         
      </form>
    </div>
  );
};

export default AddProductGiveTransaction;
