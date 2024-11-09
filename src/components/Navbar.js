import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from './AuthContext'; // Ensure to import your AuthContext here

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { logout } = useContext(AuthContext); // Access the logout function from AuthContext
  
  const navItems = [
    { name: 'Home', path: '/' },
    { name: 'Add Nominee', path: '/add-nominee' },
    { name: 'Add Transaction', path: '/add-material-transaction' },
    { name: ' Bill', path: '/add-product-give-transaction' },
    { name: 'Transaction List', path: '/transaction-list' },
  ];

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleLogout = () => {
    logout(); // Call the logout function from AuthContext
    navigate('/login'); // Redirect to the login page after logout
  };

  return (
    <nav className="mb-10 bg-white shadow-md">
      <div className="container mx-auto flex items-center justify-between p-4">
        <h1 className="text-2xl font-bold text-blue-600">
          <Link to="/" className="no-underline">
            Hans Rajkumar
          </Link>
        </h1>

        {/* Mobile Menu Toggle Button */}
        <button
          onClick={toggleMobileMenu}
          className="sm:hidden text-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7"></path>
          </svg>
        </button>

        {/* Desktop Menu */}
        <ul className="hidden sm:flex gap-6 text-lg font-medium items-center">
          {navItems.map((item, index) => (
            <li key={index}>
              <Link to={item.path} className="text-blue-500 hover:text-blue-700">
                {item.name}
              </Link>
            </li>
          ))}
          <li>
            <button onClick={handleLogout} className="text-red-500 hover:text-red-700 font-medium">
              Logout
            </button>
          </li>
        </ul>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <ul className="sm:hidden flex flex-col items-center gap-4 text-lg font-medium bg-gray-100 p-4">
          {navItems.map((item, index) => (
            <li key={index}>
              <Link
                to={item.path}
                onClick={toggleMobileMenu} // Close menu on item click
                className="text-blue-500 hover:text-blue-700"
              >
                {item.name}
              </Link>
            </li>
          ))}
          <li>
            <button onClick={() => { handleLogout(); toggleMobileMenu(); }} className="text-red-500 hover:text-red-700 font-medium">
              Logout
            </button>
          </li>
        </ul>
      )}
    </nav>
  );
};

export default Navbar;
