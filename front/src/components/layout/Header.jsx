import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, LogOut, User } from "lucide-react";
import Logo from "../../assets/img/logo.jpg";

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    setLoggedIn(!!localStorage.getItem("access_token"));
  }, [location]);

  const publicLinks = [
    { to: "/journals", label: "Jurnallar" },
    { to: "/articles", label: "Maqolalar" },
  ];

  const authLinks = [
    { to: "/submit",       label: "Maqola yuborish" },
    { to: "/my-articles",  label: "Mening maqolalarim" },
    { to: "/my-reviews",   label: "Retsenziyalarim" },
  ];

  const allLinks = loggedIn ? [...publicLinks, ...authLinks] : publicLinks;

  const isActive = (path) => location.pathname.startsWith(path);

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    setLoggedIn(false);
    navigate("/");
    setMenuOpen(false);
  };

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
          <nav className="hidden items-center gap-5 md:flex">
            {allLinks.map((link) => (
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

            {loggedIn ? (
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 rounded-lg border border-white/30 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/10"
              >
                <LogOut size={15} /> Chiqish
              </button>
            ) : (
              <Link
                to="/admin/login"
                className="flex items-center gap-1.5 rounded-lg bg-white px-5 py-2 text-sm font-semibold text-blue-700 shadow transition hover:bg-blue-50"
              >
                <User size={15} /> Kirish
              </Link>
            )}
          </nav>

          {/* Mobile burger */}
          <button className="text-white md:hidden" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="mt-3 flex flex-col gap-3 border-t border-blue-600 pt-3 md:hidden">
            {allLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMenuOpen(false)}
                className={`text-sm font-medium ${
                  isActive(link.to) ? "text-white underline underline-offset-4" : "text-blue-100 hover:text-white"
                }`}
              >
                {link.label}
              </Link>
            ))}
            {loggedIn ? (
              <button
                onClick={handleLogout}
                className="flex w-fit items-center gap-1.5 rounded-lg border border-white/30 px-4 py-2 text-sm font-medium text-white"
              >
                <LogOut size={15} /> Chiqish
              </button>
            ) : (
              <Link
                to="/admin/login"
                onClick={() => setMenuOpen(false)}
                className="w-fit rounded-lg bg-white px-5 py-2 text-sm font-semibold text-blue-700"
              >
                Kirish
              </Link>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
