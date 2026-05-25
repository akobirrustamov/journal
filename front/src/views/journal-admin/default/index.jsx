import { Link } from "react-router-dom";
import { BookOpen, FileText, Star, Library, ArrowRight, Shield } from "lucide-react";

const cards = [
  {
    to: "/journal-admin/journals",
    icon: <Library size={22} className="text-indigo-600" />,
    bg: "bg-indigo-50",
    label: "Jurnallar",
    desc: "Jurnal yaratish, tahrirlash, editorial kengash",
  },
  {
    to: "/journal-admin/issues",
    icon: <BookOpen size={22} className="text-blue-600" />,
    bg: "bg-blue-50",
    label: "Sonlar",
    desc: "Tom va sonlarni boshqarish",
  },
  {
    to: "/journal-admin/articles",
    icon: <FileText size={22} className="text-violet-600" />,
    bg: "bg-violet-50",
    label: "Maqolalar",
    desc: "Maqolalar statusini boshqarish",
  },
  {
    to: "/journal-admin/reviews",
    icon: <Star size={22} className="text-yellow-600" />,
    bg: "bg-yellow-50",
    label: "Retsenziyalar",
    desc: "Retsenzent tayinlash va natijalar",
  },
];

export default function JournalAdminDashboard() {
  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="mx-auto max-w-4xl space-y-6">

        <div className="rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-700 p-8 text-white shadow-lg">
          <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold uppercase tracking-widest">
            <Shield size={13} /> ROLE_JOURNAL_ADMIN
          </div>
          <h1 className="mt-3 text-3xl font-bold">Jurnal Admin paneli</h1>
          <p className="mt-2 text-indigo-200">
            O'zingizga biriktirilgan jurnallarni to'liq boshqarasiz: jurnallar,
            sonlar, maqolalar va retsenziya jarayoni sizning nazoratingizdadir.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {cards.map((c) => (
            <Link
              key={c.to}
              to={c.to}
              className="group rounded-2xl bg-white p-5 shadow-sm transition hover:shadow-md"
            >
              <div className={`mb-3 inline-flex rounded-xl p-3 ${c.bg}`}>{c.icon}</div>
              <p className="font-bold text-gray-800">{c.label}</p>
              <p className="mt-1 text-xs text-gray-500">{c.desc}</p>
              <p className="mt-3 flex items-center gap-1 text-xs text-indigo-600 opacity-0 transition group-hover:opacity-100">
                O'tish <ArrowRight size={12} />
              </p>
            </Link>
          ))}
        </div>

        <div className="rounded-2xl bg-indigo-50 border border-indigo-100 p-5">
          <p className="text-sm text-indigo-700">
            <strong>Jurnal Admin vakolatlari:</strong> Foydalanuvchilarni boshqarish
            va jurnalni o'chirish faqat Superadmin uchun mavjud.
          </p>
        </div>
      </div>
    </div>
  );
}
