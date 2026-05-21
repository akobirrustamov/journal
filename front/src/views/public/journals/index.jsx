import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Search, BookOpen, ExternalLink } from "lucide-react";
import ApiCall, { baseUrl } from "../../../config/index";
import { fileUrl } from "../../../config/fileUrl";
import Header from "../../../components/layout/Header";
import Footer from "../../../components/layout/Footer";

const freqLabels = {
  WEEKLY: "Haftalik",
  MONTHLY: "Oylik",
  BIMONTHLY: "2 oyda bir",
  QUARTERLY: "Choraklik",
  BIANNUAL: "Yiliga 2 marta",
  ANNUAL: "Yillik",
  IRREGULAR: "Tartibsiz",
  CONTINUOUS: "Uzluksiz",
};

export default function JournalsList() {
  const [journals, setJournals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const pageSize = 12;

  const fetchJournals = useCallback(async () => {
    setLoading(true);
    try {
      const url = query
        ? `/api/v1/journals/search?q=${encodeURIComponent(query)}&page=${page}&size=${pageSize}`
        : `/api/v1/journals?page=${page}&size=${pageSize}`;
      const res = await ApiCall(url, "GET");
      if (!res.error) {
        const data = res.data?.data || res.data;
        const list = data?.content || data;
        setJournals(Array.isArray(list) ? list : []);
        setTotalPages(data?.totalPages || 1);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [query, page]);

  useEffect(() => {
    fetchJournals();
  }, [fetchJournals]);

  const handleSearch = (e) => {
    e.preventDefault();
    setQuery(inputValue.trim());
    setPage(0);
  };

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <Helmet>
        <title>{query ? `"${query}" bo'yicha jurnallar | BXU Journal` : "Ilmiy Jurnallar | BXU Journal"}</title>
        <meta name="description" content="BXU ilmiy nashrlari va jurnallar to'plami. Barcha sohalardagi ilmiy jurnallarni ko'ring." />
        <meta property="og:title" content="Ilmiy Jurnallar | BXU Journal" />
        <meta property="og:description" content="BXU ilmiy nashrlari va jurnallar to'plami." />
        <meta property="og:type" content="website" />
      </Helmet>
      <Header />

      {/* Hero */}
      <div className="bg-gradient-to-br from-blue-700 to-indigo-800 px-4 py-12 text-white">
        <div className="container mx-auto max-w-4xl text-center">
          <h1 className="mb-3 text-3xl font-bold md:text-4xl">Ilmiy Jurnallar</h1>
          <p className="mb-8 text-blue-100">BXU ilmiy nashrlari va jurnallar to'plami</p>
          <form onSubmit={handleSearch} className="mx-auto flex max-w-xl gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Jurnal nomi yoki tavsifi bo'yicha qidirish..."
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

      <main className="container mx-auto flex-1 px-4 py-10">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600" />
          </div>
        ) : journals.length === 0 ? (
          <div className="py-16 text-center text-gray-500">
            <BookOpen className="mx-auto mb-4 h-16 w-16 text-gray-300" />
            <p className="text-lg">Jurnallar topilmadi</p>
            {query && (
              <button onClick={() => { setQuery(""); setInputValue(""); }} className="mt-3 text-blue-600 underline">
                Filterni tozalash
              </button>
            )}
          </div>
        ) : (
          <>
            {query && (
              <p className="mb-6 text-sm text-gray-500">
                "<span className="font-medium">{query}</span>" bo'yicha {journals.length} ta natija
              </p>
            )}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {journals.map((journal) => (
                <Link
                  key={journal.id}
                  to={`/journals/${journal.slug}`}
                  className="group flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition hover:shadow-md"
                >
                  {/* Cover */}
                  <div className="relative h-40 bg-gradient-to-br from-blue-500 to-indigo-600">
                    {journal.coverImageUrl ? (
                      <img
                        src={fileUrl(journal.coverImageUrl)}
                        alt={journal.title}
                        className="h-full w-full object-cover"
                        onError={(e) => { e.target.style.display = "none"; }}
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center p-4">
                        <p className="text-center text-sm font-bold text-white">{journal.title}</p>
                      </div>
                    )}
                    {journal.openAccess && (
                      <span className="absolute right-2 top-2 rounded bg-green-500 px-2 py-0.5 text-xs font-semibold text-white">
                        Open Access
                      </span>
                    )}
                  </div>

                  <div className="flex flex-1 flex-col p-4">
                    <h3 className="mb-1 line-clamp-2 text-sm font-bold text-gray-800 group-hover:text-blue-700">
                      {journal.title}
                    </h3>
                    {journal.titleAbbr && (
                      <p className="mb-2 text-xs text-gray-500">{journal.titleAbbr}</p>
                    )}
                    {journal.shortDescription && (
                      <p className="mb-3 line-clamp-2 flex-1 text-xs text-gray-500">
                        {journal.shortDescription}
                      </p>
                    )}
                    <div className="mt-auto space-y-1 text-xs text-gray-500">
                      {journal.issnOnline && <p>ISSN: {journal.issnOnline}</p>}
                      {journal.publicationFrequency && (
                        <p>{freqLabels[journal.publicationFrequency] || journal.publicationFrequency}</p>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-10 flex items-center justify-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={page === 0}
                  className="rounded-lg border px-4 py-2 text-sm text-gray-700 disabled:opacity-40 hover:bg-gray-100"
                >
                  Oldingi
                </button>
                <span className="text-sm text-gray-600">
                  {page + 1} / {totalPages}
                </span>
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
