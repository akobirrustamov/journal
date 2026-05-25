import React, { useEffect, useState } from "react";
import { FiAlignJustify } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { RiMoonFill, RiSunFill } from "react-icons/ri";
import { MdPerson } from "react-icons/md";
import ApiCall from "../../config";
import Dropdown from "../dropdown";

const ROLE_PATH = {
  ROLE_SUPERADMIN:    "/superadmin/default",
  ROLE_ADMIN:         "/superadmin/default",
  ROLE_JOURNAL_ADMIN: "/journal-admin/default",
  ROLE_EDITOR:        "/editor/default",
  ROLE_REVIEWER:      "/my-reviews",
  ROLE_AUTHOR:        "/my-articles",
  ROLE_USER:          "/my-articles",
  ROLE_READER:        "/",
};

export default function AdminNavbar({ onOpenSidenav, brandText }) {
  const navigate = useNavigate();
  const [darkmode, setDarkmode] = useState(false);
  const [admin, setAdmin] = useState(null);

  useEffect(() => {
    ApiCall("/api/v1/auth/decode", "GET")
      .then((res) => {
        if (!res?.data) { navigate("/login"); return; }
        setAdmin(res.data);
      })
      .catch(() => navigate("/login"));
  }, []);

  const logOut = () => {
    localStorage.clear();
    navigate("/login");
  };

  const changeRole = async (role) => {
    try {
      const res = await ApiCall(`/api/v1/auth/change-role/${role.id}`, "PUT");
      if (res?.data) setAdmin(res.data);
      navigate(ROLE_PATH[role.name] || "/login");
    } catch {
      navigate("/login");
    }
  };

  return (
    <nav className="sticky top-4 z-40 mx-auto flex w-[calc(100%-2rem)] max-w-[1600px] items-center justify-between rounded-2xl bg-white/80 p-2 shadow-lg backdrop-blur-xl dark:bg-[#0b1437]/80 sm:p-3 md:p-4">
      <div className="flex items-center gap-3">
        <button
          className="rounded-lg p-1.5 text-gray-600 hover:bg-gray-100 dark:text-gray-300 xl:hidden"
          onClick={onOpenSidenav}
        >
          <FiAlignJustify className="h-5 w-5" />
        </button>
        <p className="text-xl font-bold text-gray-800 dark:text-white sm:text-2xl">
          {brandText}
        </p>
      </div>

      <div className="flex items-center gap-2">
        <button
          className="rounded-full bg-gray-200 p-2 text-gray-700 transition hover:bg-gray-300 dark:bg-gray-700 dark:text-yellow-400"
          onClick={() => {
            document.body.classList.toggle("dark");
            setDarkmode((d) => !d);
          }}
        >
          {darkmode ? <RiSunFill className="h-5 w-5" /> : <RiMoonFill className="h-5 w-5" />}
        </button>

        <Dropdown
          button={
            <button className="flex items-center gap-2 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 p-1.5 text-white shadow-md transition hover:shadow-lg sm:p-2">
              <MdPerson className="h-6 w-6 sm:h-7 sm:w-7" />
            </button>
          }
          children={
            <div className="min-w-[260px] rounded-2xl bg-white shadow-2xl ring-1 ring-black/5 dark:bg-gray-800 dark:ring-white/10">
              <div className="border-b border-gray-200 px-4 py-3 dark:border-gray-700">
                <p className="font-semibold text-gray-800 dark:text-white">{admin?.name}</p>
                <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                  {admin?.activeRole?.name?.replace("ROLE_", "") || "—"}
                </p>
              </div>

              {admin?.roles?.length > 1 && (
                <div className="px-2 py-3">
                  <p className="mb-2 px-2 text-xs font-medium uppercase tracking-wider text-gray-400">
                    Rolni almashtirish
                  </p>
                  <div className="max-h-48 space-y-1 overflow-y-auto">
                    {admin.roles.map((role) => (
                      <button
                        key={role.id}
                        onClick={() => changeRole(role)}
                        className={`w-full rounded-xl px-3 py-2 text-left text-sm font-medium transition ${
                          String(admin?.activeRole?.id) === String(role.id)
                            ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow"
                            : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                        }`}
                      >
                        <span className="flex items-center justify-between">
                          {role.name.replace("ROLE_", "")}
                          {String(admin?.activeRole?.id) === String(role.id) && (
                            <span className="text-xs opacity-75">✓ Faol</span>
                          )}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="border-t border-gray-200 p-3 dark:border-gray-700">
                <button
                  onClick={logOut}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-500 hover:text-white dark:bg-red-500/20 dark:text-red-400"
                >
                  Tizimdan chiqish
                </button>
              </div>
            </div>
          }
        />
      </div>
    </nav>
  );
}
