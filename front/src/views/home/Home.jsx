import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { BookOpen, FileText, Download, Eye, Users, ArrowRight } from "lucide-react";
import ApiCall from "../../config/index";
import { fileUrl } from "../../config/fileUrl";
import Header from "../../components/layout/Header";
import Footer from "../../components/layout/Footer";

export default function Home() {
  const [journals, setJournals] = useState([]);
  const [articles, setArticles] = useState([]);
  const [stats, setStats] = useState({ journals: 0, articles: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [jRes, aRes] = await Promise.all([
          ApiCall("/api/v1/journals?page=0&size=6", "GET"),
          ApiCall("/api/v1/articles?page=0&size=5&sort=publishedAt,desc", "GET"),
        ]);

        if (!jRes.error) {
          const jData = jRes.data?.data || jRes.data;
          const jList = jData?.content || jData;
          if (Array.isArray(jList)) {
            setJournals(jList);
            setStats((s) => ({ ...s, journals: jData?.totalElements || jList.length }));
          }
        }

        if (!aRes.error) {
          const aData = aRes.data?.data || aRes.data;
          const aList = aData?.content || aData;
          if (Array.isArray(aList)) {
            setArticles(aList);
            setStats((s) => ({ ...s, articles: aData?.totalElements || aList.length }));
          }
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="flex min-h-screen flex-col">
      <Helmet>
        <title>BXU Ilmiy Jurnallar Platformasi</title>
        <meta name="description" content="Buxoro Xalqaro Universiteti ilmiy nashrlari, maqolalari va tadqiqotlari." />
      </Helmet>
      <Header />

      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-700 to-indigo-900 px-4 py-20 text-white">
        <div className="container mx-auto max-w-4xl text-center">
          <h1 className="mb-4 text-4xl font-bold leading-tight md:text-5xl">
            BXU Ilmiy Jurnallar Platformasi
          </h1>
          <p className="mx-auto mb-10 max-w-2xl text-lg text-blue-100">
            Buxoro Xalqaro Universiteti ilmiy nashrlari, maqolalari va tadqiqotlari
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/journals"
              className="rounded-xl bg-white px-8 py-3 font-semibold text-blue-700 shadow-lg transition hover:bg-blue-50">
              Jurnallarni ko'rish
            </Link>
            <Link to="/articles"
              className="rounded-xl border border-white/40 bg-white/10 px-8 py-3 font-semibold text-white backdrop-blur transition hover:bg-white/20">
              Maqolalarni qidirish
            </Link>
          </div>

          {/* Stats */}
          {!loading && (stats.journals > 0 || stats.articles > 0) && (
            <div className="mt-12 flex justify-center gap-12">
              {stats.journals > 0 && (
                <div className="text-center">
                  <p className="text-3xl font-bold">{stats.journals}</p>
                  <p className="text-sm text-blue-200">Jurnal</p>
                </div>
              )}
              {stats.articles > 0 && (
                <div className="text-center">
                  <p className="text-3xl font-bold">{stats.articles}+</p>
                  <p className="text-sm text-blue-200">Maqola</p>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      <main className="flex-grow bg-gray-50 px-4 py-14">
        <div className="container mx-auto max-w-6xl space-y-16">

          {/* Features */}
          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                to: "/journals",
                icon: <BookOpen className="h-7 w-7 text-blue-600" />,
                bg: "bg-blue-100",
                title: "Ilmiy Jurnallar",
                text: "BXU tomonidan nashr etiladigan ilmiy jurnallar to'plami. Open Access formatida bepul foydalanish.",
                hover: "group-hover:text-blue-700",
              },
              {
                to: "/articles",
                icon: <FileText className="h-7 w-7 text-indigo-600" />,
                bg: "bg-indigo-100",
                title: "Ilmiy Maqolalar",
                text: "Nashr etilgan ilmiy tadqiqotlarni qidirish, o'qish va PDF ko'rinishda yuklab olish.",
                hover: "group-hover:text-indigo-700",
              },
              {
                to: "/submit",
                icon: <Users className="h-7 w-7 text-green-600" />,
                bg: "bg-green-100",
                title: "Maqola Yuborish",
                text: "Tadqiqotingizni BXU ilmiy jurnallariga taqdim eting. Oddiy va qulay jarayon.",
                hover: "group-hover:text-green-700",
              },
            ].map((f) => (
              <Link key={f.to} to={f.to}
                className="group rounded-2xl bg-white p-7 shadow-sm transition hover:shadow-md">
                <div className={`mb-4 flex h-14 w-14 items-center justify-center rounded-xl ${f.bg}`}>
                  {f.icon}
                </div>
                <h3 className={`mb-2 text-xl font-bold text-gray-800 transition ${f.hover}`}>{f.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{f.text}</p>
              </Link>
            ))}
          </div>

          {/* Latest journals */}
          {journals.length > 0 && (
            <section>
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-800">Jurnallar</h2>
                <Link to="/journals"
                  className="flex items-center gap-1 text-sm font-medium text-blue-600 hover:underline">
                  Barchasi <ArrowRight size={15} />
                </Link>
              </div>
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {journals.map((journal) => (
                  <Link key={journal.id} to={`/journals/${journal.slug}`}
                    className="group flex overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition hover:shadow-md">
                    <div className="relative h-full w-24 flex-shrink-0 bg-gradient-to-b from-blue-500 to-indigo-600">
                      {journal.coverImageUrl ? (
                        <img src={fileUrl(journal.coverImageUrl)} alt={journal.title}
                          className="h-full w-full object-cover"
                          onError={(e) => { e.target.style.display = "none"; }} />
                      ) : (
                        <div className="flex h-full items-center justify-center p-2">
                          <BookOpen className="h-8 w-8 text-white/60" />
                        </div>
                      )}
                      {journal.openAccess && (
                        <span className="absolute bottom-1 left-1 rounded bg-green-500 px-1 py-0.5 text-xs font-bold text-white">OA</span>
                      )}
                    </div>
                    <div className="flex flex-1 flex-col justify-center p-4">
                      <h3 className="mb-1 line-clamp-2 text-sm font-bold text-gray-800 group-hover:text-blue-700">
                        {journal.title}
                      </h3>
                      {journal.issnOnline && (
                        <p className="text-xs text-gray-400">ISSN: {journal.issnOnline}</p>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Latest articles */}
          {articles.length > 0 && (
            <section>
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-800">So'nggi maqolalar</h2>
                <Link to="/articles"
                  className="flex items-center gap-1 text-sm font-medium text-blue-600 hover:underline">
                  Barchasi <ArrowRight size={15} />
                </Link>
              </div>
              <div className="space-y-3">
                {articles.map((article) => (
                  <div key={article.id}
                    className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition hover:shadow-md">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        {article.journalTitle && (
                          <p className="mb-1 text-xs text-blue-600">{article.journalTitle}</p>
                        )}
                        <Link to={`/articles/${article.slug}`}
                          className="mb-2 block font-semibold text-gray-800 hover:text-blue-700 line-clamp-2">
                          {article.title}
                        </Link>
                        {article.authors?.length > 0 && (
                          <p className="mb-2 flex items-center gap-1 text-xs text-gray-500">
                            <Users size={12} />
                            {article.authors.map((a) => a.fullName).join(", ")}
                          </p>
                        )}
                        <div className="flex flex-wrap gap-4 text-xs text-gray-400">
                          {article.publishedAt && (
                            <span>{new Date(article.publishedAt).toLocaleDateString("uz-UZ")}</span>
                          )}
                          {article.viewCount != null && (
                            <span className="flex items-center gap-1"><Eye size={11} /> {article.viewCount}</span>
                          )}
                          {article.downloadCount != null && (
                            <span className="flex items-center gap-1"><Download size={11} /> {article.downloadCount}</span>
                          )}
                        </div>
                      </div>
                      <Link to={`/articles/${article.slug}`}
                        className="flex-shrink-0 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700">
                        Ko'rish
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Loading placeholder */}
          {loading && (
            <div className="flex justify-center py-12">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600" />
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
