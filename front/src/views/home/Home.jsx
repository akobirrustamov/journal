import React from "react";
import { Link } from "react-router-dom";
import Header from "../../components/layout/Header";
import Footer from "../../components/layout/Footer";

const Home = () => {
  return (
    <div className="flex min-h-screen flex-col">
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
            <Link
              to="/journals"
              className="rounded-xl bg-white px-8 py-3 font-semibold text-blue-700 shadow-lg transition hover:bg-blue-50"
            >
              Jurnallarni ko'rish
            </Link>
            <Link
              to="/articles"
              className="rounded-xl border border-white/40 bg-white/10 px-8 py-3 font-semibold text-white backdrop-blur transition hover:bg-white/20"
            >
              Maqolalarni qidirish
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <main className="flex-grow bg-gray-50 px-4 py-16">
        <div className="container mx-auto max-w-5xl">
          <div className="grid gap-8 md:grid-cols-3">
            <Link
              to="/journals"
              className="group rounded-2xl bg-white p-7 shadow-sm transition hover:shadow-md"
            >
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-blue-100">
                <svg className="h-7 w-7 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 className="mb-2 text-xl font-bold text-gray-800 group-hover:text-blue-700">Ilmiy Jurnallar</h3>
              <p className="text-gray-500">
                BXU tomonidan nashr etiladigan ilmiy jurnallar to'plami. Open Access formatida bepul foydalanish.
              </p>
            </Link>

            <Link
              to="/articles"
              className="group rounded-2xl bg-white p-7 shadow-sm transition hover:shadow-md"
            >
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-indigo-100">
                <svg className="h-7 w-7 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="mb-2 text-xl font-bold text-gray-800 group-hover:text-indigo-700">Ilmiy Maqolalar</h3>
              <p className="text-gray-500">
                Nashr etilgan ilmiy tadqiqotlarni qidirish, o'qish va PDF ko'rinishda yuklab olish.
              </p>
            </Link>

            <div className="rounded-2xl bg-white p-7 shadow-sm">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-green-100">
                <svg className="h-7 w-7 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="mb-2 text-xl font-bold text-gray-800">Ochiq kirish</h3>
              <p className="text-gray-500">
                Barcha nashrlar Open Access asosida — ro'yxatdan o'tmasdan bepul o'qish mumkin.
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Home;
