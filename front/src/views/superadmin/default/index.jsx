import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import ApiCall from "../../../config/index";
import {
  BookOpen, FileText, Users, Star,
  Clock, CheckCircle, XCircle, ArrowRight,
} from "lucide-react";

const STATUS_COLOR = {
  SUBMITTED:         "bg-blue-100 text-blue-700",
  UNDER_REVIEW:      "bg-yellow-100 text-yellow-700",
  REVISION_REQUIRED: "bg-orange-100 text-orange-700",
  ACCEPTED:          "bg-green-100 text-green-700",
  PUBLISHED:         "bg-purple-100 text-purple-700",
  REJECTED:          "bg-red-100 text-red-700",
};
const STATUS_LABEL = {
  SUBMITTED:         "Yuborilgan",
  UNDER_REVIEW:      "Ko'rib chiqilmoqda",
  REVISION_REQUIRED: "Tuzatish kerak",
  ACCEPTED:          "Qabul qilingan",
  PUBLISHED:         "Nashr etildi",
  REJECTED:          "Rad etildi",
};

export default function SuperAdminDashboard() {
  const [stats, setStats] = useState({
    journals: 0, articles: 0, users: 0, reviews: 0,
  });
  const [recentArticles, setRecentArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [jRes, aRes, uRes] = await Promise.all([
          ApiCall("/api/v1/journals?page=0&size=1", "GET"),
          ApiCall("/api/v1/articles/admin/all?page=0&size=8", "GET"),
          ApiCall("/api/v1/admin/users", "GET"),
        ]);

        if (!jRes.error) {
          const jData = jRes.data?.data || jRes.data;
          setStats((s) => ({ ...s, journals: jData?.totalElements || jData?.content?.length || 0 }));
        }

        if (!aRes.error) {
          const aData = aRes.data?.data || aRes.data;
          const aList = aData?.content || aData;
          setStats((s) => ({ ...s, articles: aData?.totalElements || 0 }));
          setRecentArticles(Array.isArray(aList) ? aList.slice(0, 6) : []);
        }

        if (!uRes.error) {
          const uList = uRes.data?.data || uRes.data || [];
          setStats((s) => ({ ...s, users: Array.isArray(uList) ? uList.length : 0 }));
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const statCards = [
    {
      label: "Jurnallar",
      value: stats.journals,
      icon: <BookOpen size={22} className="text-blue-600" />,
      bg: "bg-blue-50",
      link: "/superadmin/journals",
    },
    {
      label: "Maqolalar",
      value: stats.articles,
      icon: <FileText size={22} className="text-indigo-600" />,
      bg: "bg-indigo-50",
      link: "/superadmin/articles",
    },
    {
      label: "Foydalanuvchilar",
      value: stats.users,
      icon: <Users size={22} className="text-green-600" />,
      bg: "bg-green-50",
      link: "/superadmin/users",
    },
    {
      label: "Retsenziyalar",
      value: "—",
      icon: <Star size={22} className="text-yellow-600" />,
      bg: "bg-yellow-50",
      link: "/superadmin/reviews",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-8">

        {/* Welcome */}
        <div className="rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-700 p-6 text-white shadow">
          <h1 className="text-2xl font-bold">Superadmin paneli</h1>
          <p className="mt-1 text-purple-200">Platforma bo'yicha umumiy ko'rinish</p>
        </div>

        {/* Stat cards */}
        {loading ? (
          <div className="flex justify-center py-10">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-purple-200 border-t-purple-600" />
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {statCards.map((c) => (
              <Link key={c.label} to={c.link}
                className="group rounded-2xl bg-white p-5 shadow-sm transition hover:shadow-md">
                <div className={`mb-3 inline-flex rounded-xl p-3 ${c.bg}`}>{c.icon}</div>
                <p className="text-2xl font-bold text-gray-800">{c.value}</p>
                <p className="text-sm text-gray-500">{c.label}</p>
                <p className="mt-2 flex items-center gap-1 text-xs text-indigo-600 opacity-0 transition group-hover:opacity-100">
                  Boshqarish <ArrowRight size={12} />
                </p>
              </Link>
            ))}
          </div>
        )}

        {/* Recent articles */}
        {recentArticles.length > 0 && (
          <div className="rounded-2xl bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
              <h2 className="font-semibold text-gray-800">So'nggi maqolalar</h2>
              <Link to="/superadmin/articles"
                className="flex items-center gap-1 text-sm text-indigo-600 hover:underline">
                Barchasi <ArrowRight size={14} />
              </Link>
            </div>
            <div className="divide-y divide-gray-50">
              {recentArticles.map((article) => (
                <div key={article.id} className="flex items-center justify-between gap-4 px-6 py-4">
                  <div className="flex-1 min-w-0">
                    <p className="truncate font-medium text-gray-800">{article.title}</p>
                    <p className="mt-0.5 text-xs text-gray-400">
                      {article.journalTitle || "—"}
                      {article.authors?.[0]?.fullName && (
                        <> · {article.authors[0].fullName}</>
                      )}
                    </p>
                  </div>
                  <span className={`flex-shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_COLOR[article.status] || "bg-gray-100 text-gray-600"}`}>
                    {STATUS_LABEL[article.status] || article.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick links */}
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            { to: "/superadmin/journals", label: "Yangi jurnal qo'shish", icon: <BookOpen size={18} />, color: "bg-blue-600" },
            { to: "/superadmin/issues",   label: "Son qo'shish",          icon: <FileText size={18} />, color: "bg-indigo-600" },
            { to: "/superadmin/reviews",  label: "Retsenzent tayinlash",  icon: <Star size={18} />,     color: "bg-yellow-500" },
          ].map((q) => (
            <Link key={q.to} to={q.to}
              className={`flex items-center gap-3 rounded-xl ${q.color} px-5 py-4 font-medium text-white shadow transition hover:opacity-90`}>
              {q.icon} {q.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
