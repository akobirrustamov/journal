import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { CheckCircle, XCircle, Clock, Star, ChevronDown, ChevronUp, X } from "lucide-react";
import ApiCall from "../../config/index";
import { Modal } from "react-responsive-modal";
import "react-responsive-modal/styles.css";
import Header from "../../components/layout/Header";
import Footer from "../../components/layout/Footer";
import { ToastContainer, useToast } from "../../components/ui/Toast";

const REVIEW_STATUS = {
  PENDING:   { label: "Taklif kutilmoqda", color: "bg-yellow-100 text-yellow-700" },
  ACCEPTED:  { label: "Qabul qilindi",     color: "bg-blue-100 text-blue-700" },
  DECLINED:  { label: "Rad etildi",        color: "bg-red-100 text-red-700" },
  COMPLETED: { label: "Bajarildi",         color: "bg-green-100 text-green-700" },
  EXPIRED:   { label: "Muddati o'tdi",     color: "bg-gray-100 text-gray-600" },
};

const DECISIONS = [
  { value: "ACCEPT",         label: "Qabul qilish" },
  { value: "MINOR_REVISION", label: "Kichik tuzatish" },
  { value: "MAJOR_REVISION", label: "Katta tuzatish" },
  { value: "REJECT",         label: "Rad etish" },
];

const emptyForm = {
  decision: "MINOR_REVISION",
  commentsForAuthor: "",
  commentsForEditor: "",
  score: 7,
  scoreOriginality: 7,
  scoreMethodology: 7,
  scoreClarity: 7,
};

