import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

// Admin layouts
import SuperAdminLayout from "layouts/superadmin";
import EditorLayout from "layouts/editor";
import JournalAdminLayout from "layouts/journal-admin";

// Public portal
import Home from "./views/home/Home";
import PublicLogin from "./views/public/login/index";
import JournalsList from "./views/public/journals/index";
import JournalDetail from "./views/public/journals/JournalDetail";
import IssueDetail from "./views/public/issues/IssueDetail";
import ArticlesList from "./views/public/articles/index";
import ArticleDetail from "./views/public/articles/ArticleDetail";
import SubmitArticle from "./views/public/submit/index";
import MyArticles from "./views/public/my-articles/index";
import ReviewerDashboard from "./views/reviewer/index";
import ProfilePage from "./views/public/profile/index";

// Legacy admin login kept for superadmin access
import LoginAdmin from "./config/login/Login";

import ErrorPage from "./404/404";

const App = () => {
  return (
    <Routes>
      {/* ── Public portal ── */}
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<PublicLogin />} />
      <Route path="/journals" element={<JournalsList />} />
      <Route path="/journals/:slug" element={<JournalDetail />} />
      <Route path="/issues/:id" element={<IssueDetail />} />
      <Route path="/articles" element={<ArticlesList />} />
      <Route path="/articles/:slug" element={<ArticleDetail />} />
      <Route path="/submit" element={<SubmitArticle />} />
      <Route path="/my-articles" element={<MyArticles />} />
      <Route path="/my-reviews" element={<ReviewerDashboard />} />
      <Route path="/profile" element={<ProfilePage />} />

      {/* ── Admin dashboards ── */}
      <Route path="superadmin/*" element={<SuperAdminLayout />} />
      <Route path="editor/*" element={<EditorLayout />} />
      <Route path="journal-admin/*" element={<JournalAdminLayout />} />

      {/* ── Login pages ── */}
      <Route path="admin/login" element={<LoginAdmin />} />

      {/* ── Fallback ── */}
      <Route path="/404" element={<ErrorPage />} />
      <Route path="*" element={<Navigate to="/404" replace />} />
    </Routes>
  );
};

export default App;
