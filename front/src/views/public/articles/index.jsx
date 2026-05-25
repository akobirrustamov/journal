import { useEffect, useState, useCallback } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Search, FileText, Download, Eye, Users } from "lucide-react";
import ApiCall, { baseUrl } from "../../../config/index";
import Header from "../../../components/layout/Header";
import Footer from "../../../components/layout/Footer";

export default function ArticlesList() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [inputValue, setInputValue] = useState(searchParams.get("q") || "");
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const pageSize = 20;

  const fetchArticles = useCallback(async () => {
    setLoading(true);
    try {
      const url = query
        ? `/api/v1/articles/search?q=${encodeURIComponent(query)}&page=${page}&size=${pageSize}`
        : `/api/v1/articles?page=${page}&size=${pageSize}&sort=publishedAt,desc`;
      const res = await ApiCall(url, "GET");
      if (!res.error) {
        const data = res.data?.data || res.data;
        const list = data?.content || data;
        setArticles(Array.isArray(list) ? list : []);
        setTotalPages(data?.totalPages || 1);
        setTotalElements(data?.totalElements || 0);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [query, page]);

  useEffect(() => {
    fetchArticles();
  }, [fetchArticles]);

  const handleSearch = (e) => {
    e.preventDefault();
    const q = inputValue.trim();
    setQuery(q);
    setPage(0);
    if (q) setSearchParams({ q });
    else setSearchParams({});
  };

  const clearSearch = () => {
    setQuery("");
    setInputValue("");
    setPage(0);
    setSearchParams({});
  };

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <Helmet>
        <title>{query ? `"${query}" bo'yicha maqolalar | BXU Journal` : "Ilmiy Maqolalar | BXU Journal"}</title>
        <meta name="description" content="BXU ilmiy jurnallarida nashr etilgan maqolalar. Tadqiqotlarni o'qing, yuklab oling va iqtibos keltiring." />
        <meta property="og:title" content="Ilmiy Maqolalar | BXU Journal" />
        <meta property="og:description" content="Nashr etilgan ilmiy tadqiqotlar to'plami." />
        <meta property="og:type" content="website" />
      </Helmet>
      <Header />

      {/* Hero */}
      <div className="bg-gradient-to-br from-indigo-700 to-blue-800 px-4 py-12 text-white">
        <div className="container mx-auto max-w-4xl text-center">
          <h1 className="mb-3 text-3xl font-bold md:text-4xl">Ilmiy Maqolalar</h1>
          <p className="mb-8 text-blue-100">Nashr etilgan ilmiy tadqiqotlar to'plami</p>
          <form onSubmit={handleSearch} className="mx-auto flex max-w-xl gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Sarlavha, annotatsiya, kalit so'z..."
                className="w-full rounded-lg border-0 py-3 pl-10 pr-4 text-gray-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-white/50"
              />
            </div>
            <button
              type="submit"
              className="rounded-lg bg-white px-5 py-3 font-semibold text-blue-700 shadow transition hover:bg-blue-50"
            >
              Qidirish
            </button>
          </form>
        </div>
      </div>

      <main className="container mx-auto max-w-5xl flex-1 px-4 py-10">
        {/* Status bar */}
        <div className="mb-6 flex items-center justify-between">
          <p className="text-sm text-gray-500">
            {query ? (
              <>
                "<span className="font-medium text-gray-800">{query}</span>" bo'yicha{" "}
                <span className="font-medium">{totalElements}</span> ta natija
              </>
            ) : (
              <>Jami <span className="font-medium">{totalElements}</span> ta maqola</>
            )}
          </p>
          {query && (
            <button onClick={clearSearch} className="text-sm text-blue-600 hover:underline">
              Tozalash
            </button>
          )}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600" />
          </div>
        ) : articles.length === 0 ? (
          <div className="py-16 text-center text-gray-400">
            <FileText className="mx-auto mb-4 h-16 w-16 text-gray-200" />
            <p className="text-lg">Maqolalar topilmadi</p>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {articles.map((article) => (
                <div
                  key={article.id}
                  className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition hover:shadow-md"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      {/* Journal + Issue */}
                      {article.journalTitle && (
                        <p className="mb-1 text-xs text-blue-600">
                          <Link to={`/journals/${article.journalSlug || article.journalId}`} className="hover:underline">
                            {article.journalTitle}
                          </Link>
                          {article.volumeNumber && (
                            <span className="ml-2 text-gray-400">
                              Tom {article.volumeNumber}, Son {article.issueNumber}
                            </span>
                          )}
                        </p>
                      )}

                      <Link
                        to={`/articles/${article.slug}`}
                        className="mb-2 block text-base font-semibold text-gray-800 hover:text-blue-700"
                      >
                        {article.title}
                      </Link>

                      {article.authors && article.authors.length > 0 && (
                        <p className="mb-2 flex items-center gap-1 text-sm text-gray-500">
                          <Users size={13} />
                          {article.authors.map((a) => a.fullName).join(", ")}
                        </p>
                      )}

                      {article.abstractText && (
                        <p className="mb-3 line-clamp-2 text-sm text-gray-500">{article.abstractText}</p>
                      )}

                      {article.keywords && article.keywords.length > 0 && (
                        <div className="mb-3 flex flex-wrap gap-1">
                          {article.keywords.slice(0, 5).map((kw, i) => (
                            <span key={i} className="rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                              {kw}
                            </span>
                          ))}
                        </div>
                      )}

                      <div className="flex flex-wrap gap-4 text-xs text-gray-400">
                        {article.publishedAt && (
                          <span>{new Date(article.publishedAt).toLocaleDateString("uz-UZ")}</span>
                        )}
                        {article.doi && <span>DOI: {article.doi}</span>}
                        {article.viewCount != null && (
                          <span className="flex items-center gap-1"><Eye size={12} /> {article.viewCount}</span>
                        )}
                        {article.downloadCount != null && (
                          <span className="flex items-center gap-1"><Download size={12} /> {article.downloadCount}</span>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-shrink-0 flex-col gap-2">
                      <Link
                        to={`/articles/${article.slug}`}
                        className="rounded-lg bg-blue-600 px-3 py-1.5 text-center text-xs font-medium text-white hover:bg-blue-700"
                      >
                        Ko'rish
                      </Link>
                      {article.pdfUrl && (
                        <a
                          href={`${baseUrl}/api/v1/articles/${article.id}/download`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center gap-1 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50"
                        >
                          <Download size={12} /> PDF
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="mt-10 flex items-center justify-center gap-2">
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
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}
