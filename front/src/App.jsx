import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import AdminLayout from "layouts/admin";
import StudentLayout from "layouts/student";
import Login from "./views/student/login/Login";
import LoginAdmin from "./config/login/Login";
import SuperAdminLayout from "layouts/superadmin";
import RektorLayout from "layouts/rektor";
import IlmiyBolimLayout from "layouts/ilmiy-bolim";
import IlmiyRahbarLayout from "layouts/ilmiy-rahbar";
import IlmiyTexnikLayout from "layouts/ilmiy-rahbar";
import BugalterLayout from "layouts/bugalter";
import Home from "./views/home/Home";

// Public portal
import JournalsList from "./views/public/journals/index";
import JournalDetail from "./views/public/journals/JournalDetail";
import IssueDetail from "./views/public/issues/IssueDetail";
import ArticlesList from "./views/public/articles/index";
import ArticleDetail from "./views/public/articles/ArticleDetail";

import ErrorPage from "./404/404";
import IconsAll from "./IconsAll";

const App = () => {
  return (
    <>
      <Routes>
        {/* Public */}
        <Route path="/" element={<Home />} />
        <Route path="/journals" element={<JournalsList />} />
        <Route path="/journals/:slug" element={<JournalDetail />} />
        <Route path="/issues/:id" element={<IssueDetail />} />
        <Route path="/articles" element={<ArticlesList />} />
        <Route path="/articles/:slug" element={<ArticleDetail />} />

        {/* Admin dashboards */}
        <Route path="superadmin/*" element={<SuperAdminLayout />} />
        <Route path="rektor/*" element={<RektorLayout />} />
        <Route path="admin/*" element={<AdminLayout />} />
        <Route path="bugalter/*" element={<BugalterLayout />} />
        <Route path="ilmiy-bolim/*" element={<IlmiyBolimLayout />} />
        <Route path="ilmiy-rahbar/*" element={<IlmiyRahbarLayout />} />
        <Route path="ilmiy-texnik/*" element={<IlmiyTexnikLayout />} />
        <Route path="student/*" element={<StudentLayout />} />

        <Route path="admin/login" element={<LoginAdmin />} />
        <Route path="student/login" element={<Login />} />
        <Route path="icons" element={<IconsAll />} />

        <Route path="/404" element={<ErrorPage />} />
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Routes>
    </>
  );
};

export default App;
