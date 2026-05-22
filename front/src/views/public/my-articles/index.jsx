import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { FileText, Clock, CheckCircle, XCircle, Download, Eye, ChevronDown, ChevronUp } from "lucide-react";
import ApiCall, { baseUrl } from "../../../config/index";
import Header from "../../../components/layout/Header";
import Footer from "../../../components/layout/Footer";

const STATUS_CONFIG = {
  DRAFT:              { label: "Qoralama",         color: "bg-gray-100 text-gray-600",    icon: FileText },
  SUBMITTED:          { label: "Ko'rib chiqilmoqda", color: "bg-blue-100 text-blue-700",   icon: Clock },
  UNDER_REVIEW:       { label: "Retsenziyada",      color: "bg-yellow-100 text-yellow-700", icon: Clock },
  REVISION_REQUIRED:  { label: "Tuzatish kerak",    color: "bg-orange-100 text-orange-700", icon: Clock },
  ACCEPTED:           { label: "Qabul qilindi",     color: "bg-green-100 text-green-700",  icon: CheckCircle },
  PUBLISHED:          { label: "Nashr etildi",      color: "bg-purple-100 text-purple-700", icon: CheckCircle },
  REJECTED:           { label: "Rad etildi",        color: "bg-red-100 text-red-700",      icon: XCircle },
  ARCHIVED:           { label: "Arxivlangan",       color: "bg-gray-100 text-gray-500",    icon: FileText },
};

const STATUS_TIMELINE = [
  "SUBMITTED", "UNDER_REVIEW", "REVISION_REQUIRED", "ACCEPTED", "PUBLISHED",
];

