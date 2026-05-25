import { Link } from "react-router-dom";
import { FileText, Star, BookOpen, ArrowRight, PenTool } from "lucide-react";

const cards = [
  {
    to: "/editor/articles",
    icon: <FileText size={22} className="text-teal-600" />,
    bg: "bg-teal-50",
    label: "Maqolalar",
    desc: "Statusni o'zgartirish, sonlarga biriktirish",
  },
  {
    to: "/editor/issues",
    icon: <BookOpen size={22} className="text-blue-600" />,
    bg: "bg-blue-50",
    label: "Sonlar",
    desc: "Yangi son yaratish, tahrirlash",
  },
  {
    to: "/editor/reviews",
    icon: <Star size={22} className="text-yellow-600" />,
    bg: "bg-yellow-50",
    label: "Retsenziyalar",
    desc: "Retsenzent tayinlash, natijalarni ko'rish",
  },
];

export default function EditorDashboard() {
  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="mx-auto max-w-4xl space-y-6">

        <div className="rounded-2xl bg-gradient-to-r from-teal-600 to-cyan-700 p-8 text-white shadow-lg">
          <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold uppercase tracking-widest">
            <PenTool size={13} /> ROLE_EDITOR
          </div>
          <h1 className="mt-3 text-3xl font-bold">Muharrir paneli</h1>
          <p className="mt-2 text-teal-100">
            Maqolalar tahririyat jarayonini boshqarasiz: statuslarni yangilaysiz,
            retsenzentlar tayinlaysiz va maqolalarni sonlarga biriktiraysiz.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          {cards.map((c) => (
            <Link
              key={c.to}
              to={c.to}
              className="group rounded-2xl bg-white p-6 shadow-sm transition hover:shadow-md"
            >
              <div className={`mb-3 inline-flex rounded-xl p-3 ${c.bg}`}>{c.icon}</div>
              <p className="font-bold text-gray-800">{c.label}</p>
              <p className="mt-1 text-xs text-gray-500">{c.desc}</p>
              <p className="mt-3 flex items-center gap-1 text-xs text-teal-600 opacity-0 transition group-hover:opacity-100">
                O'tish <ArrowRight size={12} />
              </p>
            </Link>
          ))}
        </div>

        <div className="rounded-2xl bg-teal-50 border border-teal-100 p-5">
          <p className="text-sm text-teal-700">
            <strong>Muharrir vakolatlari:</strong> Jurnallarni yaratish va foydalanuvchilarni
            boshqarish mumkin emas. Bu imkoniyatlar faqat Jurnal Admin va Superadmin uchun mavjud.
          </p>
        </div>
      </div>
    </div>
  );
}
