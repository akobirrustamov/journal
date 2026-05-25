import { useEffect, useState } from "react";
import ApiCall, { baseUrl } from "../../../config/index";
import { Modal } from "react-responsive-modal";
import "react-responsive-modal/styles.css";
import { Plus, Edit, X, ChevronDown, ChevronRight, FileText, Trash2 } from "lucide-react";
import { ToastContainer, useToast } from "../../../components/ui/Toast";

const emptyForm = {
  id: null,
  journalId: "",
  volumeNumber: "",
  issueNumber: "",
  title: "",
  description: "",
  publishedDate: "",
  current: false,
  doi: "",
};

export default function IssuesAdmin() {
  const { toasts, removeToast, success, error: toastError } = useToast();
  const [journals, setJournals] = useState([]);
  const [issuesByJournal, setIssuesByJournal] = useState({});
  const [expandedJournal, setExpandedJournal] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState(emptyForm);
  const [coverFile, setCoverFile] = useState(null);
  const [coverPreview, setCoverPreview] = useState(null);

  useEffect(() => {
    loadJournals();
  }, []);

  const loadJournals = async () => {
    const res = await ApiCall("/api/v1/journals?size=100", "GET");
    if (!res.error) {
      const data = res.data?.data || res.data;
      const list = data?.content || data;
      if (Array.isArray(list)) setJournals(list);
    }
  };

  const loadIssues = async (journalId) => {
    if (issuesByJournal[journalId]) return;
    const res = await ApiCall(`/api/v1/journals/${journalId}/issues`, "GET");
    if (!res.error) {
      const list = res.data?.data || res.data || [];
      setIssuesByJournal((prev) => ({ ...prev, [journalId]: Array.isArray(list) ? list : [] }));
    }
  };

  const toggleJournal = async (journalId) => {
    if (expandedJournal === journalId) {
      setExpandedJournal(null);
    } else {
      setExpandedJournal(journalId);
      await loadIssues(journalId);
    }
  };

  const refreshIssues = async (journalId) => {
    const res = await ApiCall(`/api/v1/journals/${journalId}/issues`, "GET");
    if (!res.error) {
      const list = res.data?.data || res.data || [];
      setIssuesByJournal((prev) => ({ ...prev, [journalId]: Array.isArray(list) ? list : [] }));
    }
  };

  const openCreate = (journalId) => {
    setFormData({ ...emptyForm, journalId });
    setIsEditing(false);
    setCoverFile(null);
    setCoverPreview(null);
    setShowModal(true);
  };

  const openEdit = (issue) => {
    setFormData({
      id: issue.id,
      journalId: issue.journalId,
      volumeNumber: issue.volumeNumber || "",
      issueNumber: issue.issueNumber || "",
      title: issue.title || "",
      description: issue.description || "",
      publishedDate: issue.publishedDate || "",
      current: issue.current || false,
      doi: issue.doi || "",
    });
    setIsEditing(true);
    setCoverFile(null);
    setCoverPreview(null);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setFormData(emptyForm);
    setCoverFile(null);
    setCoverPreview(null);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        journalId: formData.journalId,
        volumeNumber: parseInt(formData.volumeNumber),
        issueNumber: parseInt(formData.issueNumber),
        title: formData.title || null,
        description: formData.description || null,
        publishedDate: formData.publishedDate || null,
        current: formData.current,
        doi: formData.doi || null,
      };

      let res;
      let issueId;
      if (isEditing) {
        res = await ApiCall(`/api/v1/issues/${formData.id}`, "PUT", payload);
        issueId = formData.id;
      } else {
        res = await ApiCall("/api/v1/issues", "POST", payload);
        issueId = res.data?.data?.id || res.data?.id;
      }

      if (!res.error) {
        if (coverFile && issueId) {
          await uploadCover(issueId);
        }
        await refreshIssues(formData.journalId);
        closeModal();
        success(isEditing ? "Son muvaffaqiyatli yangilandi!" : "Yangi son yaratildi!");
      } else {
        toastError("Xatolik: " + (res.data?.message || "So'rov bajarilmadi"));
      }
    } catch (err) {
      console.error(err);
      toastError("Xatolik yuz berdi");
    } finally {
      setLoading(false);
    }
  };

  const uploadCover = async (issueId) => {
    const fd = new FormData();
    fd.append("file", coverFile);
    const token = localStorage.getItem("access_token");
    await fetch(`${baseUrl}/api/v1/issues/${issueId}/cover`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: fd,
    });
  };

  const handleCoverChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setCoverFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setCoverPreview(reader.result);
    reader.readAsDataURL(file);
  };

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="mb-6 rounded-2xl bg-white p-6 shadow-sm">
          <h1 className="text-2xl font-bold text-gray-800">Sonlarni boshqarish</h1>
          <p className="mt-1 text-sm text-gray-500">Jurnallarning tom va sonlarini yaratish va tahrirlash</p>
        </div>

        {/* Journals list */}
        <div className="space-y-3">
          {journals.length === 0 ? (
            <div className="rounded-xl bg-white p-8 text-center text-gray-400 shadow-sm">
              Jurnallar topilmadi. Avval jurnal yarating.
            </div>
          ) : (
            journals.map((journal) => (
              <div key={journal.id} className="overflow-hidden rounded-xl bg-white shadow-sm">
                {/* Journal row */}
                <div
                  className="flex cursor-pointer items-center justify-between px-5 py-4 transition hover:bg-gray-50"
                  onClick={() => toggleJournal(journal.id)}
                >
                  <div className="flex items-center gap-3">
                    {expandedJournal === journal.id ? (
                      <ChevronDown size={18} className="text-gray-400" />
                    ) : (
                      <ChevronRight size={18} className="text-gray-400" />
                    )}
                    <div>
                      <p className="font-semibold text-gray-800">{journal.title}</p>
                      {journal.titleAbbr && (
                        <p className="text-xs text-gray-400">{journal.titleAbbr}</p>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); openCreate(journal.id); }}
                    className="flex items-center gap-1 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700"
                  >
                    <Plus size={14} /> Son qo'shish
                  </button>
                </div>

                {/* Issues list */}
                {expandedJournal === journal.id && (
                  <div className="border-t border-gray-100 px-5 pb-4">
                    {!issuesByJournal[journal.id] ? (
                      <div className="py-4 text-center text-sm text-gray-400">Yuklanmoqda...</div>
                    ) : issuesByJournal[journal.id].length === 0 ? (
                      <div className="py-6 text-center text-sm text-gray-400">
                        <FileText className="mx-auto mb-2 h-8 w-8 text-gray-200" />
                        Bu jurnal uchun hali sonlar yo'q
                      </div>
                    ) : (
                      <div className="mt-3 grid gap-3 sm:grid-cols-2 md:grid-cols-3">
                        {issuesByJournal[journal.id].map((issue) => (
                          <div
                            key={issue.id}
                            className="rounded-lg border border-gray-200 p-4"
                          >
                            <div className="mb-1 flex items-start justify-between">
                              <span className="text-xs font-semibold text-blue-600">
                                Tom {issue.volumeNumber}, Son {issue.issueNumber}
                              </span>
                              {issue.current && (
                                <span className="rounded bg-green-100 px-1.5 py-0.5 text-xs text-green-700">Joriy</span>
                              )}
                            </div>
                            <p className="mb-1 text-sm font-medium text-gray-700 line-clamp-1">
                              {issue.title || `${issue.volumeNumber}-tom, ${issue.issueNumber}-son`}
                            </p>
                            {issue.publishedDate && (
                              <p className="mb-3 text-xs text-gray-400">
                                {new Date(issue.publishedDate).toLocaleDateString("uz-UZ")}
                              </p>
                            )}
                            <button
                              onClick={() => openEdit(issue)}
                              className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800"
                            >
                              <Edit size={13} /> Tahrirlash
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modal */}
      <Modal
        open={showModal}
        onClose={closeModal}
        center
        styles={{
          modal: {
            width: "90%", maxWidth: "600px", borderRadius: "20px",
            padding: 0, maxHeight: "90vh", overflowY: "auto",
          },
          overlay: { backgroundColor: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" },
        }}
      >
        <div className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-800">
              {isEditing ? "Sonni tahrirlash" : "Yangi son qo'shish"}
            </h2>
            <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Journal select (only for create) */}
            {!isEditing && (
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Jurnal <span className="text-red-500">*</span>
                </label>
                <select
                  name="journalId"
                  value={formData.journalId}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Jurnalni tanlang</option>
                  {journals.map((j) => (
                    <option key={j.id} value={j.id}>{j.title}</option>
                  ))}
                </select>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Tom raqami <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="volumeNumber"
                  value={formData.volumeNumber}
                  onChange={handleChange}
                  required
                  min="1"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Son raqami <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="issueNumber"
                  value={formData.issueNumber}
                  onChange={handleChange}
                  required
                  min="1"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Son sarlavhasi</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="2024-yil 2-son"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Tavsif</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="2"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Nashr sanasi</label>
                <input
                  type="date"
                  name="publishedDate"
                  value={formData.publishedDate}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">DOI</label>
                <input
                  type="text"
                  name="doi"
                  value={formData.doi}
                  onChange={handleChange}
                  placeholder="10.12345/..."
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                name="current"
                checked={formData.current}
                onChange={handleChange}
                className="h-4 w-4 rounded border-gray-300 text-blue-600"
              />
              <span className="text-gray-700">Bu joriy son</span>
            </label>

            {/* Cover image */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Muqova rasmi</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleCoverChange}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              />
              {coverPreview && (
                <div className="relative mt-2">
                  <img src={coverPreview} alt="preview" className="h-32 w-full rounded-lg object-cover" />
                  <button
                    type="button"
                    onClick={() => { setCoverFile(null); setCoverPreview(null); }}
                    className="absolute right-2 top-2 rounded-full bg-red-500 p-1 text-white"
                  >
                    <X size={14} />
                  </button>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={closeModal}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                Bekor qilish
              </button>
              <button
                type="submit"
                disabled={loading}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? "Saqlanmoqda..." : isEditing ? "Yangilash" : "Yaratish"}
              </button>
            </div>
          </form>
        </div>
      </Modal>
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  );
}
