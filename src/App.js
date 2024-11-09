import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './components/Home';
import AddNominee from './components/AddNominee';
import AddMaterialTransaction from './components/AddMaterialTransaction';
import AddProductGiveTransaction from './components/AddProductGiveTransaction';
import TransactionList from './components/TransactionList';
import NomineeTransactions from './components/NomineeTransactions';
import Navbar from './components/Navbar';
import EditTransaction from './components/EditTransaction';
import Login from './components/Login';
import { AuthProvider } from './components/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Navbar /> {/* Navbar will remain consistent across routes */}
        <Routes>
          <Route path="/login" element={<Login />} />
          
          {/* Protected Routes */}
          <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
          <Route path="/add-nominee" element={<ProtectedRoute><AddNominee /></ProtectedRoute>} />
          <Route path="/add-material-transaction" element={<ProtectedRoute><AddMaterialTransaction /></ProtectedRoute>} />
          <Route path="/add-product-give-transaction" element={<ProtectedRoute><AddProductGiveTransaction /></ProtectedRoute>} />
          <Route path="/transaction-list" element={<ProtectedRoute><TransactionList /></ProtectedRoute>} />
          <Route path="/nominee-transactions/:nomineeId" element={<ProtectedRoute><NomineeTransactions /></ProtectedRoute>} />
          <Route path="/edit-transaction/:id" element={<ProtectedRoute><EditTransaction /></ProtectedRoute>} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
