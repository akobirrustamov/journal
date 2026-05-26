import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import {
  Download, Eye, ChevronRight, BookOpen,
  Quote, ExternalLink, FileText, Calendar, Hash,
  Copy, Check, X, Share2,
} from "lucide-react";
import ApiCall, { baseUrl } from "../../../config/index";
import Header from "../../../components/layout/Header";
import Footer from "../../../components/layout/Footer";

/* All supported citation formats grouped by domain */
const CITATION_GROUPS = [
  {
    label: "Umumiy",
    formats: [
      { id: "apa", label: "APA", desc: "American Psychological Association" },
      { id: "mla", label: "MLA", desc: "Modern Language Association" },
      { id: "chicago", label: "Chicago", desc: "Chicago Author–Date" },
      { id: "harvard", label: "Harvard", desc: "Harvard referencing" },
      { id: "turabian", label: "Turabian", desc: "Turabian style" },
    ],
  },
  {
    label: "Texnika va kompyuter",
    formats: [
      { id: "ieee", label: "IEEE", desc: "Electrical & Electronics Engineers" },
      { id: "acm", label: "ACM", desc: "Association for Computing Machinery" },
    ],
  },
  {
    label: "Tabiiy va tibbiyot",
    formats: [
      { id: "acs", label: "ACS", desc: "American Chemical Society" },
      { id: "ama", label: "AMA", desc: "American Medical Association" },
      { id: "vancouver", label: "Vancouver", desc: "Biomedical style" },
      { id: "nlm", label: "NLM", desc: "National Library of Medicine" },
    ],
  },
  {
    label: "Xalqaro",
    formats: [
      { id: "abnt", label: "ABNT", desc: "Brazilian standard NBR 6023" },
    ],
  },
  {
    label: "Bibliografik",
    formats: [
      { id: "bibtex", label: "BibTeX", desc: "LaTeX bibliografik fayli" },
      { id: "ris", label: "RIS", desc: "Zotero / Mendeley / EndNote" },
    ],
  },
];

const ALL_FORMATS = CITATION_GROUPS.flatMap((g) => g.formats);

