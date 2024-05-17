import React from 'react';
import { Link } from 'react-router-dom';

const Header = () => {
  return (
    <header className="bg-gray-800 text-white py-4 flex justify-between items-center">
      <div className="ml-4">
        <Link to="/" className="text-xl font-bold">SATS</Link>
      </div>
      <div className="mr-4">
        <Link to="/login" className="text-sm font-semibold bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded">Login</Link>
      </div>
    </header>
  );
};

export default Header;
