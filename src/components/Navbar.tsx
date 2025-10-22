import React, { useState } from 'react';
import { Menu, X } from 'lucide-react'; // or import { FaBars, FaTimes } from "react-icons/fa";
import { useAuth } from '../context/AuthContext';

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="bg-white shadow-md fixed w-full z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <h1 className="text-2xl font-bold text-indigo-600">TaskFlow</h1>

          {/* Desktop Menu */}
          <div className="hidden sm:flex items-center space-x-4">
            <span className="text-gray-700 font-medium">Hello, {user?.name}</span>
            <button
              onClick={logout}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
            >
              Logout
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="sm:hidden text-gray-700 hover:text-indigo-600 transition"
          >
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {menuOpen && (
        <div className="sm:hidden bg-white shadow-md border-t border-gray-200">
          <div className="flex flex-col px-4 py-3 space-y-3">
            <span className="text-gray-700 font-medium">Hello, {user?.name}</span>
            <button
              onClick={logout}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
            >
              Logout
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
