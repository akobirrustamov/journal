import { useEffect, useState } from "react";
import axios from "axios";
import ApiCall, { baseUrl } from "../../../config/index";
import { fileUrl } from "../../../config/fileUrl";
import { Modal } from "react-responsive-modal";
import "react-responsive-modal/styles.css";
import { Trash2, Edit, X, Plus, Users } from "lucide-react";
import { ToastContainer, useToast } from "../../../components/ui/Toast";

const emptyBoardForm = {
  fullName: "",
  email: "",
  orcid: "",
  affiliation: "",
  country: "",
  position: "",
  bio: "",
  orderIndex: 1,
};

const Journals = () => {
  const { toasts, removeToast, success, error: toastError } = useToast();
  // State
  const [journals, setJournals] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState(null);
  const [boardError, setBoardError] = useState(null);
  const [coverFile, setCoverFile] = useState(null);
  const [coverPreview, setCoverPreview] = useState(null);
  const [templateFile, setTemplateFile] = useState(null);
  const [templatePreview, setTemplatePreview] = useState(null);

  // Board state
  const [showBoardModal, setShowBoardModal] = useState(false);
  const [boardJournal, setBoardJournal] = useState(null);
  const [boardMembers, setBoardMembers] = useState([]);
  const [boardLoading, setBoardLoading] = useState(false);
  const [boardForm, setBoardForm] = useState(emptyBoardForm);
  const [showAddMember, setShowAddMember] = useState(false);
  const [formData, setFormData] = useState({
    id: null,
    coverImageId: "",
    title: "",
    titleAbbr: "",
    slug: "",
    issnPrint: "",
    issnOnline: "",
    isbn: "",
    description: "",
    shortDescription: "",
    publicationFrequency: "MONTHLY",
    foundedYear: new Date().getFullYear(),
    publisher: "",
    language: "uz",
    country: "Uzbekistan",
    scope: "",
    metaTitle: "",
    metaDescription: "",
    metaKeywords: "",
    openAccess: true,
    website: "",
    email: "",
    phone: "",
    license: "CC BY 4.0",
  });

  // Fetch journals on mount
  useEffect(() => {
    getJournals();
  }, []);

  // ---------- API Calls ----------
  const getJournals = async () => {
    try {
      const result = await ApiCall("/api/v1/journals", "GET");
      if (!result.error && result.data) {
        // Handle pagination response - backend returns Page<JournalResponse> wrapped in ApiResponse
        const journalsList =
          result.data?.data?.content ||
          result.data?.content ||
          result.data?.data ||
          result.data;
        // Ensure it's an array
        if (Array.isArray(journalsList)) {
          setJournals(journalsList);
        } else {
          console.warn("Journals data is not an array:", journalsList);
          setJournals([]);
        }
      } else {
        setJournals([]);
      }
    } catch (error) {
      console.error("Jurnallarni olishda xatolik", error);
      setJournals([]);
    }
  };

  const createJournal = async (journalData) => {
    try {
      setLoading(true);

      const result = await ApiCall("/api/v1/journals", "POST", journalData);
      if (result.error) {
        throw new Error(result.data?.message || "Jurnal yaratilmadi");
      }

      await getJournals();

      closeModal();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const updateJournal = async (id, journalData) => {
    try {
      setLoading(true);

      // 1. Update journal
      const result = await ApiCall(
        `/api/v1/journals/${id}`,
        "PUT",
        journalData
      );

      if (result.error) {
        throw new Error(result.data?.message || "Jurnal yangilanmadi");
      }

      await getJournals();
      closeModal();
      success("Jurnal muvaffaqiyatli yangilandi!");
    } catch (error) {
      console.error(error);
      toastError("Jurnalni yangilashda xatolik yuz berdi");
    } finally {
      setLoading(false);
    }
  };

  const deleteJournal = async (id) => {
    if (window.confirm("Ushbu jurnalni o'chirishni xohlaysizmi?")) {
      try {
        const result = await ApiCall(`/api/v1/journals/${id}`, "DELETE");
        if (!result.error) {
          await getJournals();
          success("Jurnal muvaffaqiyatli o'chirildi!");
        } else {
          toastError("Xatolik: " + (result.data?.message || "O'chirilmadi"));
        }
      } catch (error) {
        console.error("O'chirishda xatolik", error);
        toastError("Jurnalni o'chirishda xatolik yuz berdi");
      }
    }
  };
  const uploadCoverImage = async (journalId, file) => {
    try {
      const formData = new FormData();
      formData.append("file", file);
      const token = localStorage.getItem("access_token");
      await axios.post(`${baseUrl}/api/v1/journals/${journalId}/cover`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (error) {
      console.error(error);
      toastError("Muqova rasmi yuklanmadi");
    }
  };

  const uploadTemplateImage = async (journalId, file) => {
    try {
      const formData = new FormData();
      formData.append("file", file);
      const token = localStorage.getItem("access_token");
      await axios.post(`${baseUrl}/api/v1/journals/${journalId}/template`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (error) {
      console.error(error);
      toastError("Shablon rasmi yuklanmadi");
    }
  };

  const handleCoverChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCoverFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setCoverPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const removeCoverPreview = () => {
    setCoverFile(null);
    setCoverPreview(null);
  };

  const handleTemplateChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setTemplateFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setTemplatePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const removeTemplatePreview = () => {
    setTemplateFile(null);
    setTemplatePreview(null);
  };

  // ---------- Form Handlers ----------
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);

    const payload = {
      title: formData.title,
      titleAbbr: formData.titleAbbr,
      slug: formData.slug || undefined,
      issnPrint: formData.issnPrint,
      issnOnline: formData.issnOnline,
      isbn: formData.isbn,
      description: formData.description,
      shortDescription: formData.shortDescription,
      publicationFrequency: formData.publicationFrequency,
      foundedYear: parseInt(formData.foundedYear),
      publisher: formData.publisher,
      language: formData.language,
      country: formData.country,
      scope: formData.scope,
      metaTitle: formData.metaTitle,
      metaDescription: formData.metaDescription,
      metaKeywords: formData.metaKeywords,
      openAccess: formData.openAccess,
      website: formData.website,
      email: formData.email,
      phone: formData.phone,
      license: formData.license,
    };

    try {
      setLoading(true);

      let result;

      // CREATE
      // CREATE
      if (!isEditing) {
        result = await ApiCall("/api/v1/journals", "POST", payload);

        if (result.error) {
          setFormError(result.data?.message || "Jurnal yaratilmadi");
          return;
        }

        const createdJournal = result?.data?.data;

        // upload images AFTER create
        if (coverFile && createdJournal?.id) {
          await uploadCoverImage(createdJournal.id, coverFile);
        }
        if (templateFile && createdJournal?.id) {
          await uploadTemplateImage(createdJournal.id, templateFile);
        }
      } else {
        // UPDATE
        result = await ApiCall(
          `/api/v1/journals/${formData.id}`,
          "PUT",
          payload
        );

        if (result.error) {
          setFormError(result.data?.message || "Jurnal yangilanmadi");
          return;
        }

        // upload images AFTER update
        if (coverFile) {
          await uploadCoverImage(formData.id, coverFile);
        }
        if (templateFile) {
          await uploadTemplateImage(formData.id, templateFile);
        }
      }

      await getJournals();
      closeModal();
    } catch (error) {
      console.error(error);
      setFormError("Kutilmagan xatolik yuz berdi");
    } finally {
      setLoading(false);
    }
  };

  const openEditModal = (journal) => {
    setFormData({
      id: journal.id,
      title: journal.title || "",
      titleAbbr: journal.titleAbbr || "",
      slug: journal.slug || "",
      issnPrint: journal.issnPrint || "",
      issnOnline: journal.issnOnline || "",
      isbn: journal.isbn || "",
      description: journal.description || "",
      shortDescription: journal.shortDescription || "",
      publicationFrequency: journal.publicationFrequency || "MONTHLY",
      foundedYear: journal.foundedYear || new Date().getFullYear(),
      publisher: journal.publisher || "",
      language: journal.language || "uz",
      country: journal.country || "Uzbekistan",
      scope: journal.scope || "",
      metaTitle: journal.metaTitle || "",
      metaDescription: journal.metaDescription || "",
      metaKeywords: journal.metaKeywords || "",
      openAccess: journal.openAccess !== undefined ? journal.openAccess : true,
      website: journal.website || "",
      email: journal.email || "",
      phone: journal.phone || "",
      license: journal.license || "CC BY 4.0",
    });
    setCoverFile(null);
    setCoverPreview(journal.coverImageUrl);
    setTemplateFile(null);
    setTemplatePreview(journal.templateImageUrl || null);
    setFormError(null);
    setIsEditing(true);
    setShowModal(true);
  };

  const openCreateModal = () => {
    setFormData({
      id: null,
      coverImageId: "",
      title: "",
      titleAbbr: "",
      slug: "",
      issnPrint: "",
      issnOnline: "",
      isbn: "",
      description: "",
      shortDescription: "",
      publicationFrequency: "MONTHLY",
      foundedYear: new Date().getFullYear(),
      publisher: "",
      language: "uz",
      country: "Uzbekistan",
      scope: "",
      metaTitle: "",
      metaDescription: "",
      metaKeywords: "",
      openAccess: true,
      website: "",
      email: "",
      phone: "",
      license: "CC BY 4.0",
    });
    setTemplateFile(null);
    setTemplatePreview(null);
    setFormError(null);
    setIsEditing(false);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setFormData({
      id: null,
      coverImageId: "",
      title: "",
      titleAbbr: "",
      slug: "",
      issnPrint: "",
      issnOnline: "",
      isbn: "",
      description: "",
      shortDescription: "",
      publicationFrequency: "MONTHLY",
      foundedYear: new Date().getFullYear(),
      publisher: "",
      language: "uz",
      country: "Uzbekistan",
      scope: "",
      metaTitle: "",
      metaDescription: "",
      metaKeywords: "",
      openAccess: true,
      website: "",
      email: "",
      phone: "",
      license: "CC BY 4.0",
    });
    setIsEditing(false);
    setCoverFile(null);
    setCoverPreview(null);
    setTemplateFile(null);
    setTemplatePreview(null);
    setFormError(null);
    setBoardError(null);
  };

  // ---------- Board functions ----------
  const openBoardModal = async (journal) => {
    setBoardJournal(journal);
    setBoardMembers([]);
    setBoardForm(emptyBoardForm);
    setBoardError(null);
    setShowAddMember(false);
    setShowBoardModal(true);
    setBoardLoading(true);
    try {
      const res = await ApiCall(`/api/v1/journals/${journal.id}/board`, "GET");
      const list = res.data?.data || res.data || [];
      setBoardMembers(Array.isArray(list) ? list : []);
    } catch (e) {
      console.error(e);
    } finally {
      setBoardLoading(false);
    }
  };

  const addBoardMember = async (e) => {
    e.preventDefault();
    setBoardError(null);
    setBoardLoading(true);
    try {
      const res = await ApiCall(`/api/v1/journals/${boardJournal.id}/board`, "POST", boardForm);
      if (!res.error) {
        const updated = await ApiCall(`/api/v1/journals/${boardJournal.id}/board`, "GET");
        const list = updated.data?.data || updated.data;
        setBoardMembers(Array.isArray(list) ? list : []);
        setBoardForm(emptyBoardForm);
        setShowAddMember(false);
        success("A'zo muvaffaqiyatli qo'shildi!");
      } else {
        setBoardError(res.data?.message || "A'zo qo'shilmadi");
      }
    } catch (e) {
      console.error(e);
      setBoardError("Kutilmagan xatolik yuz berdi");
    } finally {
      setBoardLoading(false);
    }
  };

  const removeBoardMember = async (memberId) => {
    if (!window.confirm("A'zoni o'chirishni xohlaysizmi?")) return;
    try {
      const res = await ApiCall(`/api/v1/journals/board/${memberId}`, "DELETE");
      if (!res.error) {
        setBoardMembers((prev) => prev.filter((m) => m.id !== memberId));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const publicationFrequencies = [
    { value: "WEEKLY", label: "Haftalik" },
    { value: "BIWEEKLY", label: "Ikki haftada bir marta" },
    { value: "MONTHLY", label: "Oylik" },
    { value: "BIMONTHLY", label: "Ikki oyda bir marta" },
    { value: "QUARTERLY", label: "Choraklik" },
    { value: "SEMIANNUAL", label: "Yiliga ikki marta" },
    { value: "ANNUAL", label: "Yillik" },
  ];

  return (
    <div className="min-h-screen  py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-8xl mx-auto overflow-hidden rounded-2xl bg-white shadow-lg">
        {/* Header */}
        <div className="flex flex-col items-center justify-between border-b border-gray-200 bg-gradient-to-r from-purple-50 to-indigo-50 p-6 sm:flex-row">
          <div>
            <h1 className="mb-1 text-2xl font-bold text-gray-800">
              Jurnallarni boshqarish
            </h1>
            <p className="text-sm text-gray-600">
              Ilmiy jurnallarni yaratish va tahrirlash
            </p>
          </div>
          <button
            onClick={openCreateModal}
            className="mt-3 inline-flex items-center rounded-lg bg-purple-600 px-4 py-2 text-white shadow-sm transition duration-200 hover:bg-purple-700 sm:mt-0"
          >
            <Plus size={18} className="mr-2" />
            Yangi jurnal qo'shish
          </button>
        </div>

        {/* Journals Grid */}
        <div className="p-6">
          {!journals || journals.length === 0 ? (
            <div className="py-12 text-center text-gray-500">
              <p className="mb-4 text-lg">Jurnallar topilmadi</p>
              <button
                onClick={openCreateModal}
                className="inline-flex items-center rounded-lg bg-purple-600 px-4 py-2 text-white transition hover:bg-purple-700"
              >
                <Plus size={18} className="mr-2" />
                Birinchi jurnalni yarating
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {journals.map((journal) => (
                <div
                  key={journal.id}
                  className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition hover:shadow-md"
                >
                  {/* Cover Image */}
                  {(() => {
                    const coverImageSrc = fileUrl(journal.coverImageUrl);

                    return coverImageSrc ? (
                      <div className="h-48 w-full bg-gradient-to-r from-purple-500 to-indigo-600">
                        <img
                          src={coverImageSrc}
                          alt={journal.title}
                          className="h-full w-full object-cover"
                          onError={(e) => {
                            e.target.style.display = "none";
                            e.target.parentElement.innerHTML = `<div class="flex h-full items-center justify-center bg-gradient-to-r from-purple-500 to-indigo-600"><h3 class="text-lg font-bold text-white px-4 text-center">${journal.title}</h3></div>`;
                          }}
                        />
                      </div>
                    ) : (
                      <div className="bg-gradient-to-r from-purple-500 to-indigo-600 p-4">
                        <h3 className="text-lg font-bold text-white">
                          {journal.title}
                        </h3>

                        {journal.titleAbbr && (
                          <p className="mt-1 text-sm text-purple-100">
                            {journal.titleAbbr}
                          </p>
                        )}
                      </div>
                    );
                  })()}

                  <div className="p-4">
                    {(journal.coverImageUrl || journal.coverImageId) && (
                      <h3 className="mb-2 text-lg font-bold text-gray-800">
                        {journal.title}
                      </h3>
                    )}
                    <div className="mb-3 space-y-2 text-sm">
                      {journal.issnPrint && (
                        <p className="text-gray-600">
                          <span className="font-medium">ISSN Print:</span>{" "}
                          {journal.issnPrint}
                        </p>
                      )}
                      {journal.issnOnline && (
                        <p className="text-gray-600">
                          <span className="font-medium">ISSN Online:</span>{" "}
                          {journal.issnOnline}
                        </p>
                      )}
                      {journal.publisher && (
                        <p className="text-gray-600">
                          <span className="font-medium">Nashriyot:</span>{" "}
                          {journal.publisher}
                        </p>
                      )}
                      {journal.publicationFrequency && (
                        <p className="text-gray-600">
                          <span className="font-medium">Chastota:</span>{" "}
                          {publicationFrequencies.find(
                            (f) => f.value === journal.publicationFrequency
                          )?.label || journal.publicationFrequency}
                        </p>
                      )}
                    </div>
                    {journal.shortDescription && (
                      <p className="line-clamp-2 mb-3 text-sm text-gray-500">
                        {journal.shortDescription}
                      </p>
                    )}
                    <div className="flex items-center justify-between">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          journal.active
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {journal.active ? "Faol" : "Nofaol"}
                      </span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => openBoardModal(journal)}
                          className="text-green-600 hover:text-green-900"
                          aria-label="Redkollegiya"
                          title="Redkollegiya"
                        >
                          <Users size={18} />
                        </button>
                        <button
                          onClick={() => openEditModal(journal)}
                          className="text-indigo-600 hover:text-indigo-900"
                          aria-label="Tahrirlash"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => deleteJournal(journal.id)}
                          className="text-red-600 hover:text-red-900"
                          aria-label="O'chirish"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal for Create/Edit */}
      <Modal
        open={showModal}
        onClose={closeModal}
        center
        styles={{
          modal: {
            width: "90%",
            maxWidth: "800px",
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
        <div className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-800">
              {isEditing ? "Jurnalni tahrirlash" : "Yangi jurnal qo'shish"}
            </h2>
            <button
              onClick={closeModal}
              className="text-gray-400 hover:text-gray-600"
            >
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {formError && (
              <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                <span className="mt-0.5 shrink-0 text-red-500">✕</span>
                <span>{formError}</span>
                <button type="button" onClick={() => setFormError(null)} className="ml-auto shrink-0 text-red-400 hover:text-red-600">✕</button>
              </div>
            )}

            {/* Basic Info */}
            <div className="rounded-lg bg-gray-50 p-4">
              <h3 className="mb-3 font-semibold text-gray-700">
                Asosiy ma'lumotlar
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Jurnal nomi <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Ilmiy jurnal nomi"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Qisqartma nomi
                  </label>
                  <input
                    type="text"
                    name="titleAbbr"
                    value={formData.titleAbbr}
                    onChange={handleInputChange}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="J. Sci. Res."
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Slug <span className="text-xs font-normal text-gray-400">(URL uchun, ixtiyoriy — bo'sh qoldirilsa avtomatik yaratiladi)</span>
                  </label>
                  <input
                    type="text"
                    name="slug"
                    value={formData.slug}
                    onChange={handleInputChange}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="ilmiy-jurnal-nomi"
                  />
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                      ISSN Print
                    </label>
                    <input
                      type="text"
                      name="issnPrint"
                      value={formData.issnPrint}
                      onChange={handleInputChange}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="1234-5678"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                      ISSN Online
                    </label>
                    <input
                      type="text"
                      name="issnOnline"
                      value={formData.issnOnline}
                      onChange={handleInputChange}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="1234-5679"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    ISBN
                  </label>
                  <input
                    type="text"
                    name="isbn"
                    value={formData.isbn}
                    onChange={handleInputChange}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="978-3-16-148410-0"
                  />
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="rounded-lg bg-gray-50 p-4">
              <h3 className="mb-3 font-semibold text-gray-700">Tavsif</h3>
              <div className="space-y-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Qisqa tavsif
                  </label>
                  <textarea
                    name="shortDescription"
                    value={formData.shortDescription}
                    onChange={handleInputChange}
                    rows="2"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Qisqacha tavsif..."
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    To'liq tavsif
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows="4"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Jurnal haqida to'liq ma'lumot..."
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Ilmiy yo'nalish
                  </label>
                  <textarea
                    name="scope"
                    value={formData.scope}
                    onChange={handleInputChange}
                    rows="2"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Ilmiy tadqiqot yo'nalishlari..."
                  />
                </div>
              </div>
            </div>

            {/* Cover Image Upload */}
            <div className="rounded-lg bg-gray-50 p-4">
              <h3 className="mb-3 font-semibold text-gray-700">Muqova rasmi</h3>
              <div className="space-y-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Rasm yuklash
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleCoverChange}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                {coverPreview && (
                  <div className="relative">
                    <img
                      src={coverPreview}
                      alt="Cover preview"
                      className="h-48 w-full rounded-lg object-cover"
                    />
                    <button
                      type="button"
                      onClick={removeCoverPreview}
                      className="absolute right-2 top-2 rounded-full bg-red-500 p-1 text-white hover:bg-red-600"
                    >
                      <X size={16} />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Template Image Upload */}
            <div className="rounded-lg bg-gray-50 p-4">
              <h3 className="mb-1 font-semibold text-gray-700">Orqa muqova shabloni (JPG)</h3>
              <p className="mb-3 text-xs text-gray-500">Har bir jurnal uchun orqa sahifa shabloni rasmi</p>
              <div className="space-y-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Shablon yuklash
                  </label>
                  <input
                    type="file"
                    accept="image/jpeg,image/jpg,image/png"
                    onChange={handleTemplateChange}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                {templatePreview && (
                  <div className="relative">
                    <img
                      src={templatePreview}
                      alt="Template preview"
                      className="h-48 w-full rounded-lg object-cover"
                    />
                    <button
                      type="button"
                      onClick={removeTemplatePreview}
                      className="absolute right-2 top-2 rounded-full bg-red-500 p-1 text-white hover:bg-red-600"
                    >
                      <X size={16} />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Publication Info */}
            <div className="rounded-lg bg-gray-50 p-4">
              <h3 className="mb-3 font-semibold text-gray-700">
                Nashr ma'lumotlari
              </h3>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Nashriyot
                  </label>
                  <input
                    type="text"
                    name="publisher"
                    value={formData.publisher}
                    onChange={handleInputChange}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Nashriyot nomi"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Nashr chastotasi
                  </label>
                  <select
                    name="publicationFrequency"
                    value={formData.publicationFrequency}
                    onChange={handleInputChange}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    {publicationFrequencies.map((freq) => (
                      <option key={freq.value} value={freq.value}>
                        {freq.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Tashkil etilgan yil
                  </label>
                  <input
                    type="number"
                    name="foundedYear"
                    value={formData.foundedYear}
                    onChange={handleInputChange}
                    min="1900"
                    max={new Date().getFullYear()}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Til
                  </label>
                  <select
                    name="language"
                    value={formData.language}
                    onChange={handleInputChange}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="uz">O'zbek</option>
                    <option value="en">English</option>
                    <option value="ru">Русский</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Mamlakat
                  </label>
                  <input
                    type="text"
                    name="country"
                    value={formData.country}
                    onChange={handleInputChange}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Uzbekistan"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Litsenziya
                  </label>
                  <input
                    type="text"
                    name="license"
                    value={formData.license}
                    onChange={handleInputChange}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="CC BY 4.0"
                  />
                </div>
              </div>

              <div className="mt-4">
                <label className="inline-flex items-center">
                  <input
                    type="checkbox"
                    name="openAccess"
                    checked={formData.openAccess}
                    onChange={handleInputChange}
                    className="form-checkbox h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    Ochiq kirish (Open Access)
                  </span>
                </label>
              </div>
            </div>

            {/* Contact Info */}
            <div className="rounded-lg bg-gray-50 p-4">
              <h3 className="mb-3 font-semibold text-gray-700">
                Aloqa ma'lumotlari
              </h3>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Website
                  </label>
                  <input
                    type="url"
                    name="website"
                    value={formData.website}
                    onChange={handleInputChange}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="https://example.com"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="journal@example.com"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Telefon
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="+998 xx xxx xx xx"
                  />
                </div>
              </div>
            </div>

            {/* SEO Meta */}
            <div className="rounded-lg bg-gray-50 p-4">
              <h3 className="mb-3 font-semibold text-gray-700">
                SEO ma'lumotlari
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Meta Title
                  </label>
                  <input
                    type="text"
                    name="metaTitle"
                    value={formData.metaTitle}
                    onChange={handleInputChange}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="SEO uchun sarlavha"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Meta Description
                  </label>
                  <textarea
                    name="metaDescription"
                    value={formData.metaDescription}
                    onChange={handleInputChange}
                    rows="2"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="SEO uchun tavsif"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Meta Keywords
                  </label>
                  <input
                    type="text"
                    name="metaKeywords"
                    value={formData.metaKeywords}
                    onChange={handleInputChange}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="kalit so'zlar, vergul bilan ajratilgan"
                  />
                </div>
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={closeModal}
                className="rounded-lg border border-gray-300 px-4 py-2 text-gray-700 transition hover:bg-gray-50"
              >
                Bekor qilish
              </button>
              <button
                type="submit"
                disabled={loading}
                className="rounded-lg bg-purple-600 px-4 py-2 text-white transition hover:bg-purple-700 disabled:opacity-50"
              >
                {loading
                  ? "Saqlanmoqda..."
                  : isEditing
                  ? "Yangilash"
                  : "Yaratish"}
              </button>
            </div>
          </form>
        </div>
      </Modal>

      {/* Board Modal */}
      <Modal
        open={showBoardModal}
        onClose={() => setShowBoardModal(false)}
        center
        styles={{
          modal: {
            width: "90%", maxWidth: "700px", borderRadius: "20px",
            padding: 0, maxHeight: "90vh", overflowY: "auto",
          },
          overlay: { backgroundColor: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)" },
        }}
      >
        <div className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-800">
              Redkollegiya — {boardJournal?.title}
            </h2>
            <button onClick={() => setShowBoardModal(false)} className="text-gray-400 hover:text-gray-600">
              <X size={20} />
            </button>
          </div>

          {boardError && (
            <div className="mb-4 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              <span className="mt-0.5 shrink-0 text-red-500">✕</span>
              <span>{boardError}</span>
              <button type="button" onClick={() => setBoardError(null)} className="ml-auto shrink-0 text-red-400 hover:text-red-600">✕</button>
            </div>
          )}

          {boardLoading ? (
            <div className="flex justify-center py-8">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-purple-200 border-t-purple-600" />
            </div>
          ) : (
            <>
              {/* Members list */}
              {boardMembers.length === 0 ? (
                <p className="mb-4 rounded-lg border border-dashed border-gray-300 py-6 text-center text-sm text-gray-400">
                  A'zolar yo'q
                </p>
              ) : (
                <div className="mb-4 space-y-2">
                  {boardMembers.map((m) => (
                    <div key={m.id} className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
                      <div>
                        <p className="text-sm font-semibold text-gray-800">{m.fullName}</p>
                        <p className="text-xs text-purple-600">{m.position}</p>
                        {m.affiliation && <p className="text-xs text-gray-500">{m.affiliation}</p>}
                        {m.orcid && <p className="text-xs text-green-600">ORCID: {m.orcid}</p>}
                      </div>
                      <button
                        onClick={() => removeBoardMember(m.id)}
                        className="ml-4 text-red-400 hover:text-red-600"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Toggle add form */}
              {!showAddMember ? (
                <button
                  onClick={() => setShowAddMember(true)}
                  className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-purple-300 py-2 text-sm font-medium text-purple-600 hover:border-purple-400 hover:bg-purple-50"
                >
                  <Plus size={16} /> A'zo qo'shish
                </button>
              ) : (
                <form onSubmit={addBoardMember} className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                  <h3 className="mb-3 text-sm font-semibold text-gray-700">Yangi a'zo</h3>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                      <label className="mb-1 block text-xs font-medium text-gray-600">To'liq ism *</label>
                      <input required type="text" value={boardForm.fullName}
                        onChange={(e) => setBoardForm((p) => ({ ...p, fullName: e.target.value }))}
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-medium text-gray-600">Lavozim *</label>
                      <input required type="text" placeholder="Editor-in-Chief" value={boardForm.position}
                        onChange={(e) => setBoardForm((p) => ({ ...p, position: e.target.value }))}
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-medium text-gray-600">Tashkilot</label>
                      <input type="text" value={boardForm.affiliation}
                        onChange={(e) => setBoardForm((p) => ({ ...p, affiliation: e.target.value }))}
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-medium text-gray-600">Email</label>
                      <input type="email" value={boardForm.email}
                        onChange={(e) => setBoardForm((p) => ({ ...p, email: e.target.value }))}
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-medium text-gray-600">ORCID</label>
                      <input type="text" placeholder="0000-0001-2345-6789" value={boardForm.orcid}
                        onChange={(e) => setBoardForm((p) => ({ ...p, orcid: e.target.value }))}
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-medium text-gray-600">Mamlakat</label>
                      <input type="text" placeholder="UZ" value={boardForm.country}
                        onChange={(e) => setBoardForm((p) => ({ ...p, country: e.target.value }))}
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-medium text-gray-600">Tartib raqami</label>
                      <input type="number" min="1" value={boardForm.orderIndex}
                        onChange={(e) => setBoardForm((p) => ({ ...p, orderIndex: parseInt(e.target.value) }))}
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
                    </div>
                  </div>
                  <div className="mt-3 flex justify-end gap-2">
                    <button type="button" onClick={() => setShowAddMember(false)}
                      className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-600 hover:bg-gray-100">
                      Bekor
                    </button>
                    <button type="submit" disabled={boardLoading}
                      className="rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700 disabled:opacity-50">
                      {boardLoading ? "Saqlanmoqda..." : "Qo'shish"}
                    </button>
                  </div>
                </form>
              )}
            </>
          )}
        </div>
      </Modal>
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  );
};

export default Journals;
