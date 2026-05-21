import { useEffect, useState } from "react";
import ApiCall from "../../../config/index";
import { Modal } from "react-responsive-modal";
import "react-responsive-modal/styles.css";
import {
  Eye,
  Edit,
  X,
  Filter,
  Download,
  CheckCircle,
  Clock,
  XCircle,
  FileText,
  Search,
  Trash2,
  Plus,
  Upload,
} from "lucide-react";

const Articles = () => {
  // State
  const [articles, setArticles] = useState([]);
  const [journals, setJournals] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [loading, setLoading] = useState(false);
  const [issuesForAssign, setIssuesForAssign] = useState([]);
  const [selectedIssueId, setSelectedIssueId] = useState("");
  const [filters, setFilters] = useState({
    status: "ALL",
    journalId: "",
    search: "",
  });

  // Pagination
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const pageSize = 20;

  const [showCreateModal, setShowCreateModal] = useState(false);

  const [isEditing, setIsEditing] = useState(false);

  const [pdfFile, setPdfFile] = useState(null);

  const [formData, setFormData] = useState({
    id: "",
    title: "",
    abstractText: "",
    keywords: [],
    journalId: "",
    reviewType: "DOUBLE_BLIND",
    language: "uz",
    fundingInfo: "",
    conflictOfInterest: "",
    license: "CC-BY-4.0",
    pageStart: "",
    pageEnd: "",
    receivedDate: "",
    authors: [],
  });

  // ─────────────────────────────────────────────
  // OPEN CREATE
  // ─────────────────────────────────────────────

  const openCreateModal = () => {
    setIsEditing(false);

    setPdfFile(null);

    setFormData({
      id: "",
      title: "",
      abstractText: "",
      keywords: [],
      journalId: "",
      reviewType: "DOUBLE_BLIND",
      language: "uz",
      fundingInfo: "",
      conflictOfInterest: "",
      license: "CC-BY-4.0",
      pageStart: "",
      pageEnd: "",
      receivedDate: "",
      authors: [],
    });

    setShowCreateModal(true);
  };

  // ─────────────────────────────────────────────
  // OPEN EDIT
  // ─────────────────────────────────────────────

  const openEditModal = (article) => {
    setIsEditing(true);

    setFormData({
      id: article.id,
      title: article.title || "",
      abstractText: article.abstractText || "",
      keywords: article.keywords || [],
      journalId: article.journalId || "",
      reviewType: article.reviewType || "DOUBLE_BLIND",
      language: article.language || "uz",
      fundingInfo: article.fundingInfo || "",
      conflictOfInterest: article.conflictOfInterest || "",
      license: article.license || "CC-BY-4.0",
      pageStart: article.pageStart || "",
      pageEnd: article.pageEnd || "",
      receivedDate: article.receivedDate ? article.receivedDate.split("T")[0] : "",
      authors: article.authors || [],
    });

    setShowCreateModal(true);
  };

  // ─────────────────────────────────────────────
  // INPUT CHANGE
  // ─────────────────────────────────────────────

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "keywords" ? value.split(",").map((k) => k.trim()) : value,
    }));
  };

  const addAuthor = () => {
    setFormData((prev) => ({
      ...prev,
      authors: [
        ...prev.authors,
        { fullName: "", email: "", affiliation: "", orcid: "", corresponding: false, orderIndex: prev.authors.length },
      ],
    }));
  };

  const updateAuthor = (index, field, value) => {
    setFormData((prev) => {
      const updated = [...prev.authors];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, authors: updated };
    });
  };

  const removeAuthor = (index) => {
    setFormData((prev) => ({
      ...prev,
      authors: prev.authors.filter((_, i) => i !== index).map((a, i) => ({ ...a, orderIndex: i })),
    }));
  };

  // ─────────────────────────────────────────────
  // CREATE / UPDATE
  // ─────────────────────────────────────────────

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const payload = {
        journalId: formData.journalId || null,
        title: formData.title,
        abstractText: formData.abstractText,
        keywords: formData.keywords.filter(Boolean),
        reviewType: formData.reviewType,
        language: formData.language,
        fundingInfo: formData.fundingInfo || null,
        conflictOfInterest: formData.conflictOfInterest || null,
        license: formData.license || null,
        pageStart: formData.pageStart ? parseInt(formData.pageStart) : null,
        pageEnd: formData.pageEnd ? parseInt(formData.pageEnd) : null,
        receivedDate: formData.receivedDate || null,
        authors: formData.authors,
      };

      let result;

      // CREATE
      if (!isEditing) {
        result = await ApiCall("/api/v1/articles/submit", "POST", payload);
      } else {
        // UPDATE
        result = await ApiCall(`/api/v1/articles/${formData.id}`, "PUT", payload);
      }

      if (result.error) {
        alert("Xatolik yuz berdi");

        return;
      }

      const article = result?.data?.data || result?.data;

      // PDF UPLOAD
      if (pdfFile && article?.id) {
        const uploadData = new FormData();

        uploadData.append("file", pdfFile);

        const token = localStorage.getItem("access_token");

        await fetch(`/api/v1/articles/${article.id}/pdf`, {
          method: "POST",

          headers: {
            Authorization: `Bearer ${token}`,
          },

          body: uploadData,
        });
      }

      await getArticles();

      setShowCreateModal(false);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // ─────────────────────────────────────────────
  // DELETE
  // ─────────────────────────────────────────────

  const deleteArticle = async (id) => {
    if (!window.confirm("Maqolani o‘chirmoqchimisiz?")) {
      return;
    }

    try {
      const result = await ApiCall(`/api/v1/articles/${id}`, "DELETE");

      if (!result.error) {
        await getArticles();

        alert("O‘chirildi");
      }
    } catch (error) {
      console.error(error);
    }
  };

  // Fetch data on mount
  useEffect(() => {
    getArticles();
    getJournals();
  }, [currentPage, filters]);

  // ---------- API Calls ----------
  const getArticles = async () => {
    try {
      setLoading(true);
      let url = `/api/v1/articles/admin/all?page=${currentPage}&size=${pageSize}`;

      if (filters.status !== "ALL") {
        url += `&status=${filters.status}`;
      }
      if (filters.journalId) {
        url += `&journalId=${filters.journalId}`;
      }

      const result = await ApiCall(url, "GET");
      if (!result.error && result.data) {
        const raw = result.data?.data || result.data;
        const articlesData = raw?.content || raw;
        if (Array.isArray(articlesData)) {
          setArticles(articlesData);
          setTotalPages(raw?.totalPages || 1);
        } else {
          setArticles([]);
        }
      } else {
        setArticles([]);
      }
    } catch (error) {
      console.error("Maqolalarni olishda xatolik", error);
      setArticles([]);
    } finally {
      setLoading(false);
    }
  };

  const getJournals = async () => {
    try {
      const result = await ApiCall("/api/v1/journals?page=0&size=100", "GET");
      if (!result.error && result.data) {
        const raw = result.data?.data || result.data;
        const journalsList = raw?.content || raw;
        setJournals(Array.isArray(journalsList) ? journalsList : []);
      }
    } catch (error) {
      console.error("Jurnallarni olishda xatolik", error);
    }
  };

  const updateArticleStatus = async (articleId, newStatus) => {
    try {
      const result = await ApiCall(
        `/api/v1/articles/${articleId}/status?status=${newStatus}`,
        "PUT"
      );
      if (!result.error) {
        await getArticles();
        alert("Maqola holati muvaffaqiyatli yangilandi!");
      } else {
        alert(
          "Xatolik: " + (result.data?.message || "Holatni yangilashda xatolik")
        );
      }
    } catch (error) {
      console.error("Holatni yangilashda xatolik", error);
      alert("Maqola holatini yangilashda xatolik yuz berdi");
    }
  };

  const viewArticleDetails = async (article) => {
    setSelectedArticle(article);
    setSelectedIssueId(article.issueId || "");
    setShowModal(true);
    if (article.journalId || article.journal?.id) {
      const jId = article.journalId || article.journal?.id;
      const res = await ApiCall(`/api/v1/journals/${jId}/issues`, "GET");
      if (!res.error) {
        const list = res.data?.data || res.data || [];
        setIssuesForAssign(Array.isArray(list) ? list : []);
      }
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedArticle(null);
    setIssuesForAssign([]);
    setSelectedIssueId("");
  };

  const resetArticle = async () => {
    if (!selectedArticle) return;
    if (!window.confirm("Maqolani SUBMITTED holatiga qaytarmoqchimisiz?")) return;
    const res = await ApiCall(`/api/v1/articles/${selectedArticle.id}/reset`, "PUT");
    if (!res.error) {
      await getArticles();
      setSelectedArticle((prev) => ({ ...prev, status: "SUBMITTED" }));
      alert("Maqola holati SUBMITTED ga qaytarildi!");
    } else {
      alert("Xatolik: " + (res.data?.message || "Qayta o'rnatib bo'lmadi"));
    }
  };

  const assignToIssue = async () => {
    if (!selectedIssueId || !selectedArticle) return;
    const res = await ApiCall(
      `/api/v1/articles/${selectedArticle.id}/assign-issue?issueId=${selectedIssueId}`,
      "PUT"
    );
    if (!res.error) {
      alert("Maqola songa biriktirildi!");
      await getArticles();
      closeModal();
    } else {
      alert("Xatolik: " + (res.data?.message || "Biriktirish amalga oshmadi"));
    }
  };

  // ---------- Filter Handlers ----------
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
    setCurrentPage(0); // Reset to first page
  };

  const handleSearch = (e) => {
    e.preventDefault();
    getArticles();
  };

  // ---------- Status Config ----------
  const articleStatuses = [
    { value: "ALL", label: "Barchasi", color: "gray" },
    { value: "DRAFT", label: "Qoralama", color: "gray" },
    { value: "SUBMITTED", label: "Yuborilgan", color: "blue" },
    { value: "UNDER_REVIEW", label: "Ko'rib chiqilmoqda", color: "yellow" },
    { value: "REVISION_REQUIRED", label: "Tuzatish kerak", color: "orange" },
    { value: "ACCEPTED", label: "Qabul qilingan", color: "green" },
    { value: "PUBLISHED", label: "Nashr etilgan", color: "purple" },
    { value: "REJECTED", label: "Rad etilgan", color: "red" },
    { value: "ARCHIVED", label: "Arxivlangan", color: "gray" },
  ];

  // Valid transitions mirror backend validateTransition logic
  const validTransitions = {
    DRAFT:             ["SUBMITTED"],
    SUBMITTED:         ["UNDER_REVIEW", "REJECTED"],
    UNDER_REVIEW:      ["REVISION_REQUIRED", "ACCEPTED", "REJECTED"],
    REVISION_REQUIRED: ["SUBMITTED", "REJECTED"],
    ACCEPTED:          ["PUBLISHED", "REJECTED"],
    PUBLISHED:         ["ARCHIVED"],
    ARCHIVED:          [],
    REJECTED:          [],
  };

  const getStatusBadge = (status) => {
    const statusConfig = articleStatuses.find((s) => s.value === status);
    if (!statusConfig) return null;

    const colorClasses = {
      gray: "bg-gray-100 text-gray-700",
      blue: "bg-blue-100 text-blue-700",
      yellow: "bg-yellow-100 text-yellow-700",
      orange: "bg-orange-100 text-orange-700",
      green: "bg-green-100 text-green-700",
      purple: "bg-purple-100 text-purple-700",
      red: "bg-red-100 text-red-700",
    };

    return (
      <span
        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
          colorClasses[statusConfig.color]
        }`}
      >
        {statusConfig.label}
      </span>
    );
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "PUBLISHED":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "UNDER_REVIEW":
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case "REJECTED":
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <FileText className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-6 overflow-hidden rounded-2xl bg-white shadow-lg">
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-6">
            <div className="flex flex-col items-start justify-between sm:flex-row sm:items-center">
              <div>
                <h1 className="mb-1 text-2xl font-bold text-gray-800">
                  Maqolalarni boshqarish
                </h1>
                <p className="text-sm text-gray-600">
                  Ilmiy maqolalarni ko'rish va holatini boshqarish
                </p>
              </div>
              <div className="mt-3 flex items-center gap-2 sm:mt-0">
                <span className="text-sm text-gray-600">
                  Jami: {articles.length} ta maqola
                </span>
                <button
                  onClick={openCreateModal}
                  className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-700"
                >
                  <Plus size={18} />
                  Yangi maqola
                </button>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="border-t border-gray-200 bg-white p-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {/* Status Filter */}
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Holat bo'yicha
                </label>
                <select
                  name="status"
                  value={filters.status}
                  onChange={handleFilterChange}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {articleStatuses.map((status) => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Journal Filter */}
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Jurnal bo'yicha
                </label>
                <select
                  name="journalId"
                  value={filters.journalId}
                  onChange={handleFilterChange}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Barcha jurnallar</option>
                  {journals.map((journal) => (
                    <option key={journal.id} value={journal.id}>
                      {journal.title}
                    </option>
                  ))}
                </select>
              </div>

              {/* Search */}
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Qidirish
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="search"
                    value={filters.search}
                    onChange={handleFilterChange}
                    placeholder="Maqola nomi..."
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Articles Table */}
        <div className="overflow-hidden rounded-2xl bg-white shadow-lg">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600"></div>
                <p className="mt-4 text-gray-600">Yuklanmoqda...</p>
              </div>
            </div>
          ) : !articles || articles.length === 0 ? (
            <div className="py-12 text-center text-gray-500">
              <FileText className="mx-auto h-16 w-16 text-gray-300" />
              <p className="mt-4 text-lg">Maqolalar topilmadi</p>
              <p className="mt-2 text-sm">
                Filtrlarni o'zgartiring yoki yangi maqola qo'shilishini kuting
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                        Maqola
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                        Jurnal
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                        Muallif
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                        Holat
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                        Yuborilgan sana
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                        Amallar
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {articles.map((article) => (
                      <tr
                        key={article.id}
                        className="transition hover:bg-gray-50"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-start gap-3">
                            {getStatusIcon(article.status)}
                            <div>
                              <p className="font-medium text-gray-900">
                                {article.title}
                              </p>
                              {article.abstractText && (
                                <p className="line-clamp-2 mt-1 text-sm text-gray-500">
                                  {article.abstractText}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">
                          {article.journal?.title || "-"}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">
                          {article.submittedBy?.name || "-"}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4">
                          {getStatusBadge(article.status)}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                          {article.submittedAt
                            ? new Date(article.submittedAt).toLocaleDateString(
                                "uz-UZ"
                              )
                            : "-"}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                          <button
                            onClick={() => viewArticleDetails(article)}
                            className="mr-3 text-indigo-600 hover:text-indigo-900"
                            aria-label="Ko'rish"
                          >
                            <Eye size={18} />
                          </button>
                          <button
                            onClick={() => openEditModal(article)}
                            className="mr-3 text-yellow-600 hover:text-yellow-800"
                          >
                            <Edit size={18} />
                          </button>

                          <button
                            onClick={() => deleteArticle(article.id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 size={18} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between border-t border-gray-200 bg-white px-6 py-4">
                  <div className="text-sm text-gray-700">
                    Sahifa {currentPage + 1} / {totalPages}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
                      disabled={currentPage === 0}
                      className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Oldingi
                    </button>
                    <button
                      onClick={() =>
                        setCurrentPage((p) => Math.min(totalPages - 1, p + 1))
                      }
                      disabled={currentPage >= totalPages - 1}
                      className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Keyingi
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* CREATE / UPDATE MODAL */}

      <Modal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        center
        styles={{
          modal: {
            width: "95%",
            maxWidth: "900px",
            borderRadius: "24px",
            padding: "0",
          },
        }}
      >
        <form onSubmit={handleSubmit} className="p-6">
          <h2 className="mb-6 text-2xl font-bold">
            {isEditing ? "Maqolani tahrirlash" : "Yangi maqola"}
          </h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {/* TITLE */}
            <div className="md:col-span-2">
              <label className="mb-1 block text-sm font-medium">Sarlavha</label>

              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
                className="w-full rounded-lg border px-4 py-3"
              />
            </div>

            {/* ABSTRACT */}
            <div className="md:col-span-2">
              <label className="mb-1 block text-sm font-medium">
                Annotatsiya
              </label>

              <textarea
                rows={5}
                name="abstractText"
                value={formData.abstractText}
                onChange={handleInputChange}
                className="w-full rounded-lg border px-4 py-3"
              />
            </div>

            {/* KEYWORDS */}
            <div>
              <label className="mb-1 block text-sm font-medium">
                Kalit so‘zlar
              </label>

              <input
                type="text"
                name="keywords"
                value={formData.keywords.join(",")}
                onChange={handleInputChange}
                className="w-full rounded-lg border px-4 py-3"
              />
            </div>

            {/* JOURNAL */}
            <div>
              <label className="mb-1 block text-sm font-medium">Jurnal</label>

              <select
                name="journalId"
                value={formData.journalId}
                onChange={handleInputChange}
                className="w-full rounded-lg border px-4 py-3"
              >
                <option value="">Tanlang</option>

                {journals.map((journal) => (
                  <option key={journal.id} value={journal.id}>
                    {journal.title}
                  </option>
                ))}
              </select>
            </div>

            {/* LANGUAGE */}
            <div>
              <label className="mb-1 block text-sm font-medium">Til</label>

              <input
                type="text"
                name="language"
                value={formData.language}
                onChange={handleInputChange}
                className="w-full rounded-lg border px-4 py-3"
              />
            </div>

            {/* LICENSE */}
            <div>
              <label className="mb-1 block text-sm font-medium">License</label>
              <input
                type="text"
                name="license"
                value={formData.license}
                onChange={handleInputChange}
                className="w-full rounded-lg border px-4 py-3"
              />
            </div>

            {/* PAGE START / END */}
            <div>
              <label className="mb-1 block text-sm font-medium">Boshlang'ich sahifa</label>
              <input
                type="number"
                name="pageStart"
                value={formData.pageStart}
                onChange={handleInputChange}
                className="w-full rounded-lg border px-4 py-3"
                min="1"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Oxirgi sahifa</label>
              <input
                type="number"
                name="pageEnd"
                value={formData.pageEnd}
                onChange={handleInputChange}
                className="w-full rounded-lg border px-4 py-3"
                min="1"
              />
            </div>

            {/* RECEIVED DATE */}
            <div>
              <label className="mb-1 block text-sm font-medium">Qabul qilingan sana</label>
              <input
                type="date"
                name="receivedDate"
                value={formData.receivedDate}
                onChange={handleInputChange}
                className="w-full rounded-lg border px-4 py-3"
              />
            </div>

            {/* AUTHORS */}
            <div className="md:col-span-2">
              <div className="mb-2 flex items-center justify-between">
                <label className="text-sm font-medium">Mualliflar</label>
                <button
                  type="button"
                  onClick={addAuthor}
                  className="flex items-center gap-1 rounded-lg bg-indigo-50 px-3 py-1.5 text-xs font-medium text-indigo-600 hover:bg-indigo-100"
                >
                  <Plus size={14} /> Muallif qo'shish
                </button>
              </div>
              {formData.authors.length === 0 ? (
                <p className="rounded-lg border border-dashed border-gray-300 py-4 text-center text-sm text-gray-400">
                  Muallif qo'shilmagan
                </p>
              ) : (
                <div className="space-y-3">
                  {formData.authors.map((author, idx) => (
                    <div key={idx} className="rounded-lg border border-gray-200 bg-gray-50 p-3">
                      <div className="mb-2 flex items-center justify-between">
                        <span className="text-xs font-semibold text-gray-500">Muallif {idx + 1}</span>
                        <button
                          type="button"
                          onClick={() => removeAuthor(idx)}
                          className="text-red-400 hover:text-red-600"
                        >
                          <X size={14} />
                        </button>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          placeholder="To'liq ism *"
                          value={author.fullName}
                          onChange={(e) => updateAuthor(idx, "fullName", e.target.value)}
                          required
                          className="col-span-2 rounded border px-3 py-2 text-sm"
                        />
                        <input
                          type="email"
                          placeholder="Email"
                          value={author.email}
                          onChange={(e) => updateAuthor(idx, "email", e.target.value)}
                          className="rounded border px-3 py-2 text-sm"
                        />
                        <input
                          type="text"
                          placeholder="Tashkilot"
                          value={author.affiliation}
                          onChange={(e) => updateAuthor(idx, "affiliation", e.target.value)}
                          className="rounded border px-3 py-2 text-sm"
                        />
                        <input
                          type="text"
                          placeholder="ORCID"
                          value={author.orcid}
                          onChange={(e) => updateAuthor(idx, "orcid", e.target.value)}
                          className="rounded border px-3 py-2 text-sm"
                        />
                        <label className="flex items-center gap-2 text-sm">
                          <input
                            type="checkbox"
                            checked={author.corresponding}
                            onChange={(e) => updateAuthor(idx, "corresponding", e.target.checked)}
                          />
                          Mos muallif
                        </label>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* PDF */}
            <div className="md:col-span-2">
              <label className="mb-1 block text-sm font-medium">PDF fayl</label>

              <input
                type="file"
                accept=".pdf"
                onChange={(e) => setPdfFile(e.target.files[0])}
                className="w-full rounded-lg border px-4 py-3"
              />
            </div>
          </div>
          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setShowCreateModal(false)}
              className="rounded-lg border px-6 py-3"
            >
              Bekor qilish
            </button>

            <button
              type="submit"
              className="rounded-lg bg-indigo-600 px-6 py-3 text-white"
            >
              {isEditing ? "Saqlash" : "Yaratish"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Article Details Modal */}
      <Modal
        open={showModal}
        onClose={closeModal}
        center
        styles={{
          modal: {
            width: "90%",
            maxWidth: "900px",
            borderRadius: "24px",
            padding: "0",
            backgroundColor: "#ffffff",
            maxHeight: "90vh",
            overflowY: "auto",
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
          },
          overlay: {
            backgroundColor: "rgba(0, 0, 0, 0.6)",
            backdropFilter: "blur(6px)",
          },
        }}
      >
        {selectedArticle && (
          <div className="p-6">
            <div className="mb-4 flex items-start justify-between">
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-800">
                  {selectedArticle.title}
                </h2>
                <div className="mt-2 flex items-center gap-3">
                  {getStatusBadge(selectedArticle.status)}
                  <span className="text-sm text-gray-500">
                    {selectedArticle.journal?.title}
                  </span>
                </div>
              </div>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-6">
              {/* Abstract */}
              {selectedArticle.abstractText && (
                <div>
                  <h3 className="mb-2 font-semibold text-gray-700">
                    Annotatsiya
                  </h3>
                  <p className="text-gray-600">
                    {selectedArticle.abstractText}
                  </p>
                </div>
              )}

              {/* Keywords */}
              {selectedArticle.keywords &&
                selectedArticle.keywords.length > 0 && (
                  <div>
                    <h3 className="mb-2 font-semibold text-gray-700">
                      Kalit so'zlar
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedArticle.keywords.map((keyword, idx) => (
                        <span
                          key={idx}
                          className="rounded-full bg-indigo-100 px-3 py-1 text-sm text-indigo-700"
                        >
                          {keyword}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

              {/* Authors */}
              {selectedArticle.authors &&
                selectedArticle.authors.length > 0 && (
                  <div>
                    <h3 className="mb-2 font-semibold text-gray-700">
                      Mualliflar
                    </h3>
                    <div className="space-y-2">
                      {selectedArticle.authors.map((author, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-2 text-sm text-gray-600"
                        >
                          <span className="font-medium">{author.name}</span>
                          {author.email && (
                            <span className="text-gray-400">
                              ({author.email})
                            </span>
                          )}
                          {author.affiliation && (
                            <span className="text-gray-500">
                              - {author.affiliation}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              {/* Metadata */}
              <div className="grid grid-cols-2 gap-4 rounded-lg bg-gray-50 p-4">
                <div>
                  <p className="text-sm text-gray-500">Yuborilgan sana</p>
                  <p className="font-medium text-gray-800">
                    {selectedArticle.submittedAt
                      ? new Date(
                          selectedArticle.submittedAt
                        ).toLocaleDateString("uz-UZ")
                      : "-"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Yuborgan</p>
                  <p className="font-medium text-gray-800">
                    {selectedArticle.submittedBy?.name || "-"}
                  </p>
                </div>
                {selectedArticle.publishedAt && (
                  <div>
                    <p className="text-sm text-gray-500">Nashr etilgan sana</p>
                    <p className="font-medium text-gray-800">
                      {new Date(selectedArticle.publishedAt).toLocaleDateString(
                        "uz-UZ"
                      )}
                    </p>
                  </div>
                )}
                {selectedArticle.doi && (
                  <div>
                    <p className="text-sm text-gray-500">DOI</p>
                    <p className="font-medium text-gray-800">
                      {selectedArticle.doi}
                    </p>
                  </div>
                )}
              </div>

              {/* Status Change */}
              <div className="rounded-lg border border-gray-200 p-4">
                <h3 className="mb-3 font-semibold text-gray-700">
                  Holatni o'zgartirish
                </h3>
                {(() => {
                  const allowed = validTransitions[selectedArticle.status] || [];
                  if (allowed.length === 0) {
                    return (
                      <div className="flex items-center justify-between gap-4">
                        <p className="text-sm text-gray-400 italic">
                          Bu holat yakuniy — o'zgartirib bo'lmaydi
                          {selectedArticle.status === "REJECTED" ? " (rad etilgan)" : " (arxivlangan)"}
                        </p>
                        <button
                          onClick={resetArticle}
                          className="shrink-0 rounded-lg border border-orange-300 bg-orange-50 px-4 py-2 text-sm font-medium text-orange-700 transition hover:bg-orange-100"
                        >
                          Qayta yuborish (SUBMITTED)
                        </button>
                      </div>
                    );
                  }
                  return (
                    <div className="flex flex-wrap gap-2">
                      {articleStatuses
                        .filter((s) => allowed.includes(s.value))
                        .map((status) => (
                          <button
                            key={status.value}
                            onClick={() => updateArticleStatus(selectedArticle.id, status.value)}
                            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                          >
                            {status.label}
                          </button>
                        ))}
                    </div>
                  );
                })()}
              </div>

              {/* Assign to Issue */}
              {issuesForAssign.length > 0 && (
                <div className="rounded-lg border border-gray-200 p-4">
                  <h3 className="mb-3 font-semibold text-gray-700">Songa biriktirish</h3>
                  <div className="flex gap-3">
                    <select
                      value={selectedIssueId}
                      onChange={(e) => setSelectedIssueId(e.target.value)}
                      className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="">Son tanlang...</option>
                      {issuesForAssign.map((issue) => (
                        <option key={issue.id} value={issue.id}>
                          Tom {issue.volumeNumber}, Son {issue.issueNumber}
                          {issue.title ? ` — ${issue.title}` : ""}
                          {issue.current ? " (joriy)" : ""}
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={assignToIssue}
                      disabled={!selectedIssueId}
                      className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-700 disabled:opacity-40"
                    >
                      Biriktirish
                    </button>
                  </div>
                  {selectedArticle.issueId && (
                    <p className="mt-2 text-xs text-gray-400">
                      Hozir biriktirilgan: Tom {selectedArticle.volumeNumber}, Son {selectedArticle.issueNumber}
                    </p>
                  )}
                </div>
              )}

              {/* PDF Download */}
              {selectedArticle.pdfFile && (
                <div className="flex justify-end">
                  <a
                    href={`/api/v1/articles/${selectedArticle.id}/download`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-white transition hover:bg-indigo-700"
                  >
                    <Download size={18} />
                    PDF yuklab olish
                  </a>
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Articles;