export default function ArticleDetail() {
  const { slug } = useParams();
  const [article, setArticle] = useState(null);
  const [meta, setMeta] = useState(null);
  const [htmlContent, setHtmlContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [citePanelOpen, setCitePanelOpen] = useState(false);
  const [citationText, setCitationText] = useState("");
  const [citationFormat, setCitationFormat] = useState("apa");
  const [citationLoading, setCitationLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await ApiCall(`/api/v1/articles/${slug}`, "GET");
        const art = res.data?.data || res.data;
        setArticle(art);
        if (art?.id) {
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
    const onKey = (e) => { if (e.key === "Escape") setCitePanelOpen(false); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  const loadCitation = async (format) => {
    if (!article) return;
    setCitationFormat(format);
    setCitationLoading(true);
    setCopied(false);
    try {
      const res = await ApiCall(`/api/v1/citations/${article.id}/${format}`, "GET");
      setCitationText(res.data || "");
    } catch {
      setCitationText("Yuklab bo'lmadi");
    } finally {
      setCitationLoading(false);
    }
  };

  const openCitePanel = () => {
    if (!citationText) loadCitation(citationFormat);
    setCitePanelOpen(true);
  };

  const copyCitation = async () => {
    try {
      await navigator.clipboard.writeText(stripHtml(citationText));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {/* ignore */}
  };

  const downloadCitation = () => {
    const ext = citationFormat === "bibtex" ? "bib" : citationFormat === "ris" ? "ris" : "txt";
    const blob = new Blob([stripHtml(citationText)], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `citation-${article.slug || article.id}.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const shareArticle = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try { await navigator.share({ title: article.title, url }); } catch {/* cancelled */}
    } else {
      try {
        await navigator.clipboard.writeText(url);
        alert("Havola nusxalandi");
      } catch {/* ignore */}
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col bg-white">
        <Header />
        <div className="flex flex-1 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-slate-900" />
        </div>
        <Footer />
      </div>
    );
  }

  if (!article) {
    return (
      <div className="flex min-h-screen flex-col bg-white">
        <Header />
        <div className="flex flex-1 flex-col items-center justify-center text-slate-500">
          <FileText className="mb-3 h-12 w-12 text-slate-200" />
          <p className="text-lg">Maqola topilmadi</p>
          <Link to="/articles" className="mt-3 text-sm text-slate-700 underline underline-offset-4">
            Barcha maqolalar
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const canonicalUrl = meta?.canonicalUrl
    || `${window.location.origin}/articles/${article.slug || article.id}`;
  const pdfFullUrl = article.pdfUrl
    ? (article.pdfUrl.startsWith("http") ? article.pdfUrl : `${baseUrl}/api/v1/articles/${article.id}/download`)
    : null;
  const pubDate = article.publishedAt
    ? new Date(article.publishedAt).toISOString().split("T")[0]
    : null;

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Helmet>
        {/* ── Standard ─────────────────────────────────────────────── */}
        <title>{meta?.metaTitle || meta?.title || `${article.title} | BXU Journal`}</title>
        {(meta?.metaDescription || meta?.description || article.abstractText) && (
          <meta name="description" content={meta?.metaDescription || meta?.description || truncate(article.abstractText, 160)} />
        )}
        {(meta?.metaKeywords || meta?.keywords || article.keywords?.length > 0) && (
          <meta name="keywords" content={meta?.metaKeywords || meta?.keywords || article.keywords.join(", ")} />
        )}
        <meta name="robots" content={meta?.robots || "index, follow"} />
        <link rel="canonical" href={canonicalUrl} />

        {/* ── Open Graph ───────────────────────────────────────────── */}
        <meta property="og:type" content="article" />
        <meta property="og:title" content={meta?.ogTitle || article.title} />
        {(meta?.ogDescription || article.abstractText) && (
          <meta property="og:description" content={meta?.ogDescription || truncate(article.abstractText, 200)} />
        )}
        <meta property="og:url" content={meta?.ogUrl || canonicalUrl} />
        {meta?.ogImage && <meta property="og:image" content={meta.ogImage} />}
        <meta property="og:site_name" content="BXU Journal" />
        {pubDate && <meta property="article:published_time" content={pubDate} />}
        {article.authors?.map((a, i) => (
          <meta key={`og-auth-${i}`} property="article:author" content={a.fullName} />
        ))}

        {/* ── Twitter Card ─────────────────────────────────────────── */}
        <meta name="twitter:card" content={meta?.twitterCard || "summary_large_image"} />
        <meta name="twitter:title" content={meta?.twitterTitle || article.title} />
        {(meta?.twitterDescription || article.abstractText) && (
          <meta name="twitter:description" content={meta?.twitterDescription || truncate(article.abstractText, 200)} />
        )}
        {meta?.twitterImage && <meta name="twitter:image" content={meta.twitterImage} />}

        {/* ── Google Scholar / Highwire Press ──────────────────────── */}
        <meta name="citation_title" content={article.title} />
        {article.authors?.map((a, i) => (
          <meta key={`cit-auth-${i}`} name="citation_author" content={a.fullName} />
        ))}
        {article.authors?.map((a, i) =>
          a.affiliation ? (
            <meta key={`cit-aff-${i}`} name="citation_author_institution" content={a.affiliation} />
          ) : null
        )}
        {article.journalTitle && (
          <meta name="citation_journal_title" content={article.journalTitle} />
        )}
        {pubDate && <meta name="citation_publication_date" content={pubDate} />}
        {pubDate && <meta name="citation_online_date" content={pubDate} />}
        {article.volumeNumber && (
          <meta name="citation_volume" content={String(article.volumeNumber)} />
        )}
        {article.issueNumber && (
          <meta name="citation_issue" content={String(article.issueNumber)} />
        )}
        {article.pageStart && (
          <meta name="citation_firstpage" content={String(article.pageStart)} />
        )}
        {article.pageEnd && (
          <meta name="citation_lastpage" content={String(article.pageEnd)} />
        )}
        {article.doi && <meta name="citation_doi" content={article.doi} />}
        {meta?.citationIssnPrint && <meta name="citation_issn" content={meta.citationIssnPrint} />}
        {meta?.citationIssnOnline && <meta name="citation_issn" content={meta.citationIssnOnline} />}
        {pdfFullUrl && <meta name="citation_pdf_url" content={pdfFullUrl} />}
        <meta name="citation_abstract_html_url" content={canonicalUrl} />
        <meta name="citation_fulltext_html_url" content={canonicalUrl} />
        {article.language && <meta name="citation_language" content={article.language} />}
        {article.abstractText && <meta name="citation_abstract" content={article.abstractText} />}
        {article.keywords?.map((k, i) => (
          <meta key={`cit-kw-${i}`} name="citation_keywords" content={k} />
        ))}

        {/* ── Dublin Core ──────────────────────────────────────────── */}
        <meta name="DC.title" content={article.title} />
        {article.authors?.map((a, i) => (
          <meta key={`dc-c-${i}`} name="DC.creator" content={a.fullName} />
        ))}
        {article.abstractText && <meta name="DC.description" content={truncate(article.abstractText, 300)} />}
        {article.keywords?.map((k, i) => (
          <meta key={`dc-s-${i}`} name="DC.subject" content={k} />
        ))}
        {article.journalTitle && <meta name="DC.publisher" content={article.journalTitle} />}
        {pubDate && <meta name="DC.date" content={pubDate} />}
        <meta name="DC.type" content="Text" />
        <meta name="DC.format" content="application/pdf" />
        <meta name="DC.identifier" content={article.doi ? `https://doi.org/${article.doi}` : canonicalUrl} />
        {article.language && <meta name="DC.language" content={article.language} />}
        {article.license && <meta name="DC.rights" content={article.license} />}

        {/* ── PRISM ────────────────────────────────────────────────── */}
        {pubDate && <meta name="prism.publicationDate" content={pubDate} />}
        {article.journalTitle && <meta name="prism.publicationName" content={article.journalTitle} />}
        {article.volumeNumber && <meta name="prism.volume" content={String(article.volumeNumber)} />}
        {article.issueNumber && <meta name="prism.number" content={String(article.issueNumber)} />}
        {article.pageStart && <meta name="prism.startingPage" content={String(article.pageStart)} />}
        {article.pageEnd && <meta name="prism.endingPage" content={String(article.pageEnd)} />}
        {article.doi && <meta name="prism.doi" content={article.doi} />}

        {/* ── Schema.org JSON-LD ───────────────────────────────────── */}
        {meta?.schemaOrgJsonLd && (
          <script type="application/ld+json">{meta.schemaOrgJsonLd}</script>
        )}
        {!meta?.schemaOrgJsonLd && (
          <script type="application/ld+json">
            {JSON.stringify(buildFallbackJsonLd(article, canonicalUrl, pdfFullUrl))}
          </script>
        )}
      </Helmet>

      <Header />

      {/* ── Breadcrumb ──────────────────────────────────────────────── */}
      <div className="border-b border-slate-100 bg-white px-4 py-3">
        <div className="container mx-auto max-w-5xl flex items-center gap-1.5 text-xs text-slate-500">
          <Link to="/articles" className="hover:text-slate-900 transition">Maqolalar</Link>
          <ChevronRight size={12} className="text-slate-300" />
          {article.journalTitle && (
            <>
              <Link to={`/journals/${article.journalSlug || article.journalId}`} className="hover:text-slate-900 transition">
                {article.journalTitle}
              </Link>
              <ChevronRight size={12} className="text-slate-300" />
            </>
          )}
          <span className="max-w-xs truncate text-slate-900">{article.title}</span>
        </div>
      </div>

      <main className="container mx-auto max-w-5xl flex-1 px-4 py-10 lg:py-14">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_280px]">
          {/* ── Main column ─────────────────────────────────────────── */}
          <article>
            {article.journalTitle && (
              <Link
                to={`/journals/${article.journalSlug || article.journalId}`}
                className="text-xs font-medium uppercase tracking-wider text-slate-500 hover:text-slate-900 transition"
              >
                {article.journalTitle}
                {article.volumeNumber && (
                  <span className="ml-2 text-slate-400 normal-case tracking-normal">
                    · Tom {article.volumeNumber}, Son {article.issueNumber}
                  </span>
                )}
              </Link>
            )}

            <h1 className="mt-3 text-2xl font-semibold leading-tight text-slate-900 md:text-3xl lg:text-4xl">
              {article.title}
            </h1>

            {/* Authors */}
            {article.authors && article.authors.length > 0 && (
              <div className="mt-6 flex flex-wrap gap-x-5 gap-y-1.5">
                {article.authors.map((author, i) => (
                  <div key={i} className="text-sm">
                    <span className={`${author.corresponding ? "font-semibold text-slate-900" : "text-slate-700"}`}>
                      {author.fullName}
                    </span>
                    {author.affiliation && (
                      <span className="text-slate-400"> · {author.affiliation}</span>
                    )}
                    {author.corresponding && (
                      <span className="ml-1 text-xs text-slate-400">✦</span>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Meta row */}
            <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-slate-500">
              {article.publishedAt && (
                <span className="inline-flex items-center gap-1.5">
                  <Calendar size={12} />
                  {new Date(article.publishedAt).toLocaleDateString("uz-UZ")}
                </span>
              )}
              {article.doi && (
                <a
                  href={`https://doi.org/${article.doi}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-slate-700 hover:text-slate-900 transition"
                >
                  <ExternalLink size={12} /> {article.doi}
                </a>
              )}
              {article.pageStart && article.pageEnd && (
                <span>p. {article.pageStart}–{article.pageEnd}</span>
              )}
              {article.language && <span className="uppercase">{article.language}</span>}
              {article.license && <span>{article.license}</span>}
              {article.viewCount != null && (
                <span className="inline-flex items-center gap-1.5">
                  <Eye size={12} /> {article.viewCount}
                </span>
              )}
              {article.downloadCount != null && (
                <span className="inline-flex items-center gap-1.5">
                  <Download size={12} /> {article.downloadCount}
                </span>
              )}
            </div>

            {/* Action bar */}
            <div className="mt-8 flex flex-wrap items-center gap-3 border-y border-slate-100 py-4">
              {article.pdfUrl && (
                <a
                  href={`${baseUrl}/api/v1/articles/${article.id}/download`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700"
                >
                  <Download size={14} /> PDF
                </a>
              )}
              <button
                onClick={openCitePanel}
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
              >
                <Quote size={14} /> Iqtibos keltirish
              </button>
              <button
                onClick={shareArticle}
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
              >
                <Share2 size={14} /> Ulashish
              </button>
            </div>

            {/* Abstract */}
            {article.abstractText && (
              <section className="mt-10">
                <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-500">
                  Annotatsiya
                </h2>
                <p className="text-[15px] leading-relaxed text-slate-700">
                  {article.abstractText}
                </p>
              </section>
            )}

            {/* Keywords */}
            {article.keywords && article.keywords.length > 0 && (
              <section className="mt-10">
                <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-slate-500">
                  Kalit so'zlar
                </h2>
                <div className="flex flex-wrap gap-2">
                  {article.keywords.map((kw, i) => (
                    <Link
                      key={i}
                      to={`/articles?q=${encodeURIComponent(kw)}`}
                      className="rounded-full border border-slate-200 px-3 py-1 text-xs text-slate-600 transition hover:border-slate-900 hover:text-slate-900"
                    >
                      {kw}
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* HTML content */}
            {htmlContent && (
              <section className="mt-10">
                <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-500">
                  Maqola matni
                </h2>
                <div
                  className="prose prose-slate prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: htmlContent }}
                />
              </section>
            )}

            {/* References */}
            {article.references && article.references.length > 0 && (
              <section className="mt-10">
                <h2 className="mb-4 flex items-baseline gap-3 text-sm font-semibold uppercase tracking-wider text-slate-500">
                  Adabiyotlar
                  <span className="text-xs font-normal normal-case text-slate-400">
                    {article.references.length} ta
                  </span>
                </h2>
                <ol className="space-y-3">
                  {article.references.map((ref, i) => (
                    <li key={ref.id || i} className="flex gap-3 text-sm leading-relaxed text-slate-700">
                      <span className="flex-shrink-0 w-7 text-right font-mono text-xs text-slate-400">
                        {ref.orderIndex || i + 1}.
                      </span>
                      <span className="flex-1">
                        {ref.text}
                        {ref.doi && (
                          <a
                            href={`https://doi.org/${ref.doi}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="ml-2 text-xs text-slate-500 underline underline-offset-2 hover:text-slate-900"
                          >
                            doi
                          </a>
                        )}
                        {ref.url && !ref.doi && (
                          <a
                            href={ref.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="ml-2 text-xs text-slate-500 underline underline-offset-2 hover:text-slate-900"
                          >
                            url
                          </a>
                        )}
                      </span>
                    </li>
                  ))}
                </ol>
              </section>
            )}

            {/* Funding & conflict */}
            {(article.fundingInfo || article.conflictOfInterest) && (
              <section className="mt-10 space-y-5 border-t border-slate-100 pt-8">
                {article.fundingInfo && (
                  <div>
                    <h3 className="mb-1 text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Moliyalashtirish
                    </h3>
                    <p className="text-sm text-slate-700">{article.fundingInfo}</p>
                  </div>
                )}
                {article.conflictOfInterest && (
                  <div>
                    <h3 className="mb-1 text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Manfaatlar ziddiyati
                    </h3>
                    <p className="text-sm text-slate-700">{article.conflictOfInterest}</p>
                  </div>
                )}
              </section>
            )}
          </article>

          {/* ── Sidebar ─────────────────────────────────────────────── */}
          <aside className="space-y-6 lg:sticky lg:top-6 lg:self-start">
            {/* Article info */}
            <div>
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                Ma'lumot
              </h3>
              <dl className="space-y-2.5 text-xs">
                {article.receivedDate && (
                  <div className="flex justify-between gap-2">
                    <dt className="text-slate-500">Qabul qilingan</dt>
                    <dd className="text-slate-900">{new Date(article.receivedDate).toLocaleDateString("uz-UZ")}</dd>
                  </div>
                )}
                {article.acceptedDate && (
                  <div className="flex justify-between gap-2">
                    <dt className="text-slate-500">Tasdiqlangan</dt>
                    <dd className="text-slate-900">{new Date(article.acceptedDate).toLocaleDateString("uz-UZ")}</dd>
                  </div>
                )}
                {article.publishedAt && (
                  <div className="flex justify-between gap-2">
                    <dt className="text-slate-500">Nashr etilgan</dt>
                    <dd className="text-slate-900">{new Date(article.publishedAt).toLocaleDateString("uz-UZ")}</dd>
                  </div>
                )}
                {article.reviewType && (
                  <div className="flex justify-between gap-2">
                    <dt className="text-slate-500">Ko'rib chiqish</dt>
                    <dd className="text-slate-900 text-right">
                      {article.reviewType === "DOUBLE_BLIND" ? "Ikki tomonlama" :
                       article.reviewType === "SINGLE_BLIND" ? "Bir tomonlama" :
                       article.reviewType === "OPEN" ? "Ochiq" : article.reviewType}
                    </dd>
                  </div>
                )}
                {article.license && (
                  <div className="flex justify-between gap-2">
                    <dt className="text-slate-500">Litsenziya</dt>
                    <dd className="text-slate-900">{article.license}</dd>
                  </div>
                )}
              </dl>
            </div>

            {/* Citation formats — in sidebar, not modal */}
            <div className="border-t border-slate-100 pt-6">
              <h3 className="mb-3 flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-slate-500">
                <span>Iqtibos formatlari</span>
                {citationText && (
                  <button
                    onClick={openCitePanel}
                    className="text-[10px] font-normal normal-case tracking-normal text-slate-400 hover:text-slate-900"
                  >
                    ko'rish →
                  </button>
                )}
              </h3>

              <div className="space-y-4">
                {CITATION_GROUPS.map((group) => (
                  <div key={group.label}>
                    <div className="mb-1.5 text-[10px] font-medium uppercase tracking-wider text-slate-400">
                      {group.label}
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {group.formats.map((fmt) => (
                        <button
                          key={fmt.id}
                          onClick={() => { loadCitation(fmt.id); setCitePanelOpen(true); }}
                          title={fmt.desc}
                          className={`rounded-md border px-2 py-1 text-[11px] font-medium transition ${
                            citationFormat === fmt.id && citePanelOpen
                              ? "border-slate-900 bg-slate-900 text-white"
                              : "border-slate-200 text-slate-700 hover:border-slate-900 hover:text-slate-900"
                          }`}
                        >
                          {fmt.label}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Issue link */}
            {article.issueId && (
              <Link
                to={`/issues/${article.issueId}`}
                className="group block border-t border-slate-100 pt-6"
              >
                <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Ushbu son
                </div>
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-sm text-slate-900">
                    <BookOpen size={14} className="text-slate-400" />
                    <span>Tom {article.volumeNumber}, Son {article.issueNumber}</span>
                  </div>
                  <ChevronRight size={14} className="text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-slate-900" />
                </div>
              </Link>
            )}

            {/* Indexing */}
            <div className="border-t border-slate-100 pt-6">
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
                Indekslash
              </h3>
              <div className="flex flex-wrap gap-1.5 text-[10px] text-slate-500">
                <span>Google Scholar</span>
                <span className="text-slate-300">·</span>
                <span>Dublin Core</span>
                <span className="text-slate-300">·</span>
                <span>PRISM</span>
                <span className="text-slate-300">·</span>
                <span>Schema.org</span>
                {article.doi && (
                  <>
                    <span className="text-slate-300">·</span>
                    <span>CrossRef</span>
                  </>
                )}
              </div>
            </div>
          </aside>
        </div>
      </main>

      {/* ── Citation panel: right-side drawer ───────────────────────── */}
      <CitationDrawer
        open={citePanelOpen}
        formatId={citationFormat}
        text={citationText}
        loading={citationLoading}
        copied={copied}
        onClose={() => setCitePanelOpen(false)}
        onSelect={loadCitation}
        onCopy={copyCitation}
        onDownload={downloadCitation}
      />

      <Footer />
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────── */

function CitationDrawer({ open, formatId, text, loading, copied, onClose, onSelect, onCopy, onDownload }) {
  const current = ALL_FORMATS.find((f) => f.id === formatId);

  return (
    <>
      {/* backdrop */}
      <div
        onClick={onClose}
        className={`fixed inset-0 z-40 bg-slate-900/20 transition-opacity duration-300 ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      {/* panel */}
      <aside
        className={`fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col bg-white shadow-xl transition-transform duration-300 ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-100 px-6 py-5">
          <div>
            <h2 className="text-base font-semibold text-slate-900">Iqtibos</h2>
            <p className="mt-0.5 text-xs text-slate-500">
              {current?.label} — {current?.desc}
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-md p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          >
            <X size={16} />
          </button>
        </div>

        {/* Preview */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            {loading ? (
              <div className="flex items-center gap-2 py-6 text-xs text-slate-400">
                <div className="h-3 w-3 animate-spin rounded-full border-2 border-slate-300 border-t-slate-700" />
                Yuklanmoqda...
              </div>
            ) : (
              <div
                className="text-sm leading-relaxed text-slate-800 whitespace-pre-wrap"
                style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
                dangerouslySetInnerHTML={{ __html: text || "<span style='color:#94a3b8'>Ma'lumot yo'q</span>" }}
              />
            )}
          </div>

          {/* Quick format switcher */}
          <div className="mt-6">
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
              Boshqa formatlar
            </h3>
            <div className="space-y-3">
              {CITATION_GROUPS.map((group) => (
                <div key={group.label}>
                  <div className="mb-1.5 text-[10px] font-medium uppercase tracking-wider text-slate-400">
                    {group.label}
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {group.formats.map((fmt) => (
                      <button
                        key={fmt.id}
                        onClick={() => onSelect(fmt.id)}
                        className={`rounded-md border px-2.5 py-1 text-xs font-medium transition ${
                          formatId === fmt.id
                            ? "border-slate-900 bg-slate-900 text-white"
                            : "border-slate-200 text-slate-700 hover:border-slate-900 hover:text-slate-900"
                        }`}
                      >
                        {fmt.label}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 border-t border-slate-100 px-6 py-4">
          <button
            onClick={onCopy}
            disabled={loading || !text}
            className="flex flex-1 items-center justify-center gap-2 rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white transition hover:bg-slate-700 disabled:opacity-40"
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
            {copied ? "Nusxalandi" : "Nusxalash"}
          </button>
          <button
            onClick={onDownload}
            disabled={loading || !text}
            className="flex flex-1 items-center justify-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-40"
          >
            <Download size={14} /> Yuklab olish
          </button>
        </div>
      </aside>
    </>
  );
}

/* ─────────────────────────────────────────────────────────────────────── */

function stripHtml(s) {
  if (!s) return "";
  return s.replace(/<[^>]+>/g, "");
}

function truncate(s, max) {
  if (!s) return "";
  return s.length <= max ? s : s.substring(0, max - 3) + "...";
}

function buildFallbackJsonLd(article, articleUrl, pdfUrl) {
  return {
    "@context": "https://schema.org",
    "@type": "ScholarlyArticle",
    headline: article.title,
    description: truncate(article.abstractText, 300),
    url: articleUrl,
    ...(article.doi && { sameAs: `https://doi.org/${article.doi}` }),
    author: (article.authors || []).map((a) => ({
      "@type": "Person",
      name: a.fullName,
      ...(a.affiliation && {
        affiliation: { "@type": "Organization", name: a.affiliation },
      }),
    })),
    ...(article.journalTitle && {
      isPartOf: { "@type": "Periodical", name: article.journalTitle },
    }),
    ...(article.publishedAt && {
      datePublished: new Date(article.publishedAt).toISOString().split("T")[0],
    }),
    ...(article.keywords && { keywords: article.keywords.join(", ") }),
    ...(pdfUrl && {
      encoding: {
        "@type": "MediaObject",
        contentUrl: pdfUrl,
        encodingFormat: "application/pdf",
      },
    }),
    ...(article.license && { license: article.license }),
    inLanguage: article.language || "uz",
  };
}
