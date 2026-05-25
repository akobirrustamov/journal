import React from "react";
import { Routes, Route, Navigate, useLocation, useNavigate } from "react-router-dom";
import AdminNavbar from "components/layout/AdminNavbar";
import Sidebar from "./sidebar";
import routes from "../../routes/journal-admin";

export default function JournalAdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [open, setOpen] = React.useState(true);
  const [currentRoute, setCurrentRoute] = React.useState("Bosh sahifa");

  React.useEffect(() => {
    if (!localStorage.getItem("access_token")) navigate("/login", { replace: true });
  }, [navigate]);

  React.useEffect(() => {
    window.addEventListener("resize", () =>
      window.innerWidth < 1200 ? setOpen(false) : setOpen(true)
    );
  }, []);

  React.useEffect(() => {
    const found = routes.find((r) =>
      window.location.href.includes(r.layout + "/" + r.path)
    );
    if (found) setCurrentRoute(found.name);
  }, [location.pathname]);

  const getRoutes = (routes) =>
    routes.map((prop, key) =>
      prop.layout === "/journal-admin" ? (
        <Route path={`/${prop.path}`} element={prop.component} key={key} />
      ) : null
    );

  return (
    <div className="flex h-full w-full">
      <Sidebar open={open} onClose={() => setOpen(false)} />
      <div className="h-full w-full bg-lightPrimary dark:!bg-navy-900">
        <main className="mx-[12px] h-full flex-none transition-all md:pr-2 xl:ml-[313px]">
          <div className="h-full">
            <AdminNavbar onOpenSidenav={() => setOpen(true)} brandText={currentRoute} />
            <div className="mx-auto mb-auto h-full min-h-[84vh] p-2 md:pr-2">
              <Routes>
                {getRoutes(routes)}
                <Route path="/" element={<Navigate to="/journal-admin/default" replace />} />
              </Routes>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
