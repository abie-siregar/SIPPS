import React, { useState } from "react";
import "../App.css";

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <header className="bg-blue-600 text-white p-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        {/* Logo atau Nama Website */}
        <a href="/" className="text-2xl font-bold">
          SIPPS
        </a>

        {/* Tombol Hamburger untuk Mobile */}
        <div className="md:hidden">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="text-white focus:outline-none"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              {isOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>

        {/* Navigasi Desktop */}
        <nav className="hidden md:flex space-x-4">
          <a href="/beranda" className="hover:text-blue-200">
            Beranda
          </a>
          <a href="/tentang" className="hover:text-blue-200">
            Tentang Kami
          </a>
          <a href="/layanan" className="hover:text-blue-200">
            Layanan
          </a>
          <a href="/kontak" className="hover:text-blue-200">
            Kontak
          </a>
        </nav>
      </div>

      {/* Navigasi Mobile (Tampil saat isOpen true) */}
      {isOpen && (
        <nav className="md:hidden mt-4 bg-blue-700 p-4 rounded-md">
          <a
            href="/beranda"
            className="block py-2 hover:bg-blue-600 rounded-md"
          >
            Beranda
          </a>
          <a
            href="/tentang"
            className="block py-2 hover:bg-blue-600 rounded-md"
          >
            Tentang Kami
          </a>
          <a
            href="/layanan"
            className="block py-2 hover:bg-blue-600 rounded-md"
          >
            Layanan
          </a>
          <a href="/kontak" className="block py-2 hover:bg-blue-600 rounded-md">
            Kontak
          </a>
        </nav>
      )}
    </header>
  );
};

export default Header; // <-- PASTIKAN JUGA INI MENGEKSPOR 'Header'
