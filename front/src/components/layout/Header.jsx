import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import Logo from "../../assets/img/logo.jpg";

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { to: "/journals", label: "Jurnallar" },
    { to: "/articles", label: "Maqolalar" },
  ];

  const isActive = (path) => location.pathname.startsWith(path);

  return (
    <header className="bg-gradient-to-r from-blue-700 to-blue-900 shadow-lg">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-3">
            <img src={Logo} alt="BXU Logo" className="h-11 w-11 rounded-full bg-white object-contain p-1" />
            <div className="text-white">
              <h1 className="text-lg font-bold leading-tight">ILMIY JURNAL</h1>
              <p className="text-xs text-blue-200">Buxoro Xalqaro Universiteti</p>
            </div>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-6 md:flex">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`text-sm font-medium transition-colors ${
                  isActive(link.to)
                    ? "text-white underline underline-offset-4"
                    : "text-blue-100 hover:text-white"
                }`}
              >
                {link.label}
              </Link>
            ))}
            <Link
              to="/admin/login"
              className="rounded-lg bg-white px-5 py-2 text-sm font-semibold text-blue-700 shadow transition hover:bg-blue-50"
            >
              Kirish
            </Link>
          </nav>

          {/* Mobile burger */}
          <button className="text-white md:hidden" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="mt-3 flex flex-col gap-3 border-t border-blue-600 pt-3 md:hidden">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMenuOpen(false)}
                className="text-sm font-medium text-blue-100 hover:text-white"
              >
                {link.label}
              </Link>
            ))}
            <Link
              to="/admin/login"
              onClick={() => setMenuOpen(false)}
              className="w-fit rounded-lg bg-white px-5 py-2 text-sm font-semibold text-blue-700"
            >
              Kirish
            </Link>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
