import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Mail, Globe, Phone, ChevronRight, BookOpen, Users, Info } from "lucide-react";
import ApiCall, { baseUrl } from "../../../config/index";
import { fileUrl } from "../../../config/fileUrl";
import Header from "../../../components/layout/Header";
import Footer from "../../../components/layout/Footer";

const freqLabels = {
  WEEKLY: "Haftalik", MONTHLY: "Oylik", BIMONTHLY: "2 oyda bir",
  QUARTERLY: "Choraklik", BIANNUAL: "Yiliga 2 marta", ANNUAL: "Yillik",
  IRREGULAR: "Tartibsiz", CONTINUOUS: "Uzluksiz",
};

const TABS = [
  { id: "issues", label: "Sonlar", icon: BookOpen },
  { id: "about", label: "Jurnal haqida", icon: Info },
  { id: "board", label: "Tahririyat", icon: Users },
];

export default function JournalDetail() {
  const { slug } = useParams();
  const [journal, setJournal] = useState(null);
  const [issues, setIssues] = useState([]);
  const [board, setBoard] = useState([]);
  const [tab, setTab] = useState("issues");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await ApiCall(`/api/v1/journals/${slug}`, "GET");
        const j = res.data?.data || res.data;
        setJournal(j);
        if (j?.id) {
          const [issuesRes, boardRes] = await Promise.all([
            ApiCall(`/api/v1/journals/${j.id}/issues`, "GET"),
            ApiCall(`/api/v1/journals/${j.id}/board`, "GET"),
          ]);
          setIssues(issuesRes.data?.data || issuesRes.data || []);
          setBoard(boardRes.data?.data || boardRes.data || []);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [slug]);

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

  if (!journal) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <div className="flex flex-1 flex-col items-center justify-center text-gray-500">
          <p className="text-xl">Jurnal topilmadi</p>
          <Link to="/journals" className="mt-4 text-blue-600 underline">Barcha jurnallar</Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <Helmet>
        <title>{journal.title} | BXU Journal</title>
        {(journal.shortDescription || journal.description) && (
          <meta name="description" content={journal.shortDescription || journal.description} />
        )}
        <meta property="og:type" content="website" />
        <meta property="og:title" content={journal.title} />
        {(journal.shortDescription || journal.description) && (
          <meta property="og:description" content={journal.shortDescription || journal.description} />
        )}
        {journal.coverImageUrl && (
          <meta property="og:image" content={fileUrl(journal.coverImageUrl)} />
        )}
        {journal.issnPrint && <meta name="citation_issn" content={journal.issnPrint} />}
        {journal.issnOnline && <meta name="citation_issn" content={journal.issnOnline} />}
      </Helmet>
      <Header />

      {/* Journal hero */}
      <div className="bg-gradient-to-br from-blue-700 to-indigo-800 px-4 py-10 text-white">
        <div className="container mx-auto max-w-5xl">
          <div className="flex flex-col gap-6 md:flex-row md:items-start">
            {/* Cover */}
            <div className="h-40 w-32 flex-shrink-0 overflow-hidden rounded-xl shadow-lg md:h-48 md:w-36">
              {journal.coverImageUrl ? (
                <img src={fileUrl(journal.coverImageUrl)} alt={journal.title} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-white/20 p-3">
                  <BookOpen className="h-12 w-12 text-white/60" />
                </div>
              )}
            </div>
            <div className="flex-1">
              <div className="mb-2 flex flex-wrap gap-2">
                {journal.openAccess && (
                  <span className="rounded bg-green-500 px-2 py-0.5 text-xs font-semibold">Open Access</span>
                )}
                {journal.active && (
                  <span className="rounded bg-blue-500 px-2 py-0.5 text-xs font-semibold">Faol</span>
                )}
              </div>
              <h1 className="mb-1 text-2xl font-bold md:text-3xl">{journal.title}</h1>
              {journal.titleAbbr && <p className="mb-3 text-blue-200">{journal.titleAbbr}</p>}
              <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-blue-100">
                {journal.issnPrint && <span>ISSN (print): {journal.issnPrint}</span>}
                {journal.issnOnline && <span>ISSN (online): {journal.issnOnline}</span>}
                {journal.foundedYear && <span>Asos solingan: {journal.foundedYear}</span>}
                {journal.publicationFrequency && (
                  <span>{freqLabels[journal.publicationFrequency] || journal.publicationFrequency}</span>
                )}
                {journal.license && <span>Litsenziya: {journal.license}</span>}
              </div>
              <div className="mt-3 flex flex-wrap gap-4 text-sm text-blue-100">
                {journal.email && (
                  <a href={`mailto:${journal.email}`} className="flex items-center gap-1 hover:text-white">
                    <Mail size={14} /> {journal.email}
                  </a>
                )}
                {journal.website && (
                  <a href={journal.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-white">
                    <Globe size={14} /> Sayt
                  </a>
                )}
                {journal.phone && (
                  <span className="flex items-center gap-1">
                    <Phone size={14} /> {journal.phone}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Breadcrumb */}
      <div className="border-b bg-white px-4 py-2">
        <div className="container mx-auto max-w-5xl flex items-center gap-2 text-sm text-gray-500">
          <Link to="/journals" className="hover:text-blue-600">Jurnallar</Link>
          <ChevronRight size={14} />
          <span className="text-gray-800">{journal.title}</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b bg-white px-4">
        <div className="container mx-auto max-w-5xl flex gap-0">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 border-b-2 px-5 py-3 text-sm font-medium transition ${
                tab === t.id
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-800"
              }`}
            >
              <t.icon size={15} />
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <main className="container mx-auto max-w-5xl flex-1 px-4 py-8">
        {/* ISSUES TAB */}
        {tab === "issues" && (
          <div>
            {issues.length === 0 ? (
              <div className="py-12 text-center text-gray-400">
                <BookOpen className="mx-auto mb-3 h-12 w-12 text-gray-200" />
                <p>Hali sonlar yo'q</p>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
                {issues.map((issue) => (
                  <Link
                    key={issue.id}
                    to={`/issues/${issue.id}`}
                    className="group rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition hover:shadow-md"
                  >
                    <div className="mb-2 flex items-start justify-between">
                      <span className="text-xs font-semibold uppercase tracking-wide text-blue-600">
                        Tom {issue.volumeNumber}, Son {issue.issueNumber}
                      </span>
                      {issue.current && (
                        <span className="rounded bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-700">Joriy</span>
                      )}
                    </div>
                    <h3 className="mb-2 font-semibold text-gray-800 group-hover:text-blue-700">
                      {issue.title || `${issue.volumeNumber}-tom, ${issue.issueNumber}-son`}
                    </h3>
                    <p className="text-xs text-gray-500">
                      {issue.publishedDate && new Date(issue.publishedDate).toLocaleDateString("uz-UZ")}
                    </p>
                    {issue.articleCount != null && (
                      <p className="mt-2 text-xs text-gray-400">{issue.articleCount} ta maqola</p>
                    )}
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ABOUT TAB */}
        {tab === "about" && (
          <div className="space-y-6">
            {journal.description && (
              <div className="rounded-xl bg-white p-6 shadow-sm">
                <h2 className="mb-3 font-semibold text-gray-800">Jurnal haqida</h2>
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-gray-600">{journal.description}</p>
              </div>
            )}
            {journal.scope && (
              <div className="rounded-xl bg-white p-6 shadow-sm">
                <h2 className="mb-3 font-semibold text-gray-800">Ilmiy yo'nalish</h2>
                <p className="text-sm leading-relaxed text-gray-600">{journal.scope}</p>
              </div>
            )}
            <div className="rounded-xl bg-white p-6 shadow-sm">
              <h2 className="mb-4 font-semibold text-gray-800">Asosiy ma'lumotlar</h2>
              <dl className="grid gap-3 sm:grid-cols-2 text-sm">
                {[
                  ["Nashriyot", journal.publisher],
                  ["Asos solingan", journal.foundedYear],
                  ["Til", journal.language],
                  ["Mamlakat", journal.country],
                  ["Litsenziya", journal.license],
                  ["ISSN (print)", journal.issnPrint],
                  ["ISSN (online)", journal.issnOnline],
                  ["DOI", journal.doi],
                ].filter(([, v]) => v).map(([label, value]) => (
                  <div key={label} className="flex gap-2">
                    <dt className="min-w-[120px] font-medium text-gray-500">{label}:</dt>
                    <dd className="text-gray-800">{value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        )}

        {/* BOARD TAB */}
        {tab === "board" && (
          <div>
            {board.length === 0 ? (
              <div className="py-12 text-center text-gray-400">
                <Users className="mx-auto mb-3 h-12 w-12 text-gray-200" />
                <p>Tahririyat a'zolari ko'rsatilmagan</p>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
                {board.map((member) => (
                  <div key={member.id} className="flex gap-4 rounded-xl bg-white p-5 shadow-sm">
                    <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-full bg-blue-100">
                      {member.photoUrl ? (
                        <img src={fileUrl(member.photoUrl)} alt={member.fullName} className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-lg font-bold text-blue-600">
                          {member.fullName?.charAt(0)}
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-gray-800 truncate">{member.fullName}</p>
                      {member.position && <p className="text-xs text-blue-600">{member.position}</p>}
                      {member.affiliation && <p className="text-xs text-gray-500 truncate">{member.affiliation}</p>}
                      {member.orcid && (
                        <a
                          href={`https://orcid.org/${member.orcid}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-1 text-xs text-green-600 hover:underline"
                        >
                          ORCID
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
