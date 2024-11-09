import React, { useState, useEffect } from "react";
import { useParams ,useNavigate} from "react-router-dom";
import axios from "axios";
import jsPDF from "jspdf";
import "jspdf-autotable";

const NomineeTransactions = () => {
  const navigate = useNavigate();

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
        `${process.env.REACT_APP_BACKEND_URL}/transactions/by-nominee/${nomineeId}`,
        { params }
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
    fetchNomineeTransactions(true);
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
    const title = `Transactions for ${nomineeName}`;
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
      doc.text("Lena Transactions", 14, currentY);
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
    const overallAmountJama = jamaTransactions.reduce(
      (sum, trans) => sum + (trans.amount || 0),
      0
    );

    // Net balance formatted
    const netFineBalance = (overallFineNaam - overallFineJama).toFixed(2);
    const netAmountBalance = (overallAmountJama - overallAmountNaam).toFixed(2);
    const displayAmountBalance = netAmountBalance < 0 ? Math.abs(netAmountBalance) : -netAmountBalance;
const netBalance = `${netFineBalance} gm (Fine) and ${displayAmountBalance} Rs`;

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
        ["Total Amount (Jama)", overallAmountJama.toFixed(2)],
        ["Net Balance", netBalance],
      ],
      theme: "plain",
      styles: { fontSize: 10, fontStyle: "bold" },
      margin: { left: 14, right: 14 },
    });

    // Save the PDF
    doc.save(`Material_Transactions_${nomineeName}_${currentDate}.pdf`);
  };
  // Define transactionSections here so it's accessible in JSX and generateMaterialPDF
  const transactionSections = [
    { title: "Naam Transactions", transactions: transactions.filter(trans => trans.transType === "Naam") },
    { title: "Jama Transactions", transactions: transactions.filter(trans => trans.transType === "Jama") },
  ];
  const handleDeleteTransaction = async (transactionId) => {
    const confirmed = window.confirm("Are you sure you want to delete this transaction?");
    if (!confirmed) return; // If the user cancels, exit the function
  
    try {
      await axios.delete(`${process.env.REACT_APP_BACKEND_URL}/transactions/${transactionId}`, {
        params: { type: 'Material' },
      });
      fetchNomineeTransactions();
    } catch (error) {
      console.error('Error deleting transaction:', error);
    }
  };
  
  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl sm:text-3xl font-bold text-center mb-4 sm:mb-6">
        Transactions for {nomineeName}
      </h2>
  
      <div className="mb-6 flex flex-wrap gap-3 items-center">
  <div className="flex-1 min-w-[45%]">
    <input
      type="date"
      value={startDate}
      onChange={(e) => setStartDate(e.target.value)}
      className="w-full border border-gray-300 p-2 rounded-md focus:ring focus:ring-blue-300"
      placeholder="Start Date"
    />
  </div>
  <div className="flex-1 min-w-[45%]">
    <input
      type="date"
      value={endDate}
      onChange={(e) => setEndDate(e.target.value)}
      className="w-full border border-gray-300 p-2 rounded-md focus:ring focus:ring-blue-300"
      placeholder="End Date"
    />
  </div>
  <div className="flex-1 flex gap-3 min-w-full sm:min-w-[45%] mt-3 sm:mt-0">
    <button
      onClick={handleReset}
      className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 rounded-md"
    >
      Reset
    </button>
    <button
      onClick={downloadPDF}
      className="flex-1 bg-green-500 hover:bg-green-600 text-white font-semibold py-2 rounded-md"
    >
      Download PDF
    </button>
  </div>
</div>

  
      <div>
        <h3 className="text-lg sm:text-xl font-semibold text-center mb-4">
          Material Transactions
        </h3>
        <div className="flex flex-col lg:flex-row gap-6">
          {transactionSections.map((section, idx) => (
            <div className="w-full lg:w-1/2" key={idx}>
              <h4 className="text-lg font-semibold text-center mb-4">
                {section.title}
              </h4>
              <div className="space-y-4">
                {section.transactions.length > 0 ? (
                  section.transactions.map((transaction, index) => (
                    <div
                      key={index}
                      className="bg-gray-100 p-4 rounded-lg shadow hover:shadow-md transition-shadow"
                    >
                      <div className="mb-2 text-sm text-gray-500">
                        Date: {new Date(transaction.date).toLocaleDateString()}
                      </div>
                      <div className="mb-2 text-lg font-semibold">
                        Product: {transaction.product}
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>Pieces: {transaction.pieces || "N/A"}</div>
                        <div>Net Weight: {transaction.netWeight}</div>
                        <div>Tunch: {transaction.tunch}</div>
                        <div>Wastage: {transaction.wastage}</div>
                        <div>Fine: {transaction.fine}</div>
                        <div>Bhav: {transaction.bhav}</div>
                        <div>Badla: {transaction.badla}</div>
                        <div>Amount: {transaction.amount}</div>
                        <div>Description: {transaction.description}</div>
                      </div>
                      <div className="flex justify-end mt-4 space-x-3">
                        <button
                          onClick={() => navigate(`/edit-transaction/${transaction._id}`)}
                          className="bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-1 px-3 rounded-md"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteTransaction(transaction._id)}
                          className="bg-red-500 hover:bg-red-600 text-white font-semibold py-1 px-3 rounded-md"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-gray-500">
                    No transactions available
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};  

export default NomineeTransactions;
