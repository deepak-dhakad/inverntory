import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import jsPDF from "jspdf";
import "jspdf-autotable";

const NomineeTransactions = () => {
  const { nomineeId } = useParams();
  const [transactions, setTransactions] = useState([]);
  const [nomineeName, setNomineeName] = useState("");
  const [nomineeType, setNomineeType] = useState(""); // "Product" or "Material"
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  useEffect(() => {
    fetchNomineeTransactions();
  }, [startDate, endDate]);

  const fetchNomineeTransactions = async (reset = false) => {
    try {
      const params = reset ? {} : { startDate, endDate };
      const response = await axios.get(
        `http://localhost:5000/api/transactions/by-nominee/${nomineeId}`,
        {
          params,
        }
      );
      setTransactions(response.data.transactions);
      setNomineeName(response.data.nomineeName);
      setNomineeType(response.data.nomineeType); // Fetch nomineeType as well
    } catch (error) {
      console.error("Error fetching transactions:", error);
    }
  };
  const handleReset = () => {
    setStartDate("");
    setEndDate("");
    fetchNomineeTransactions(true); // Pass true to fetch all transactions without filters
  };
  const calculateNetWeight = (product) => {
    const totalBoxWeight = product.boxes.reduce(
      (sum, box) => sum + box.weight * box.quantity,
      0
    );
    const totalPolytheneWeight = product.polythene.reduce(
      (sum, poly) => sum + poly.weight * poly.quantity,
      0
    );
    return product.grossWeight - totalBoxWeight - totalPolytheneWeight;
  };

  const downloadPDF = () => {
    if (nomineeType === "Product") {
    } else {
      generateMaterialPDF();
    }
  };

  

  const generateMaterialPDF = () => {
    const doc = new jsPDF();

    // Header Title
    const title = `Material Transactions for ${nomineeName}`;
    doc.setFontSize(16);
    doc.text(title, 14, 16);

    // Current Date and Filtered Date Range
    const currentDate = new Date().toLocaleDateString();
    doc.setFontSize(10);
    doc.text(`Date: ${currentDate}`, 14, 24);
    if (startDate || endDate) {
      const start = startDate
        ? new Date(startDate).toLocaleDateString()
        : "N/A";
      const end = endDate ? new Date(endDate).toLocaleDateString() : "N/A";
      doc.text(`Statement from ${start} - ${end}`, 14, 32);
    }

    // Separate transactions by TransType
    const naamTransactions = transactions.filter(
      (trans) => trans.transType === "Naam"
    );
    const jamaTransactions = transactions.filter(
      (trans) => trans.transType === "Jama"
    );
    let currentY = 40;

    // Section for "Naam" Transactions
    if (naamTransactions.length > 0) {
      doc.setFontSize(12);
      doc.setTextColor(46, 204, 113); // Green text for Naam
      doc.text("Naam Transactions", 14, currentY);
      currentY += 8;

      const naamTableData = naamTransactions.map((trans, index) => [
        index + 1,
        new Date(trans.date).toLocaleDateString(),
        trans.product,
        trans.netWeight || "N/A",
        trans.tunch || "N/A",
        trans.wastage || "N/A",
        trans.fine || "N/A",
        trans.amount || "N/A",
        trans.description || "N/A",
      ]);

      doc.autoTable({
        head: [
          [
            "#",
            "Date",
            "Product",
            "Net Weight",
            "Tunch (%)",
            "Wastage (%)",
            "Fine",
            "Amount",
            "Description",
          ],
        ],
        body: naamTableData,
        startY: currentY,
        theme: "striped",
        headStyles: { fillColor: [0, 102, 204] }, // Darkened blue for table header
        styles: { fontSize: 9 },
      });

      currentY = doc.lastAutoTable.finalY + 10;
    } else {
      doc.setTextColor(46, 204, 113); // Green text for Naam
      doc.text("No Naam Transactions found.", 14, currentY);
      currentY += 10;
    }

    // Section for "Jama" Transactions
    if (jamaTransactions.length > 0) {
      doc.setFontSize(12);
      doc.setTextColor(60, 100, 200); // Blue text for Jama
      doc.text("Jama Transactions", 14, currentY);
      currentY += 8;

      const jamaTableData = jamaTransactions.map((trans, index) => [
        index + 1,
        new Date(trans.date).toLocaleDateString(),
        trans.product,
        trans.netWeight || "N/A",
        trans.tunch || "N/A",
        trans.wastage || "N/A",
        trans.fine || "N/A",
        trans.amount || "N/A",
        trans.description || "N/A",
      ]);

      doc.autoTable({
        head: [
          [
            "#",
            "Date",
            "Product",
            "Net Weight",
            "Tunch (%)",
            "Wastage (%)",
            "Fine",
            "Amount",
            "Description",
          ],
        ],
        body: jamaTableData,
        startY: currentY,
        theme: "striped",
        headStyles: { fillColor: [0, 102, 204] }, // Darkened blue for table header
        styles: { fontSize: 9 },
      });

      currentY = doc.lastAutoTable.finalY + 10;
    } else {
      doc.setTextColor(60, 100, 200); // Blue text for Jama
      doc.text("No Jama Transactions found.", 14, currentY);
      currentY += 10;
    }

    // Overall Balance Calculations
    const overallFineNaam = naamTransactions.reduce(
      (sum, trans) => sum + (trans.fine || 0),
      0
    );
    const overallFineJama = jamaTransactions.reduce(
      (sum, trans) => sum + (trans.fine || 0),
      0
    );
    const overallAmountNaam = naamTransactions.reduce(
      (sum, trans) => sum + (trans.amount || 0),
      0
    );

    // Net balance formatted
    const netFineBalance = (overallFineNaam - overallFineJama).toFixed(2);
    const netBalance = `${netFineBalance} gm (Fine) and ${overallAmountNaam.toFixed(
      2
    )} Rs`;

    // Display Overall Summary
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0); // Black for summary text
    doc.text("Overall Summary", 14, currentY);
    doc.autoTable({
      startY: currentY + 6,
      body: [
        ["Total Fine (Naam)", overallFineNaam.toFixed(2)],
        ["Total Fine (Jama)", overallFineJama.toFixed(2)],
        ["Total Amount (Naam)", overallAmountNaam.toFixed(2)],
        ["Net Balance", netBalance],
      ],
      theme: "plain",
      styles: { fontSize: 10, fontStyle: "bold" },
      margin: { left: 14, right: 14 },
    });

    // Save the PDF
    doc.save(`Material_Transactions_${nomineeName}_${currentDate}.pdf`);
  };
  
  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-3xl font-bold text-center mb-6">
        Transactions for {nomineeName}
      </h2>

      <div className="mb-6 flex gap-4">
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="border border-gray-300 p-2 rounded-md focus:ring focus:ring-blue-300"
        />
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="border border-gray-300 p-2 rounded-md focus:ring focus:ring-blue-300"
        />
        <button
          onClick={fetchNomineeTransactions}
          className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-md"
        >
          Filter
        </button>
        <button
          onClick={handleReset}
          className="bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-md"
        >
          Reset
        </button>
        <button
          onClick={downloadPDF}
          className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-md"
        >
          Download PDF
        </button>
      </div>

      
        // Material Transactions
        <div>
          <h3 className="text-xl font-semibold text-center mb-4">
            Material Transactions
          </h3>
          <div className="flex gap-6">
            {/* Naam Transactions */}
            <div className="w-1/2">
              <h4 className="text-lg font-semibold text-center mb-2">
                Naam Transactions
              </h4>
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white shadow-md rounded-md">
                  <thead>
                    <tr>
                      <th className="px-4 py-2 text-left border-b">Date</th>
                      <th className="px-4 py-2 text-left border-b">Product</th>
                      <th className="px-4 py-2 text-left border-b">
                        Net Weight
                      </th>
                      <th className="px-4 py-2 text-left border-b">Tunch</th>
                      <th className="px-4 py-2 text-left border-b">Wastage</th>
                      <th className="px-4 py-2 text-left border-b">Fine</th>
                      <th className="px-4 py-2 text-left border-b">Amount</th>
                      <th className="px-4 py-2 text-left border-b">
                        Description
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions
                      .filter(
                        (trans) =>
                          trans.type === "Material" &&
                          trans.transType === "Naam"
                      )
                      .map((transaction, index) => (
                        <tr
                          key={index}
                          className="bg-gray-100 hover:bg-gray-200"
                        >
                          <td className="px-4 py-2 border-b">
                            {new Date(transaction.date).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-2 border-b">
                            {transaction.product}
                          </td>
                          <td className="px-4 py-2 border-b">
                            {transaction.netWeight}
                          </td>
                          <td className="px-4 py-2 border-b">
                            {transaction.tunch}
                          </td>
                          <td className="px-4 py-2 border-b">
                            {transaction.wastage}
                          </td>
                          <td className="px-4 py-2 border-b">
                            {transaction.fine}
                          </td>
                          <td className="px-4 py-2 border-b">
                            {transaction.amount}
                          </td>
                          <td className="px-4 py-2 border-b">
                            {transaction.description}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Jama Transactions */}
            <div className="w-1/2">
              <h4 className="text-lg font-semibold text-center mb-2">
                Jama Transactions
              </h4>
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white shadow-md rounded-md">
                  <thead>
                    <tr>
                      <th className="px-4 py-2 text-left border-b">Date</th>
                      <th className="px-4 py-2 text-left border-b">Product</th>
                      <th className="px-4 py-2 text-left border-b">
                        Net Weight
                      </th>
                      <th className="px-4 py-2 text-left border-b">Tunch</th>
                      <th className="px-4 py-2 text-left border-b">Wastage</th>
                      <th className="px-4 py-2 text-left border-b">Fine</th>
                      <th className="px-4 py-2 text-left border-b">Amount</th>
                      <th className="px-4 py-2 text-left border-b">
                        Description
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions
                      .filter(
                        (trans) =>
                          trans.type === "Material" &&
                          trans.transType === "Jama"
                      )
                      .map((transaction, index) => (
                        <tr
                          key={index}
                          className="bg-gray-100 hover:bg-gray-200"
                        >
                          <td className="px-4 py-2 border-b">
                            {new Date(transaction.date).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-2 border-b">
                            {transaction.product}
                          </td>
                          <td className="px-4 py-2 border-b">
                            {transaction.netWeight}
                          </td>
                          <td className="px-4 py-2 border-b">
                            {transaction.tunch}
                          </td>
                          <td className="px-4 py-2 border-b">
                            {transaction.wastage}
                          </td>
                          <td className="px-4 py-2 border-b">
                            {transaction.fine}
                          </td>
                          <td className="px-4 py-2 border-b">
                            {transaction.amount}
                          </td>
                          <td className="px-4 py-2 border-b">
                            {transaction.description}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      
    </div>
  );
};

export default NomineeTransactions;
