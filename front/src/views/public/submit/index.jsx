import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Plus, X, Upload, CheckCircle } from "lucide-react";
import ApiCall, { baseUrl } from "../../../config/index";
import Header from "../../../components/layout/Header";
import Footer from "../../../components/layout/Footer";

const emptyAuthor = { fullName: "", email: "", affiliation: "", orcid: "", country: "", corresponding: false, orderIndex: 0 };

export default function SubmitArticle() {
  const navigate = useNavigate();
  const [journals, setJournals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [pdfFile, setPdfFile] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [formData, setFormData] = useState({
    journalId: "",
    title: "",
    abstractText: "",
    keywords: "",
    reviewType: "DOUBLE_BLIND",
    language: "uz",
    fundingInfo: "",
    conflictOfInterest: "",
    license: "CC BY 4.0",
    authors: [{ ...emptyAuthor, corresponding: true, orderIndex: 1 }],
    references: "",
  });

  const isLoggedIn = !!localStorage.getItem("access_token");

  useEffect(() => {
    ApiCall("/api/v1/journals?page=0&size=100", "GET").then((res) => {
      if (!res.error) {
        const raw = res.data?.data || res.data;
        const list = raw?.content || raw;
        setJournals(Array.isArray(list) ? list : []);
      }
    });
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
  };

  const addAuthor = () => {
    setFormData((p) => ({
      ...p,
      authors: [...p.authors, { ...emptyAuthor, orderIndex: p.authors.length + 1 }],
    }));
  };

  const updateAuthor = (idx, field, value) => {
    setFormData((p) => {
      const updated = [...p.authors];
      updated[idx] = { ...updated[idx], [field]: value };
      return { ...p, authors: updated };
    });
  };

  const removeAuthor = (idx) => {
    setFormData((p) => ({
      ...p,
      authors: p.authors.filter((_, i) => i !== idx).map((a, i) => ({ ...a, orderIndex: i + 1 })),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isLoggedIn) {
      navigate("/login");
      return;
    }
    setErrorMsg("");
    setLoading(true);
    try {
      const keywords = formData.keywords
        .split(",")
        .map((k) => k.trim())
        .filter(Boolean);

      const references = formData.references
        ? formData.references
            .split("\n")
            .map((line, i) => ({ text: line.trim(), orderIndex: i + 1 }))
            .filter((r) => r.text)
        : [];

      const payload = {
        journalId: formData.journalId || null,
        title: formData.title,
        abstractText: formData.abstractText,
        keywords,
        reviewType: formData.reviewType,
        language: formData.language,
        fundingInfo: formData.fundingInfo || null,
        conflictOfInterest: formData.conflictOfInterest || null,
        license: formData.license || null,
        authors: formData.authors,
        references,
      };

      const res = await ApiCall("/api/v1/articles/submit", "POST", payload);

      if (res.error) {
        setErrorMsg("Xatolik: " + (res.data?.message || "Maqola yuborilmadi"));
        return;
      }

      const article = res.data?.data || res.data;

      if (pdfFile && article?.id) {
        const fd = new FormData();
        fd.append("file", pdfFile);
        const token = localStorage.getItem("access_token");
        await fetch(`${baseUrl}/api/v1/articles/${article.id}/pdf`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: fd,
        });
      }

      setSubmitted(true);
    } catch (err) {
      console.error(err);
      setErrorMsg("Server bilan bog'lanishda xatolik yuz berdi");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="flex min-h-screen flex-col bg-gray-50">
        <Header />
        <div className="flex flex-1 flex-col items-center justify-center px-4 py-16">
          <CheckCircle className="mb-4 h-16 w-16 text-green-500" />
          <h1 className="mb-2 text-2xl font-bold text-gray-800">Maqola yuborildi!</h1>
          <p className="mb-6 text-center text-gray-500">
            Maqolangiz ko'rib chiqish uchun qabul qilindi. Tahririyat siz bilan bog'lanadi.
          </p>
          <div className="flex gap-4">
            <Link to="/articles" className="rounded-lg bg-blue-600 px-6 py-2 font-medium text-white hover:bg-blue-700">
              Maqolalar
            </Link>
            <button
              onClick={() => { setSubmitted(false); setFormData({ journalId: "", title: "", abstractText: "", keywords: "", reviewType: "DOUBLE_BLIND", language: "uz", fundingInfo: "", conflictOfInterest: "", license: "CC BY 4.0", authors: [{ ...emptyAuthor, corresponding: true, orderIndex: 1 }], references: "" }); setPdfFile(null); }}
              className="rounded-lg border border-gray-300 px-6 py-2 font-medium text-gray-700 hover:bg-gray-50"
            >
              Yana yuborish
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <Helmet>
        <title>Maqola yuborish | BXU Journal</title>
        <meta name="description" content="Ilmiy maqolangizni BXU jurnallariga yuborish." />
      </Helmet>
      <Header />

      <div className="bg-gradient-to-br from-blue-700 to-indigo-800 px-4 py-10 text-white">
        <div className="container mx-auto max-w-3xl text-center">
          <h1 className="mb-2 text-3xl font-bold">Maqola yuborish</h1>
          <p className="text-blue-100">Ilmiy tadqiqotingizni BXU jurnallariga taqdim eting</p>
        </div>
      </div>

      <main className="container mx-auto max-w-3xl flex-1 px-4 py-10">
        {!isLoggedIn && (
          <div className="mb-6 rounded-xl border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-800">
            Maqola yuborish uchun{" "}
            <a href="/login" className="font-semibold underline">tizimga kiring</a>.
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic */}
          <section className="rounded-xl bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-base font-semibold text-gray-800">Asosiy ma'lumotlar</h2>
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Jurnal <span className="text-red-500">*</span>
                </label>
                <select
                  name="journalId"
                  value={formData.journalId}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Jurnalni tanlang</option>
                  {journals.map((j) => (
                    <option key={j.id} value={j.id}>{j.title}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Sarlavha <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Annotatsiya <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="abstractText"
                  value={formData.abstractText}
                  onChange={handleChange}
                  required
                  rows={5}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Kalit so'zlar (vergul bilan ajrating)
                </label>
                <input
                  type="text"
                  name="keywords"
                  value={formData.keywords}
                  onChange={handleChange}
                  placeholder="fizika, kvant, energiya"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Til</label>
                  <select name="language" value={formData.language} onChange={handleChange}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="uz">O'zbek</option>
                    <option value="en">English</option>
                    <option value="ru">Русский</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Ko'rib chiqish turi</label>
                  <select name="reviewType" value={formData.reviewType} onChange={handleChange}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="DOUBLE_BLIND">Ikki tomonlama yashirin</option>
                    <option value="SINGLE_BLIND">Bir tomonlama yashirin</option>
                    <option value="OPEN">Ochiq</option>
                  </select>
                </div>
              </div>
            </div>
          </section>

          {/* Authors */}
          <section className="rounded-xl bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-base font-semibold text-gray-800">Mualliflar</h2>
              <button type="button" onClick={addAuthor}
                className="flex items-center gap-1 rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-600 hover:bg-blue-100">
                <Plus size={14} /> Muallif qo'shish
              </button>
            </div>
            <div className="space-y-4">
              {formData.authors.map((author, idx) => (
                <div key={idx} className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-xs font-semibold text-gray-500">Muallif {idx + 1}</span>
                    {formData.authors.length > 1 && (
                      <button type="button" onClick={() => removeAuthor(idx)} className="text-red-400 hover:text-red-600">
                        <X size={14} />
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                      <input type="text" placeholder="To'liq ism *" required
                        value={author.fullName}
                        onChange={(e) => updateAuthor(idx, "fullName", e.target.value)}
                        className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500" />
                    </div>
                    <input type="email" placeholder="Email"
                      value={author.email}
                      onChange={(e) => updateAuthor(idx, "email", e.target.value)}
                      className="rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500" />
                    <input type="text" placeholder="Tashkilot"
                      value={author.affiliation}
                      onChange={(e) => updateAuthor(idx, "affiliation", e.target.value)}
                      className="rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500" />
                    <input type="text" placeholder="ORCID"
                      value={author.orcid}
                      onChange={(e) => updateAuthor(idx, "orcid", e.target.value)}
                      className="rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500" />
                    <input type="text" placeholder="Mamlakat (UZ, RU...)"
                      value={author.country}
                      onChange={(e) => updateAuthor(idx, "country", e.target.value)}
                      className="rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500" />
                    <label className="flex items-center gap-2 text-sm text-gray-700 sm:col-span-2">
                      <input type="checkbox" checked={author.corresponding}
                        onChange={(e) => updateAuthor(idx, "corresponding", e.target.checked)}
                        className="h-4 w-4 rounded border-gray-300 text-blue-600" />
                      Mos muallif (corresponding author)
                    </label>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* PDF */}
          <section className="rounded-xl bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-base font-semibold text-gray-800">PDF fayl</h2>
            <label className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 p-8 text-gray-400 transition hover:border-blue-400 hover:text-blue-500">
              <Upload size={32} className="mb-2" />
              <span className="text-sm font-medium">
                {pdfFile ? pdfFile.name : "PDF faylni tanlang yoki bu yerga tashlang"}
              </span>
              <input type="file" accept=".pdf" className="hidden"
                onChange={(e) => setPdfFile(e.target.files[0] || null)} />
            </label>
          </section>

          {/* References */}
          <section className="rounded-xl bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-base font-semibold text-gray-800">Adabiyotlar ro'yxati (ixtiyoriy)</h2>
            <p className="mb-2 text-xs text-gray-400">Har bir adabiyotni yangi qatordan kiriting</p>
            <textarea
              name="references"
              value={formData.references}
              onChange={handleChange}
              rows={6}
              placeholder={"Dirac, P.A.M. (1930). The Principles of Quantum Mechanics.\nEinstein, A. (1905). On the Electrodynamics of Moving Bodies."}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </section>

          {/* Additional */}
          <section className="rounded-xl bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-base font-semibold text-gray-800">Qo'shimcha ma'lumotlar</h2>
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Moliyalashtirish</label>
                <input type="text" name="fundingInfo" value={formData.fundingInfo} onChange={handleChange}
                  placeholder="Grант nomi yoki moliyalashtiruvchi tashkilot"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Manfaatlar ziddiyati</label>
                <input type="text" name="conflictOfInterest" value={formData.conflictOfInterest} onChange={handleChange}
                  placeholder="Manfaatlar ziddiyati yo'q"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Litsenziya</label>
                <input type="text" name="license" value={formData.license} onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>
          </section>

          {errorMsg && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {errorMsg}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !isLoggedIn}
            className="w-full rounded-xl bg-blue-600 py-3 font-semibold text-white shadow transition hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Yuborilmoqda..." : "Maqolani yuborish"}
          </button>
        </form>
      </main>

      <Footer />
    </div>
  );
}