export default function ReviewerDashboard() {
  const { toasts, removeToast, success, error: toastError } = useToast();
  const [reviews, setReviews] = useState([]);
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("pending");
  const [expanded, setExpanded] = useState(null);

  // Submit modal
  const [submitReview, setSubmitReview] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);

  const isLoggedIn = !!localStorage.getItem("access_token");

  useEffect(() => {
    if (!isLoggedIn) return;
    loadReviews();
  }, []);

  const loadReviews = async () => {
    setLoading(true);
    try {
      const [allRes, pendRes] = await Promise.all([
        ApiCall("/api/v1/reviews/my?page=0&size=50", "GET"),
        ApiCall("/api/v1/reviews/my/pending", "GET"),
      ]);
      const allList = allRes.data?.data?.content || allRes.data?.data || allRes.data || [];
      const pendList = pendRes.data?.data || pendRes.data || [];
      setReviews(Array.isArray(allList) ? allList : []);
      setPending(Array.isArray(pendList) ? pendList : []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const respond = async (reviewId, accept) => {
    try {
      const res = await ApiCall(`/api/v1/reviews/${reviewId}/respond?accept=${accept}`, "PUT");
      if (!res.error) {
        await loadReviews();
      } else {
        toastError("Xatolik: " + (res.data?.message || "Javob berilmadi"));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const openSubmit = (review) => {
    setSubmitReview(review);
    setForm(emptyForm);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await ApiCall(`/api/v1/reviews/${submitReview.id}/submit`, "POST", {
        decision: form.decision,
        commentsForAuthor: form.commentsForAuthor,
        commentsForEditor: form.commentsForEditor,
        score: parseInt(form.score),
        scoreOriginality: parseInt(form.scoreOriginality),
        scoreMethodology: parseInt(form.scoreMethodology),
        scoreClarity: parseInt(form.scoreClarity),
      });
      if (!res.error) {
        success("Retsenziya muvaffaqiyatli yuborildi!");
        setSubmitReview(null);
        await loadReviews();
      } else {
        toastError("Xatolik: " + (res.data?.message || "Yuborilmadi"));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  const displayed = tab === "pending"
    ? reviews.filter((r) => r.status === "PENDING")
    : tab === "accepted"
    ? reviews.filter((r) => r.status === "ACCEPTED")
    : reviews.filter((r) => r.status === "COMPLETED");

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <Helmet>
        <title>Retsenzent kabineti | BXU Journal</title>
      </Helmet>
      <Header />

      <div className="bg-gradient-to-br from-indigo-700 to-blue-800 px-4 py-10 text-white">
        <div className="container mx-auto max-w-4xl">
          <h1 className="mb-1 text-2xl font-bold">Retsenzent kabineti</h1>
          <p className="text-blue-100">Tayinlangan retsenziyalaringizni boshqaring</p>
          {pending.length > 0 && (
            <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-yellow-400 px-4 py-1 text-sm font-semibold text-yellow-900">
              <Clock size={14} /> {pending.length} ta yangi taklif kutilmoqda
            </div>
          )}
        </div>
      </div>

      <main className="container mx-auto max-w-4xl flex-1 px-4 py-8">
        {!isLoggedIn ? (
          <div className="rounded-xl bg-white p-10 text-center shadow-sm">
            <p className="mb-4 text-gray-600">Retsenzent kabinetiga kirish uchun tizimga kiring.</p>
            <a href="/login"
              className="rounded-lg bg-indigo-600 px-6 py-2 font-semibold text-white hover:bg-indigo-700">
              Kirish
            </a>
          </div>
        ) : loading ? (
          <div className="flex justify-center py-16">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600" />
          </div>
        ) : (
          <>
            {/* Tabs */}
            <div className="mb-4 flex gap-2 border-b border-gray-200 pb-0">
              {[
                { key: "pending",   label: "Kutilayotgan",  count: reviews.filter((r) => r.status === "PENDING").length },
                { key: "accepted",  label: "Jarayonda",     count: reviews.filter((r) => r.status === "ACCEPTED").length },
                { key: "completed", label: "Bajarilgan",    count: reviews.filter((r) => r.status === "COMPLETED").length },
              ].map((t) => (
                <button key={t.key} onClick={() => setTab(t.key)}
                  className={`flex items-center gap-1.5 border-b-2 px-4 py-2.5 text-sm font-medium transition ${
                    tab === t.key
                      ? "border-indigo-600 text-indigo-600"
                      : "border-transparent text-gray-500 hover:text-gray-800"
                  }`}>
                  {t.label}
                  {t.count > 0 && (
                    <span className={`rounded-full px-1.5 py-0.5 text-xs font-bold ${
                      tab === t.key ? "bg-indigo-100 text-indigo-700" : "bg-gray-100 text-gray-600"
                    }`}>{t.count}</span>
                  )}
                </button>
              ))}
            </div>

            {displayed.length === 0 ? (
              <div className="rounded-xl bg-white py-12 text-center text-gray-400 shadow-sm">
                Bu bo'limda retsenziyalar yo'q
              </div>
            ) : (
              <div className="space-y-3">
                {displayed.map((r) => (
                  <div key={r.id} className="rounded-xl bg-white shadow-sm">
                    {/* Header row */}
                    <div className="flex items-start justify-between gap-4 p-5">
                      <div className="flex-1 min-w-0">
                        <p className="mb-1 font-semibold text-gray-800 line-clamp-2">{r.articleTitle}</p>
                        <div className="flex flex-wrap items-center gap-3 text-xs text-gray-400">
                          {r.dueDate && (
                            <span className="flex items-center gap-1">
                              <Clock size={12} /> Muddat: {new Date(r.dueDate).toLocaleDateString("uz-UZ")}
                            </span>
                          )}
                          <span className={`rounded-full px-2.5 py-0.5 font-medium ${REVIEW_STATUS[r.status]?.color}`}>
                            {REVIEW_STATUS[r.status]?.label || r.status}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-shrink-0 flex-col gap-2 sm:flex-row sm:items-center">
                        {/* PENDING actions */}
                        {r.status === "PENDING" && (
                          <>
                            <button onClick={() => respond(r.id, true)}
                              className="flex items-center gap-1 rounded-lg bg-green-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-green-700">
                              <CheckCircle size={13} /> Qabul
                            </button>
                            <button onClick={() => respond(r.id, false)}
                              className="flex items-center gap-1 rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50">
                              <XCircle size={13} /> Rad
                            </button>
                          </>
                        )}

                        {/* ACCEPTED: submit review */}
                        {r.status === "ACCEPTED" && (
                          <button onClick={() => openSubmit(r)}
                            className="flex items-center gap-1 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-700">
                            <Star size={13} /> Retsenziya yozing
                          </button>
                        )}

                        {/* Toggle details */}
                        <button onClick={() => setExpanded(expanded === r.id ? null : r.id)}
                          className="rounded-lg border border-gray-200 p-1.5 text-gray-400 hover:bg-gray-50">
                          {expanded === r.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </button>
                      </div>
                    </div>

                    {/* Expanded details (COMPLETED) */}
                    {expanded === r.id && (
                      <div className="border-t border-gray-100 px-5 pb-5 pt-4 space-y-3">
                        {r.decision && (
                          <div className="rounded-lg bg-indigo-50 px-4 py-2 text-sm font-medium text-indigo-700">
                            Qaror: {DECISIONS.find((d) => d.value === r.decision)?.label || r.decision}
                          </div>
                        )}
                        {r.score != null && (
                          <div className="grid grid-cols-2 gap-2 text-sm sm:grid-cols-4">
                            {[
                              ["Umumiy", r.score],
                              ["Originallik", r.scoreOriginality],
                              ["Metodologiya", r.scoreMethodology],
                              ["Aniqlik", r.scoreClarity],
                            ].map(([label, val]) => val != null && (
                              <div key={label} className="rounded-lg bg-gray-50 p-3 text-center">
                                <p className="text-xs text-gray-400">{label}</p>
                                <p className="text-xl font-bold text-indigo-600">{val}<span className="text-sm text-gray-400">/10</span></p>
                              </div>
                            ))}
                          </div>
                        )}
                        {r.commentsForAuthor && (
                          <div>
                            <p className="mb-1 text-xs font-semibold text-gray-500">Muallif uchun izoh:</p>
                            <p className="text-sm text-gray-700">{r.commentsForAuthor}</p>
                          </div>
                        )}
                        {r.commentsForEditor && (
                          <div>
                            <p className="mb-1 text-xs font-semibold text-gray-500">Muharrir uchun izoh:</p>
                            <p className="text-sm text-gray-700">{r.commentsForEditor}</p>
                          </div>
                        )}
                        {r.completedAt && (
                          <p className="text-xs text-gray-400">
                            Tugallangan: {new Date(r.completedAt).toLocaleDateString("uz-UZ")}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </main>

      <Footer />

      {/* Submit review modal */}
      <Modal
        open={!!submitReview}
        onClose={() => setSubmitReview(null)}
        center
        styles={{
          modal: { width: "95%", maxWidth: "620px", borderRadius: "20px", padding: 0, maxHeight: "90vh", overflowY: "auto" },
          overlay: { backgroundColor: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" },
        }}
      >
        <div className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-800">Retsenziya yuborish</h2>
            <button onClick={() => setSubmitReview(null)} className="text-gray-400 hover:text-gray-600">
              <X size={20} />
            </button>
          </div>

          {submitReview && (
            <p className="mb-5 rounded-lg bg-gray-50 p-3 text-sm font-medium text-gray-700 line-clamp-2">
              {submitReview.articleTitle}
            </p>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Decision */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Qaror <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {DECISIONS.map((d) => (
                  <button key={d.value} type="button"
                    onClick={() => setForm((p) => ({ ...p, decision: d.value }))}
                    className={`rounded-lg border px-3 py-2 text-xs font-medium transition ${
                      form.decision === d.value
                        ? "border-indigo-500 bg-indigo-600 text-white"
                        : "border-gray-200 text-gray-600 hover:bg-gray-50"
                    }`}>
                    {d.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Scores */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">Baholar (1–10)</label>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {[
                  { key: "score",             label: "Umumiy" },
                  { key: "scoreOriginality",  label: "Originallik" },
                  { key: "scoreMethodology",  label: "Metodologiya" },
                  { key: "scoreClarity",      label: "Aniqlik" },
                ].map(({ key, label }) => (
                  <div key={key} className="rounded-lg border border-gray-200 p-3 text-center">
                    <p className="mb-1 text-xs text-gray-400">{label}</p>
                    <input type="number" min="1" max="10" value={form[key]}
                      onChange={(e) => setForm((p) => ({ ...p, [key]: e.target.value }))}
                      className="w-full rounded border border-gray-200 py-1 text-center text-lg font-bold text-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-500" />
                  </div>
                ))}
              </div>
            </div>

            {/* Comments for author */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Muallif uchun izoh <span className="text-red-500">*</span>
              </label>
              <textarea required rows={4} value={form.commentsForAuthor}
                onChange={(e) => setForm((p) => ({ ...p, commentsForAuthor: e.target.value }))}
                placeholder="Maqolaning kuchli va zaif tomonlari, tavsiyalar..."
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>

            {/* Comments for editor */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Muharrir uchun maxfiy izoh
              </label>
              <textarea rows={3} value={form.commentsForEditor}
                onChange={(e) => setForm((p) => ({ ...p, commentsForEditor: e.target.value }))}
                placeholder="Muallifga ko'rsatilmaydigan izohlar..."
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => setSubmitReview(null)}
                className="rounded-lg border border-gray-300 px-5 py-2 text-sm text-gray-700 hover:bg-gray-50">
                Bekor qilish
              </button>
              <button type="submit" disabled={submitting}
                className="rounded-lg bg-indigo-600 px-5 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50">
                {submitting ? "Yuborilmoqda..." : "Retsenziyani yuborish"}
              </button>
            </div>
          </form>
        </div>
      </Modal>
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  );
}
