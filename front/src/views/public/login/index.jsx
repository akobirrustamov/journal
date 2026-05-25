import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import ApiCall from "../../../config/index";
import Logo from "../../../assets/img/logo.jpg";

export default function PublicLogin() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ phone: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleChange = (e) => {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
    setErrorMsg("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");
    try {
      const res = await ApiCall("/api/v1/auth/login", "POST", form, null, false);

      if (!res || res.error) {
        setErrorMsg("Login yoki parol xato. Qaytadan urinib ko'ring.");
        return;
      }

      const data = res.data;
      const roles = data?.roles || [];
      const activeRole = data?.activeRole?.name || roles[0]?.name || "";

      const ADMIN_ROLES = ["ROLE_SUPERADMIN", "ROLE_ADMIN"];
      if (ADMIN_ROLES.includes(activeRole)) {
        setErrorMsg("Login yoki parol xato. Qaytadan urinib ko'ring.");
        return;
      }

      if (data?.access_token) {
        localStorage.setItem("access_token", data.access_token);
        if (data.refresh_token) localStorage.setItem("refresh_token", data.refresh_token);
      }

      if (activeRole === "ROLE_JOURNAL_ADMIN")
        navigate("/journal-admin/default");
      else if (activeRole === "ROLE_EDITOR")
        navigate("/editor/default");
      else if (activeRole === "ROLE_REVIEWER")
        navigate("/my-reviews");
      else
        navigate("/my-articles");
    } catch {
      setErrorMsg("Server bilan bog'lanishda xatolik yuz berdi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-blue-700 to-indigo-900">
      {/* Top bar */}
      <div className="px-6 py-4">
        <Link to="/" className="flex w-fit items-center gap-3">
          <img src={Logo} alt="BXU" className="h-10 w-10 rounded-full bg-white object-contain p-0.5" />
          <span className="text-lg font-bold text-white">ILMIY JURNAL</span>
        </Link>
      </div>

      {/* Card */}
      <div className="flex flex-1 items-center justify-center px-4 py-10">
        <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
              <img src={Logo} alt="BXU" className="h-14 w-14 rounded-full object-contain" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800">Tizimga kirish</h1>
            <p className="mt-1 text-sm text-gray-500">
              BXU Ilmiy Jurnallar platformasi
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Login (telefon yoki email) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                required
                autoComplete="username"
                placeholder="Login yoki telefon raqamingiz"
                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Parol <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                required
                autoComplete="current-password"
                placeholder="Parolingizni kiriting"
                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
              />
            </div>

            {errorMsg && (
              <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
                <p>{errorMsg}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 py-3 text-sm font-semibold text-white shadow transition hover:from-blue-700 hover:to-blue-800 disabled:opacity-60"
            >
              {loading ? "Yuklanmoqda..." : "Kirish"}
            </button>
          </form>

          <div className="mt-6 space-y-3 border-t border-gray-100 pt-5 text-center text-sm text-gray-500">
            <p>
              Maqola yuborish uchun avval ro'yxatdan o'ting yoki
              administrator bilan bog'laning.
            </p>
            <Link
              to="/"
              className="inline-block font-medium text-blue-600 hover:underline"
            >
              ← Bosh sahifaga qaytish
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
