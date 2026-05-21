import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { FileText, Download, ChevronRight, Users, Eye } from "lucide-react";
import ApiCall, { baseUrl } from "../../../config/index";
import Header from "../../../components/layout/Header";
import Footer from "../../../components/layout/Footer";

export default function IssueDetail() {
  const { id } = useParams();
  const [issue, setIssue] = useState(null);
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const pageSize = 20;

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [issueRes, articlesRes] = await Promise.all([
          ApiCall(`/api/v1/issues/${id}`, "GET"),
          ApiCall(`/api/v1/issues/${id}/articles?page=${page}&size=${pageSize}`, "GET"),
        ]);
        setIssue(issueRes.data?.data || issueRes.data);
        const artData = articlesRes.data?.data || articlesRes.data;
        setArticles(artData?.content || artData || []);
        setTotalPages(artData?.totalPages || 1);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, page]);

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

  if (!issue) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <div className="flex flex-1 flex-col items-center justify-center text-gray-500">
          <p className="text-xl">Son topilmadi</p>
          <Link to="/journals" className="mt-4 text-blue-600 underline">Jurnallarga qaytish</Link>
        </div>
        <Footer />
      </div>
    );
  }

  const issueTitle = issue.title || `Tom ${issue.volumeNumber}, Son ${issue.issueNumber}`;

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <Helmet>
        <title>{issue.journalTitle ? `${issueTitle} — ${issue.journalTitle} | BXU Journal` : `${issueTitle} | BXU Journal`}</title>
        {issue.description && <meta name="description" content={issue.description} />}
        <meta property="og:type" content="website" />
        <meta property="og:title" content={issueTitle} />
        {issue.description && <meta property="og:description" content={issue.description} />}
        {issue.doi && <meta name="citation_doi" content={issue.doi} />}
        {issue.journalTitle && <meta name="citation_journal_title" content={issue.journalTitle} />}
      </Helmet>
      <Header />

      {/* Issue header */}
      <div className="bg-gradient-to-br from-blue-700 to-indigo-800 px-4 py-10 text-white">
        <div className="container mx-auto max-w-5xl">
          <p className="mb-1 text-sm text-blue-200">{issue.journalTitle}</p>
          <h1 className="mb-2 text-2xl font-bold md:text-3xl">
            {issue.title || `Tom ${issue.volumeNumber}, Son ${issue.issueNumber}`}
          </h1>
          <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-blue-100">
            <span>Tom {issue.volumeNumber}, Son {issue.issueNumber}</span>
            {issue.publishedDate && (
              <span>Nashr sanasi: {new Date(issue.publishedDate).toLocaleDateString("uz-UZ")}</span>
            )}
            {issue.doi && <span>DOI: {issue.doi}</span>}
            {issue.articleCount != null && <span>{issue.articleCount} ta maqola</span>}
          </div>
        </div>
      </div>

      {/* Breadcrumb */}
      <div className="border-b bg-white px-4 py-2">
        <div className="container mx-auto max-w-5xl flex items-center gap-2 text-sm text-gray-500">
          <Link to="/journals" className="hover:text-blue-600">Jurnallar</Link>
          <ChevronRight size={14} />
          {issue.journalId && (
            <>
              <Link to={`/journals/${issue.journalSlug || issue.journalId}`} className="hover:text-blue-600">
                {issue.journalTitle}
              </Link>
              <ChevronRight size={14} />
            </>
          )}
          <span className="text-gray-800">Son {issue.issueNumber}</span>
        </div>
      </div>

      <main className="container mx-auto max-w-5xl flex-1 px-4 py-8">
        {issue.description && (
          <div className="mb-6 rounded-xl bg-white p-5 shadow-sm text-sm text-gray-600">
            {issue.description}
          </div>
        )}

        <h2 className="mb-4 text-lg font-bold text-gray-800">Maqolalar ({articles.length})</h2>

        {articles.length === 0 ? (
          <div className="py-12 text-center text-gray-400">
            <FileText className="mx-auto mb-3 h-12 w-12 text-gray-200" />
            <p>Bu sonda hali maqolalar yo'q</p>
          </div>
        ) : (
          <div className="space-y-4">
            {articles.map((article) => (
              <div
                key={article.id}
                className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <Link
                      to={`/articles/${article.slug}`}
                      className="mb-2 block text-base font-semibold text-gray-800 hover:text-blue-700"
                    >
                      {article.title}
                    </Link>

                    {/* Authors */}
                    {article.authors && article.authors.length > 0 && (
                      <p className="mb-2 flex items-center gap-1 text-sm text-gray-500">
                        <Users size={13} />
                        {article.authors.map((a) => a.fullName).join(", ")}
                      </p>
                    )}

                    {/* Abstract */}
                    {article.abstractText && (
                      <p className="mb-3 line-clamp-2 text-sm text-gray-500">{article.abstractText}</p>
                    )}

                    {/* Keywords */}
                    {article.keywords && article.keywords.length > 0 && (
                      <div className="mb-3 flex flex-wrap gap-1">
                        {article.keywords.map((kw, i) => (
                          <span key={i} className="rounded bg-blue-50 px-2 py-0.5 text-xs text-blue-700">
                            {kw}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="flex flex-wrap items-center gap-4 text-xs text-gray-400">
                      {article.doi && <span>DOI: {article.doi}</span>}
                      {article.pageStart && article.pageEnd && (
                        <span>Sahifalar: {article.pageStart}–{article.pageEnd}</span>
                      )}
                      {article.viewCount != null && (
                        <span className="flex items-center gap-1">
                          <Eye size={12} /> {article.viewCount}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-shrink-0 flex-col gap-2">
                    <Link
                      to={`/articles/${article.slug}`}
                      className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700"
                    >
                      Ko'rish
                    </Link>
                    {article.pdfUrl && (
                      <a
                        href={`${baseUrl}/api/v1/articles/${article.id}/download`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50"
                      >
                        <Download size={12} /> PDF
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div className="mt-8 flex items-center justify-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className="rounded-lg border px-4 py-2 text-sm text-gray-700 disabled:opacity-40 hover:bg-gray-100"
            >
              Oldingi
            </button>
            <span className="text-sm text-gray-600">{page + 1} / {totalPages}</span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              className="rounded-lg border px-4 py-2 text-sm text-gray-700 disabled:opacity-40 hover:bg-gray-100"
            >
              Keyingi
            </button>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