export default function MyArticles() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);

  const isLoggedIn = !!localStorage.getItem("access_token");

  useEffect(() => {
    if (!isLoggedIn) return;
    ApiCall("/api/v1/articles/my", "GET").then((res) => {
      if (!res.error) {
        const raw = res.data?.data || res.data;
        const list = raw?.content || raw;
        setArticles(Array.isArray(list) ? list : []);
      }
    }).finally(() => setLoading(false));
  }, []);

  const progressStep = (status) => {
    const idx = STATUS_TIMELINE.indexOf(status);
    return idx === -1 ? 0 : idx + 1;
  };

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <Helmet>
        <title>Mening maqolalarim | BXU Journal</title>
      </Helmet>
      <Header />

      <div className="bg-gradient-to-br from-blue-700 to-indigo-800 px-4 py-10 text-white">
        <div className="container mx-auto max-w-4xl">
          <h1 className="mb-1 text-2xl font-bold">Mening maqolalarim</h1>
          <p className="text-blue-100">Yuborgan maqolalaringiz holati</p>
        </div>
      </div>

      <main className="container mx-auto max-w-4xl flex-1 px-4 py-8">
        {!isLoggedIn ? (
          <div className="rounded-xl bg-white p-10 text-center shadow-sm">
            <FileText className="mx-auto mb-4 h-12 w-12 text-gray-300" />
            <p className="mb-4 text-gray-600">Maqolalaringizni ko'rish uchun tizimga kiring.</p>
            <a href="/admin/login"
              className="rounded-lg bg-blue-600 px-6 py-2 font-semibold text-white hover:bg-blue-700">
              Kirish
            </a>
          </div>
        ) : loading ? (
          <div className="flex justify-center py-16">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600" />
          </div>
        ) : articles.length === 0 ? (
          <div className="rounded-xl bg-white py-16 text-center shadow-sm">
            <FileText className="mx-auto mb-4 h-14 w-14 text-gray-200" />
            <p className="mb-2 text-lg text-gray-600">Hali maqola yuborilmagan</p>
            <Link to="/submit"
              className="inline-block rounded-lg bg-blue-600 px-6 py-2 font-semibold text-white hover:bg-blue-700">
              Maqola yuborish
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {articles.map((article) => {
              const cfg = STATUS_CONFIG[article.status] || STATUS_CONFIG.DRAFT;
              const Icon = cfg.icon;
              const step = progressStep(article.status);
              const isRejected = article.status === "REJECTED";
              const isExpanded = expanded === article.id;

              return (
                <div key={article.id} className="overflow-hidden rounded-xl bg-white shadow-sm">
                  {/* Main row */}
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="mb-2 flex flex-wrap items-center gap-2">
                          <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${cfg.color}`}>
                            <Icon size={11} /> {cfg.label}
                          </span>
                          {article.journalTitle && (
                            <span className="text-xs text-blue-600">{article.journalTitle}</span>
                          )}
                        </div>
                        <h3 className="mb-1 font-semibold text-gray-800 line-clamp-2">{article.title}</h3>
                        {article.submittedAt && (
                          <p className="text-xs text-gray-400">
                            Yuborilgan: {new Date(article.submittedAt).toLocaleDateString("uz-UZ")}
                          </p>
                        )}
                        {article.publishedAt && (
                          <p className="text-xs text-gray-400">
                            Nashr etilgan: {new Date(article.publishedAt).toLocaleDateString("uz-UZ")}
                          </p>
                        )}
                      </div>

                      <div className="flex flex-shrink-0 flex-col gap-2 sm:flex-row sm:items-center">
                        {article.status === "PUBLISHED" && article.slug && (
                          <Link to={`/articles/${article.slug}`}
                            className="flex items-center gap-1 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700">
                            <Eye size={13} /> Ko'rish
                          </Link>
                        )}
                        {article.pdfUrl && (
                          <a href={`${baseUrl}/api/v1/articles/${article.id}/download`}
                            target="_blank" rel="noopener noreferrer"
                            className="flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50">
                            <Download size={13} /> PDF
                          </a>
                        )}
                        <button onClick={() => setExpanded(isExpanded ? null : article.id)}
                          className="rounded-lg border border-gray-200 p-1.5 text-gray-400 hover:bg-gray-50">
                          {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </button>
                      </div>
                    </div>

                    {/* Progress bar (not for rejected) */}
                    {!isRejected && (
                      <div className="mt-4">
                        <div className="flex items-center gap-0">
                          {STATUS_TIMELINE.map((s, i) => {
                            const done = step > i;
                            const current = step === i + 1;
                            return (
                              <div key={s} className="flex flex-1 items-center">
                                <div className={`h-2.5 w-2.5 flex-shrink-0 rounded-full transition-colors ${
                                  done || current
                                    ? current ? "bg-blue-600 ring-2 ring-blue-200" : "bg-blue-500"
                                    : "bg-gray-200"
                                }`} />
                                {i < STATUS_TIMELINE.length - 1 && (
                                  <div className={`h-0.5 flex-1 transition-colors ${done ? "bg-blue-500" : "bg-gray-200"}`} />
                                )}
                              </div>
                            );
                          })}
                        </div>
                        <div className="mt-1 flex justify-between text-xs text-gray-400">
                          <span>Yuborildi</span>
                          <span>Retsenziya</span>
                          <span>Tuzatish</span>
                          <span>Qabul</span>
                          <span>Nashr</span>
                        </div>
                      </div>
                    )}

                    {isRejected && (
                      <div className="mt-3 rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700">
                        Maqola rad etildi. Yangi versiyasini qayta yuborishingiz mumkin.
                      </div>
                    )}

                    {article.status === "REVISION_REQUIRED" && (
                      <div className="mt-3 rounded-lg bg-orange-50 px-4 py-2 text-sm text-orange-700">
                        Tuzatishlar talab qilinmoqda. Yangilangan versiyani yuboring.
                      </div>
                    )}
                  </div>

                  {/* Expanded details */}
                  {isExpanded && (
                    <div className="border-t border-gray-100 px-5 pb-5 pt-4 space-y-3">
                      {article.abstractText && (
                        <div>
                          <p className="mb-1 text-xs font-semibold text-gray-500">Annotatsiya:</p>
                          <p className="text-sm text-gray-600 line-clamp-4">{article.abstractText}</p>
                        </div>
                      )}
                      {article.keywords?.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {article.keywords.map((kw, i) => (
                            <span key={i} className="rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-600">{kw}</span>
                          ))}
                        </div>
                      )}
                      {article.authors?.length > 0 && (
                        <p className="text-xs text-gray-500">
                          Mualliflar: {article.authors.map((a) => a.fullName).join(", ")}
                        </p>
                      )}
                      <div className="grid grid-cols-2 gap-2 text-xs text-gray-500 sm:grid-cols-3">
                        {article.doi && <span>DOI: {article.doi}</span>}
                        {article.language && <span>Til: {article.language.toUpperCase()}</span>}
                        {article.reviewType && (
                          <span>{article.reviewType === "DOUBLE_BLIND" ? "Ikki tomonlama yashirin" : article.reviewType}</span>
                        )}
                        {article.pageStart && article.pageEnd && (
                          <span>Sahifalar: {article.pageStart}–{article.pageEnd}</span>
                        )}
                        {article.viewCount != null && <span>Ko'rishlar: {article.viewCount}</span>}
                        {article.downloadCount != null && <span>Yuklamalar: {article.downloadCount}</span>}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            <div className="pt-2 text-center">
              <Link to="/submit"
                className="inline-block rounded-lg bg-blue-600 px-6 py-2.5 font-semibold text-white hover:bg-blue-700">
                Yangi maqola yuborish
              </Link>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
