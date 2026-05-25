import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { User, Phone, Mail, Building, Globe, BookOpen, Shield, Eye, EyeOff } from "lucide-react";
import ApiCall, { baseUrl } from "../../../config/index";
import Header from "../../../components/layout/Header";
import Footer from "../../../components/layout/Footer";

const ROLE_LABELS = {
  ROLE_SUPERADMIN: "Super Admin",
  ROLE_ADMIN: "Admin",
  ROLE_JOURNAL_ADMIN: "Jurnal Admin",
  ROLE_EDITOR: "Muharrir",
  ROLE_REVIEWER: "Retsenzent",
  ROLE_AUTHOR: "Muallif",
};

export default function ProfilePage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [pwLoading, setPwLoading] = useState(false);
  const [pwMsg, setPwMsg] = useState({ type: "", text: "" });

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) { navigate("/login"); return; }

    ApiCall("/api/v1/auth/decode", "GET").then((res) => {
      const u = res.data?.data || res.data;
      if (!res.error && u?.id) setUser(u);
      else navigate("/login");
    }).finally(() => setLoading(false));
  }, [navigate]);

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPwMsg({ type: "", text: "" });
    if (password.length < 6) {
      setPwMsg({ type: "error", text: "Parol kamida 6 ta belgidan iborat bo'lishi kerak." });
      return;
    }
    if (password !== confirmPassword) {
      setPwMsg({ type: "error", text: "Parollar mos kelmaydi." });
      return;
    }
    setPwLoading(true);
    try {
      const res = await ApiCall(`/api/v1/auth/password/${user.id}`, "PUT", { password });
      if (res.error) throw new Error(res.data?.message || "Xatolik yuz berdi");
      setPwMsg({ type: "success", text: "Parol muvaffaqiyatli yangilandi!" });
      setPassword("");
      setConfirmPassword("");
    } catch (err) {
      setPwMsg({ type: "error", text: err.message || "Xatolik yuz berdi" });
    } finally {
      setPwLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <div className="flex flex-1 items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600" />
        </div>
        <Footer />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <Helmet>
        <title>Profilim | BXU Journal</title>
      </Helmet>
      <Header />

      <div className="bg-gradient-to-br from-blue-700 to-indigo-800 px-4 py-10 text-white">
        <div className="container mx-auto max-w-3xl">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/20">
              <User className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">{user.name || user.phone}</h1>
              <p className="text-blue-200">{user.phone}</p>
            </div>
          </div>
        </div>
      </div>

      <main className="container mx-auto max-w-3xl flex-1 px-4 py-8 space-y-6">
        {/* Profile info */}
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="mb-5 text-lg font-bold text-gray-800">Profil ma'lumotlari</h2>
          <dl className="space-y-4">
            <InfoRow icon={<User size={16} />} label="Ism" value={user.name} />
            <InfoRow icon={<Phone size={16} />} label="Telefon (login)" value={user.phone} />
            <InfoRow icon={<Mail size={16} />} label="E-mail" value={user.email} />
            <InfoRow icon={<Building size={16} />} label="Tashkilot" value={user.affiliation} />
            <InfoRow icon={<Globe size={16} />} label="Mamlakat" value={user.country} />
            <InfoRow icon={<BookOpen size={16} />} label="ORCID" value={user.orcid} />
            {user.bio && (
              <div>
                <dt className="mb-1 flex items-center gap-2 text-xs font-medium text-gray-400">
                  <BookOpen size={16} /> Bio
                </dt>
                <dd className="text-sm text-gray-700 leading-relaxed">{user.bio}</dd>
              </div>
            )}
          </dl>

          {/* Roles */}
          {user.roles?.length > 0 && (
            <div className="mt-5 border-t border-gray-100 pt-4">
              <p className="mb-2 flex items-center gap-2 text-xs font-medium text-gray-400">
                <Shield size={16} /> Rollar
              </p>
              <div className="flex flex-wrap gap-2">
                {user.roles.map((r) => (
                  <span
                    key={r.name || r.id}
                    className="rounded-full bg-blue-100 px-3 py-0.5 text-xs font-medium text-blue-700"
                  >
                    {ROLE_LABELS[r.name] || r.name}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Password change */}
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="mb-5 text-lg font-bold text-gray-800">Parolni o'zgartirish</h2>
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Yangi parol</label>
              <div className="relative">
                <input
                  type={showPw ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Kamida 6 ta belgi"
                  className="w-full rounded-lg border border-gray-200 px-4 py-2.5 pr-10 text-sm focus:border-blue-400 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPw((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Parolni tasdiqlang</label>
              <input
                type={showPw ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Parolni qayta kiriting"
                className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm focus:border-blue-400 focus:outline-none"
              />
            </div>

            {pwMsg.text && (
              <div className={`rounded-lg px-4 py-2.5 text-sm ${
                pwMsg.type === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
              }`}>
                {pwMsg.text}
              </div>
            )}

            <button
              type="submit"
              disabled={pwLoading}
              className="w-full rounded-lg bg-blue-600 py-2.5 font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
            >
              {pwLoading ? "Saqlanmoqda..." : "Parolni saqlash"}
            </button>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
}

function InfoRow({ icon, label, value }) {
  if (!value) return null;
  return (
    <div className="flex gap-3">
      <dt className="flex min-w-[140px] items-center gap-2 text-xs font-medium text-gray-400">
        {icon} {label}
      </dt>
      <dd className="text-sm text-gray-700">{value}</dd>
    </div>
  );
}
