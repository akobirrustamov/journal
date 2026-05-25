import { useEffect, useState, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import {
  Download, Eye, ChevronRight, Users, BookOpen,
  Quote, ExternalLink, FileText, Calendar, Hash
} from "lucide-react";
import ApiCall, { baseUrl } from "../../../config/index";
import Header from "../../../components/layout/Header";
import Footer from "../../../components/layout/Footer";

const CITATION_FORMATS = [
  { id: "apa", label: "APA" },
  { id: "mla", label: "MLA" },
  { id: "bibtex", label: "BibTeX" },
  { id: "ris", label: "RIS" },
];

export default function ArticleDetail() {
  const { slug } = useParams();
  const [article, setArticle] = useState(null);
  const [meta, setMeta] = useState(null);
  const [htmlContent, setHtmlContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [citationOpen, setCitationOpen] = useState(false);
  const [citationText, setCitationText] = useState("");
  const [citationFormat, setCitationFormat] = useState("apa");
  const [citationLoading, setCitationLoading] = useState(false);
  const citationRef = useRef(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await ApiCall(`/api/v1/articles/${slug}`, "GET");
        const art = res.data?.data || res.data;
        setArticle(art);
        if (art?.id) {
          // Load SEO metadata from dedicated endpoint
          const metaRes = await ApiCall(`/api/v1/metadata/articles/${art.id}`, "GET");
          setMeta(metaRes.data?.data || metaRes.data || null);
          if (art.hasHtml) {
            const htmlRes = await ApiCall(`/api/v1/articles/${art.id}/html`, "GET");
            setHtmlContent(htmlRes.data);
          }
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [slug]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (citationRef.current && !citationRef.current.contains(e.target)) {
        setCitationOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const loadCitation = async (format) => {
    if (!article) return;
    setCitationFormat(format);
    setCitationLoading(true);
    try {
      const res = await ApiCall(`/api/v1/citations/${article.id}/${format}`, "GET");
      setCitationText(res.data || "");
    } catch {
      setCitationText("Yuklab bo'lmadi");
    } finally {
      setCitationLoading(false);
    }
  };

  const downloadCitation = () => {
    const ext = citationFormat === "bibtex" ? "bib" : citationFormat === "ris" ? "ris" : "txt";
    const blob = new Blob([citationText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `citation.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <div className="flex flex-1 items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600" />
        </div>
        <Footer />
      </div>
    );
  }

  if (!article) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <div className="flex flex-1 flex-col items-center justify-center text-gray-500">
          <FileText className="mb-4 h-16 w-16 text-gray-200" />
          <p className="text-xl">Maqola topilmadi</p>
          <Link to="/articles" className="mt-4 text-blue-600 underline">Barcha maqolalar</Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <Helmet>
        <title>{meta?.title || `${article.title} | BXU Journal`}</title>
        {(meta?.description || article.abstractText) && (
          <meta name="description" content={meta?.description || article.abstractText} />
        )}
        {meta?.keywords && <meta name="keywords" content={meta.keywords} />}
        <meta property="og:type" content="article" />
        <meta property="og:title" content={meta?.ogTitle || article.title} />
        {(meta?.ogDescription || article.abstractText) && (
          <meta property="og:description" content={meta?.ogDescription || article.abstractText} />
        )}
        {meta?.ogUrl && <meta property="og:url" content={meta.ogUrl} />}
        {meta?.ogImage && <meta property="og:image" content={meta.ogImage} />}
        <meta name="twitter:card" content={meta?.twitterCard || "summary"} />
        <meta name="twitter:title" content={meta?.twitterTitle || article.title} />
        {(meta?.twitterDescription || article.abstractText) && (
          <meta name="twitter:description" content={meta?.twitterDescription || article.abstractText} />
        )}
        {meta?.twitterImage && <meta name="twitter:image" content={meta.twitterImage} />}
        {article.doi && <meta name="citation_doi" content={article.doi} />}
        {article.title && <meta name="citation_title" content={article.title} />}
        {article.journalTitle && <meta name="citation_journal_title" content={article.journalTitle} />}
        {article.issnPrint && <meta name="citation_issn" content={article.issnPrint} />}
        {article.publishedAt && (
          <meta name="citation_publication_date" content={new Date(article.publishedAt).toISOString().split("T")[0]} />
        )}
        {meta?.jsonLd && (
          <script type="application/ld+json">{JSON.stringify(meta.jsonLd)}</script>
        )}
      </Helmet>
      <Header />

      {/* Breadcrumb */}
      <div className="border-b bg-white px-4 py-2">
        <div className="container mx-auto max-w-5xl flex items-center gap-2 text-sm text-gray-500">
          <Link to="/articles" className="hover:text-blue-600">Maqolalar</Link>
          <ChevronRight size={14} />
          {article.journalTitle && (
            <>
              <Link to={`/journals/${article.journalSlug || article.journalId}`} className="hover:text-blue-600">
                {article.journalTitle}
              </Link>
              <ChevronRight size={14} />
            </>
          )}
          <span className="max-w-xs truncate text-gray-800">{article.title}</span>
        </div>
      </div>

      <main className="container mx-auto max-w-5xl flex-1 px-4 py-8">
        <div className="flex flex-col gap-6 lg:flex-row">
          {/* Main content */}
          <div className="flex-1 min-w-0 space-y-6">
            {/* Title & meta */}
            <div className="rounded-xl bg-white p-6 shadow-sm">
              {article.journalTitle && (
                <p className="mb-2 text-sm font-medium text-blue-600">
                  <Link to={`/journals/${article.journalSlug || article.journalId}`} className="hover:underline">
                    {article.journalTitle}
                  </Link>
                  {article.volumeNumber && (
                    <span className="ml-2 text-gray-400 font-normal">
                      Tom {article.volumeNumber}, Son {article.issueNumber}
                    </span>
                  )}
                </p>
              )}
              <h1 className="mb-4 text-xl font-bold text-gray-800 md:text-2xl">{article.title}</h1>

              {/* Authors */}
              {article.authors && article.authors.length > 0 && (
                <div className="mb-4 flex flex-wrap gap-3">
                  {article.authors.map((author, i) => (
                    <div key={i} className="text-sm">
                      <span className={`font-medium ${author.corresponding ? "text-blue-700" : "text-gray-700"}`}>
                        {author.fullName}
                      </span>
                      {author.affiliation && (
                        <span className="text-gray-400"> · {author.affiliation}</span>
                      )}
                      {author.corresponding && (
                        <span className="ml-1 text-xs text-blue-500">(mos muallif)</span>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Meta row */}
              <div className="flex flex-wrap gap-4 text-xs text-gray-400">
                {article.publishedAt && (
                  <span className="flex items-center gap-1">
                    <Calendar size={12} />
                    {new Date(article.publishedAt).toLocaleDateString("uz-UZ")}
                  </span>
                )}
                {article.doi && (
                  <a
                    href={`https://doi.org/${article.doi}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-blue-500 hover:underline"
                  >
                    <ExternalLink size={12} /> DOI: {article.doi}
                  </a>
                )}
                {article.pageStart && article.pageEnd && (
                  <span>Sahifalar: {article.pageStart}–{article.pageEnd}</span>
                )}
                {article.language && <span>Til: {article.language.toUpperCase()}</span>}
                {article.license && <span>{article.license}</span>}
                {article.viewCount != null && (
                  <span className="flex items-center gap-1"><Eye size={12} /> {article.viewCount} ko'rishlar</span>
                )}
                {article.downloadCount != null && (
                  <span className="flex items-center gap-1"><Download size={12} /> {article.downloadCount} yuklamalar</span>
                )}
              </div>
            </div>

            {/* Abstract */}
            {article.abstractText && (
              <div className="rounded-xl bg-white p-6 shadow-sm">
                <h2 className="mb-3 text-base font-semibold text-gray-800">Annotatsiya</h2>
                <p className="text-sm leading-relaxed text-gray-600">{article.abstractText}</p>
              </div>
            )}

            {/* Keywords */}
            {article.keywords && article.keywords.length > 0 && (
              <div className="rounded-xl bg-white p-5 shadow-sm">
                <h2 className="mb-3 flex items-center gap-2 text-base font-semibold text-gray-800">
                  <Hash size={16} /> Kalit so'zlar
                </h2>
                <div className="flex flex-wrap gap-2">
                  {article.keywords.map((kw, i) => (
                    <Link
                      key={i}
                      to={`/articles?q=${encodeURIComponent(kw)}`}
                      className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700 hover:bg-blue-100"
                    >
                      {kw}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* HTML content */}
            {htmlContent && (
              <div className="rounded-xl bg-white p-6 shadow-sm">
                <h2 className="mb-4 text-base font-semibold text-gray-800">Maqola matni</h2>
                <div
                  className="prose prose-sm max-w-none text-gray-700"
                  dangerouslySetInnerHTML={{ __html: htmlContent }}
                />
              </div>
            )}

            {/* References */}
            {article.references && article.references.length > 0 && (
              <div className="rounded-xl bg-white p-6 shadow-sm">
                <h2 className="mb-4 text-base font-semibold text-gray-800">Adabiyotlar ro'yxati</h2>
                <ol className="space-y-2">
                  {article.references.map((ref, i) => (
                    <li key={ref.id || i} className="flex gap-3 text-sm text-gray-600">
                      <span className="flex-shrink-0 text-gray-400">[{ref.orderIndex || i + 1}]</span>
                      <span>
                        {ref.text}
                        {ref.doi && (
                          <a
                            href={`https://doi.org/${ref.doi}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="ml-2 text-blue-500 hover:underline"
                          >
                            DOI
                          </a>
                        )}
                        {ref.url && !ref.doi && (
                          <a href={ref.url} target="_blank" rel="noopener noreferrer" className="ml-2 text-blue-500 hover:underline">
                            URL
                          </a>
                        )}
                      </span>
                    </li>
                  ))}
                </ol>
              </div>
            )}

            {/* Funding & conflict */}
            {(article.fundingInfo || article.conflictOfInterest) && (
              <div className="rounded-xl bg-white p-6 shadow-sm space-y-4">
                {article.fundingInfo && (
                  <div>
                    <h3 className="mb-1 text-sm font-semibold text-gray-700">Moliyalashtirish</h3>
                    <p className="text-sm text-gray-500">{article.fundingInfo}</p>
                  </div>
                )}
                {article.conflictOfInterest && (
                  <div>
                    <h3 className="mb-1 text-sm font-semibold text-gray-700">Manfaatlar ziddiyati</h3>
                    <p className="text-sm text-gray-500">{article.conflictOfInterest}</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <aside className="flex flex-col gap-4 lg:w-64">
            {/* PDF Download */}
            {article.pdfUrl && (
              <a
                href={`${baseUrl}/api/v1/articles/${article.id}/download`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 font-semibold text-white shadow transition hover:bg-blue-700"
              >
                <Download size={18} /> PDF yuklab olish
              </a>
            )}

            {/* Cite button */}
            <div className="relative" ref={citationRef}>
              <button
                onClick={() => {
                  if (!citationOpen) {
                    loadCitation("apa");
                  }
                  setCitationOpen(!citationOpen);
                }}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3 font-medium text-gray-700 shadow-sm transition hover:bg-gray-50"
              >
                <Quote size={16} /> Iqtibos keltirish
              </button>

              {citationOpen && (
                <div className="absolute left-0 right-0 top-full z-20 mt-1 rounded-xl border border-gray-200 bg-white p-4 shadow-lg">
                  <div className="mb-3 flex gap-1">
                    {CITATION_FORMATS.map((fmt) => (
                      <button
                        key={fmt.id}
                        onClick={() => loadCitation(fmt.id)}
                        className={`flex-1 rounded px-2 py-1 text-xs font-medium transition ${
                          citationFormat === fmt.id
                            ? "bg-blue-600 text-white"
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        }`}
                      >
                        {fmt.label}
                      </button>
                    ))}
                  </div>
                  {citationLoading ? (
                    <div className="py-4 text-center text-xs text-gray-400">Yuklanmoqda...</div>
                  ) : (
                    <>
                      <pre className="max-h-32 overflow-auto rounded bg-gray-50 p-3 text-xs text-gray-700 whitespace-pre-wrap">
                        {citationText}
                      </pre>
                      <div className="mt-2 flex gap-2">
                        <button
                          onClick={() => navigator.clipboard.writeText(citationText)}
                          className="flex-1 rounded bg-gray-100 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-200"
                        >
                          Nusxalash
                        </button>
                        <button
                          onClick={downloadCitation}
                          className="flex-1 rounded bg-blue-50 py-1.5 text-xs font-medium text-blue-600 hover:bg-blue-100"
                        >
                          Yuklash
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Article info */}
            <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
              <h3 className="mb-3 text-sm font-semibold text-gray-700">Ma'lumot</h3>
              <dl className="space-y-2 text-xs">
                {article.receivedDate && (
                  <div className="flex justify-between">
                    <dt className="text-gray-400">Qabul qilingan:</dt>
                    <dd className="text-gray-700">{new Date(article.receivedDate).toLocaleDateString("uz-UZ")}</dd>
                  </div>
                )}
                {article.acceptedDate && (
                  <div className="flex justify-between">
                    <dt className="text-gray-400">Tasdiqlangan:</dt>
                    <dd className="text-gray-700">{new Date(article.acceptedDate).toLocaleDateString("uz-UZ")}</dd>
                  </div>
                )}
                {article.publishedAt && (
                  <div className="flex justify-between">
                    <dt className="text-gray-400">Nashr etilgan:</dt>
                    <dd className="text-gray-700">{new Date(article.publishedAt).toLocaleDateString("uz-UZ")}</dd>
                  </div>
                )}
                {article.reviewType && (
                  <div className="flex justify-between">
                    <dt className="text-gray-400">Ko'rib chiqish:</dt>
                    <dd className="text-gray-700">
                      {article.reviewType === "DOUBLE_BLIND" ? "Ikki tomonlama yashirin" : article.reviewType}
                    </dd>
                  </div>
                )}
              </dl>
            </div>

            {/* Issue link */}
            {article.issueId && (
              <Link
                to={`/issues/${article.issueId}`}
                className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white p-4 shadow-sm text-sm text-gray-700 hover:bg-gray-50"
              >
                <BookOpen size={16} className="text-blue-600" />
                <span>Tom {article.volumeNumber}, Son {article.issueNumber}</span>
                <ChevronRight size={14} className="ml-auto text-gray-400" />
              </Link>
            )}
          </aside>
        </div>
      </main>

      <Footer />
    </div>
  );
}
