import React, { useState, useEffect } from "react";
import { Link, useLocation, matchPath } from "react-router-dom";
import { HiX, HiLogout } from "react-icons/hi";
import routes from "../../../routes/editor";

export default function EditorSidebar({ open, onClose }) {
  const location = useLocation();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const isActive = (fullPath) =>
    matchPath({ path: fullPath, end: false }, location.pathname);

  const handleClick = () => { if (isMobile) onClose(); };

  return (
    <>
      {open && isMobile && (
        <div className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm" onClick={onClose} />
      )}

      <div className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-white shadow-lg transition-transform duration-300 dark:bg-gray-900 ${open ? "translate-x-0" : "-translate-x-full"}`}>
        {isMobile && (
          <button onClick={onClose} className="absolute right-3 top-3 rounded p-1 text-gray-500 hover:bg-gray-100">
            <HiX size={20} />
          </button>
        )}

        <div className="border-b border-gray-200 px-6 py-4 dark:border-gray-800">
          <span className="text-base font-semibold tracking-tight text-gray-800 dark:text-white">
            ILMIY.BXU.UZ
          </span>
          <div className="mt-2 inline-flex items-center rounded-full bg-teal-100 px-2.5 py-0.5 text-xs font-semibold text-teal-700">
            MUHARRIR (EDITOR)
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-6">
          <div className="space-y-1">
            {routes.filter((r) => r.layout === "/editor" && !r.hidden).map((route, i) => {
              const fullPath = route.layout + "/" + route.path;
              return (
                <Link key={i} to={fullPath} onClick={handleClick}>
                  <div className={`flex cursor-pointer items-center rounded px-4 py-2 transition-colors ${isActive(fullPath) ? "bg-teal-50 font-medium text-teal-700" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"}`}>
                    <span className="mr-3 text-lg">{route.icon}</span>
                    <p className="text-sm">{route.name}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        <div className="border-t border-gray-200 p-4 dark:border-gray-800">
          <button
            onClick={() => { localStorage.clear(); window.location.href = "/login"; }}
            className="flex w-full items-center justify-center gap-2 rounded border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-100"
          >
            <HiLogout size={16} />
            <span>Tizimdan chiqish</span>
          </button>
        </div>
      </div>
    </>
  );
}
