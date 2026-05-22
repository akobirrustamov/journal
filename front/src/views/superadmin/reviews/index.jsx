import { useEffect, useState } from "react";
import ApiCall from "../../../config/index";
import { Modal } from "react-responsive-modal";
import "react-responsive-modal/styles.css";
import {
  X, Plus, CheckCircle, Clock, XCircle, Star, Eye,
} from "lucide-react";
import { ToastContainer, useToast } from "../../../components/ui/Toast";

const REVIEW_STATUS_LABELS = {
  PENDING: { label: "Kutilmoqda", color: "bg-yellow-100 text-yellow-700" },
  ACCEPTED: { label: "Qabul qilindi", color: "bg-blue-100 text-blue-700" },
  DECLINED: { label: "Rad etildi", color: "bg-red-100 text-red-700" },
  COMPLETED: { label: "Bajarildi", color: "bg-green-100 text-green-700" },
  EXPIRED: { label: "Muddati o'tdi", color: "bg-gray-100 text-gray-700" },
};

const DECISION_LABELS = {
  ACCEPT: "Qabul qilish",
  REJECT: "Rad etish",
  MINOR_REVISION: "Kichik tuzatish",
  MAJOR_REVISION: "Katta tuzatish",
};

export default function ReviewsAdmin() {
  const { toasts, removeToast, success, error: toastError } = useToast();
  const [articles, setArticles] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ status: "SUBMITTED" });

  // Assign modal
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assignArticle, setAssignArticle] = useState(null);
  const [assignForm, setAssignForm] = useState({ reviewerId: "", dueDate: "" });
  const [assignLoading, setAssignLoading] = useState(false);

  // Reviews detail modal
  const [showReviewsModal, setShowReviewsModal] = useState(false);
  const [reviewsArticle, setReviewsArticle] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);

  const articleStatuses = [
    { value: "SUBMITTED", label: "Yuborilgan" },
    { value: "UNDER_REVIEW", label: "Ko'rib chiqilmoqda" },
    { value: "REVISION_REQUIRED", label: "Tuzatish kerak" },
    { value: "ACCEPTED", label: "Qabul qilingan" },
    { value: "ALL", label: "Barchasi" },
  ];

  useEffect(() => {
    loadArticles();
    loadUsers();
  }, [filters]);

  const loadArticles = async () => {
    setLoading(true);
    try {
      let url = `/api/v1/articles/admin/all?page=0&size=50`;
      if (filters.status !== "ALL") url += `&status=${filters.status}`;
      const res = await ApiCall(url, "GET");
      if (!res.error) {
        const raw = res.data?.data || res.data;
        const list = raw?.content || raw;
        setArticles(Array.isArray(list) ? list : []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      const res = await ApiCall("/api/v1/admin/users", "GET");
      if (!res.error) {
        const list = res.data?.data || res.data || [];
        setUsers(Array.isArray(list) ? list : []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const openAssignModal = (article) => {
    setAssignArticle(article);
    setAssignForm({ reviewerId: "", dueDate: "" });
    setShowAssignModal(true);
  };

  const submitAssign = async (e) => {
    e.preventDefault();
    setAssignLoading(true);
    try {
      const res = await ApiCall("/api/v1/reviews/assign", "POST", {
        articleId: assignArticle.id,
        reviewerId: assignForm.reviewerId,
        dueDate: assignForm.dueDate || null,
      });
      if (!res.error) {
        success("Retsenzent muvaffaqiyatli tayinlandi!");
        setShowAssignModal(false);
        loadArticles();
      } else {
        toastError("Xatolik: " + (res.data?.message || "Tayinlanmadi"));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setAssignLoading(false);
    }
  };

  const openReviewsModal = async (article) => {
    setReviewsArticle(article);
    setReviews([]);
    setShowReviewsModal(true);
    setReviewsLoading(true);
    try {
      const res = await ApiCall(`/api/v1/reviews/article/${article.id}`, "GET");
      const list = res.data?.data || res.data || [];
      setReviews(Array.isArray(list) ? list : []);
    } catch (e) {
      console.error(e);
    } finally {
      setReviewsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-6 rounded-2xl bg-white p-6 shadow-sm">
          <h1 className="text-2xl font-bold text-gray-800">Retsenziyalar boshqaruvi</h1>
          <p className="mt-1 text-sm text-gray-500">Maqolalarga retsenzent tayinlash va retsenziyalarni kuzatish</p>
        </div>

        {/* Filters */}
        <div className="mb-4 flex flex-wrap gap-2">
          {articleStatuses.map((s) => (
            <button
              key={s.value}
              onClick={() => setFilters({ status: s.value })}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
                filters.status === s.value
                  ? "bg-indigo-600 text-white"
                  : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>

        {/* Articles list */}
        <div className="space-y-3">
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600" />
            </div>
          ) : articles.length === 0 ? (
            <div className="rounded-xl bg-white py-12 text-center text-gray-400 shadow-sm">
              Maqolalar topilmadi
            </div>
          ) : (
            articles.map((article) => (
              <div key={article.id} className="rounded-xl bg-white p-5 shadow-sm">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="mb-1 text-xs text-indigo-600">{article.journalTitle}</p>
                    <p className="mb-1 font-semibold text-gray-800 line-clamp-1">{article.title}</p>
                    {article.authors?.length > 0 && (
                      <p className="mb-2 text-xs text-gray-500">
                        {article.authors.map((a) => a.fullName).join(", ")}
                      </p>
                    )}
                    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      {
                        SUBMITTED: "bg-blue-100 text-blue-700",
                        UNDER_REVIEW: "bg-yellow-100 text-yellow-700",
                        REVISION_REQUIRED: "bg-orange-100 text-orange-700",
                        ACCEPTED: "bg-green-100 text-green-700",
                        PUBLISHED: "bg-purple-100 text-purple-700",
                        REJECTED: "bg-red-100 text-red-700",
                      }[article.status] || "bg-gray-100 text-gray-700"
                    }`}>
                      {articleStatuses.find((s) => s.value === article.status)?.label || article.status}
                    </span>
                  </div>
                  <div className="flex flex-shrink-0 gap-2">
                    <button
                      onClick={() => openReviewsModal(article)}
                      className="flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50"
                    >
                      <Eye size={14} /> Retsenziyalar
                    </button>
                    <button
                      onClick={() => openAssignModal(article)}
                      className="flex items-center gap-1 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-700"
                    >
                      <Plus size={14} /> Tayinlash
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Assign Modal */}
      <Modal
        open={showAssignModal}
        onClose={() => setShowAssignModal(false)}
        center
        styles={{
          modal: { width: "90%", maxWidth: "500px", borderRadius: "20px", padding: 0 },
          overlay: { backgroundColor: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" },
        }}
      >
        <div className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-800">Retsenzent tayinlash</h2>
            <button onClick={() => setShowAssignModal(false)} className="text-gray-400 hover:text-gray-600">
              <X size={20} />
            </button>
          </div>

          {assignArticle && (
            <p className="mb-4 rounded-lg bg-gray-50 p-3 text-sm text-gray-700 line-clamp-2">
              {assignArticle.title}
            </p>
          )}

          <form onSubmit={submitAssign} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Retsenzent <span className="text-red-500">*</span>
              </label>
              <select
                required
                value={assignForm.reviewerId}
                onChange={(e) => setAssignForm((p) => ({ ...p, reviewerId: e.target.value }))}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Foydalanuvchini tanlang</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} — {u.email || u.phone}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Muddat (ixtiyoriy)</label>
              <input
                type="date"
                value={assignForm.dueDate}
                onChange={(e) => setAssignForm((p) => ({ ...p, dueDate: e.target.value }))}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => setShowAssignModal(false)}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                Bekor qilish
              </button>
              <button type="submit" disabled={assignLoading}
                className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50">
                {assignLoading ? "Tayinlanmoqda..." : "Tayinlash"}
              </button>
            </div>
          </form>
        </div>
      </Modal>

      {/* Reviews Detail Modal */}
      <Modal
        open={showReviewsModal}
        onClose={() => setShowReviewsModal(false)}
        center
        styles={{
          modal: { width: "90%", maxWidth: "650px", borderRadius: "20px", padding: 0, maxHeight: "85vh", overflowY: "auto" },
          overlay: { backgroundColor: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" },
        }}
      >
        <div className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-800">Retsenziyalar tarixi</h2>
            <button onClick={() => setShowReviewsModal(false)} className="text-gray-400 hover:text-gray-600">
              <X size={20} />
            </button>
          </div>

          {reviewsArticle && (
            <p className="mb-4 rounded-lg bg-gray-50 p-3 text-sm font-medium text-gray-700 line-clamp-2">
              {reviewsArticle.title}
            </p>
          )}

          {reviewsLoading ? (
            <div className="flex justify-center py-8">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600" />
            </div>
          ) : reviews.length === 0 ? (
            <p className="py-8 text-center text-sm text-gray-400">Hali retsenziyalar yo'q</p>
          ) : (
            <div className="space-y-4">
              {reviews.map((r) => (
                <div key={r.id} className="rounded-xl border border-gray-200 p-4">
                  <div className="mb-3 flex items-start justify-between">
                    <div>
                      <p className="font-semibold text-gray-800">{r.reviewerName}</p>
                      {r.dueDate && (
                        <p className="text-xs text-gray-400">
                          Muddat: {new Date(r.dueDate).toLocaleDateString("uz-UZ")}
                        </p>
                      )}
                    </div>
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      REVIEW_STATUS_LABELS[r.status]?.color || "bg-gray-100 text-gray-600"
                    }`}>
                      {REVIEW_STATUS_LABELS[r.status]?.label || r.status}
                    </span>
                  </div>

                  {r.decision && (
                    <div className="mb-2 rounded-lg bg-indigo-50 px-3 py-2 text-sm font-medium text-indigo-700">
                      Qaror: {DECISION_LABELS[r.decision] || r.decision}
                    </div>
                  )}

                  {r.score != null && (
                    <div className="mb-2 flex items-center gap-1 text-sm text-gray-600">
                      <Star size={14} className="text-yellow-500" />
                      Umumiy ball: {r.score}/10
                      {r.scoreOriginality != null && (
                        <span className="ml-2 text-xs text-gray-400">
                          (Originalliq: {r.scoreOriginality}, Metodologiya: {r.scoreMethodology}, Aniqlik: {r.scoreClarity})
                        </span>
                      )}
                    </div>
                  )}

                  {r.commentsForAuthor && (
                    <div className="mb-2">
                      <p className="mb-1 text-xs font-semibold text-gray-500">Muallif uchun izoh:</p>
                      <p className="text-sm text-gray-600">{r.commentsForAuthor}</p>
                    </div>
                  )}

                  {r.commentsForEditor && (
                    <div>
                      <p className="mb-1 text-xs font-semibold text-gray-500">Muharrir uchun izoh:</p>
                      <p className="text-sm text-gray-600">{r.commentsForEditor}</p>
                    </div>
                  )}

                  {r.completedAt && (
                    <p className="mt-2 text-xs text-gray-400">
                      Tugallangan: {new Date(r.completedAt).toLocaleDateString("uz-UZ")}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </Modal>
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  );
}
