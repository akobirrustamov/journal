import JournalAdminDashboard from "views/journal-admin/default";
import SuperAdminJournals from "views/superadmin/journals";
import SuperAdminIssues from "views/superadmin/issues";
import SuperAdminArticles from "views/superadmin/articles";
import SuperAdminReviews from "views/superadmin/reviews";
import SuperAdminProfile from "views/superadmin/profile";
import { MdHome, MdMenuBook, MdLibraryBooks, MdArticle, MdRateReview, MdPerson } from "react-icons/md";

const routes = [
  {
    name: "Bosh sahifa",
    layout: "/journal-admin",
    path: "default",
    icon: <MdHome className="h-6 w-6" />,
    component: <JournalAdminDashboard />,
  },
  {
    name: "Jurnallar",
    layout: "/journal-admin",
    path: "journals",
    icon: <MdMenuBook className="h-6 w-6" />,
    component: <SuperAdminJournals />,
  },
  {
    name: "Sonlar",
    layout: "/journal-admin",
    path: "issues",
    icon: <MdLibraryBooks className="h-6 w-6" />,
    component: <SuperAdminIssues />,
  },
  {
    name: "Maqolalar",
    layout: "/journal-admin",
    path: "articles",
    icon: <MdArticle className="h-6 w-6" />,
    component: <SuperAdminArticles />,
  },
  {
    name: "Retsenziyalar",
    layout: "/journal-admin",
    path: "reviews",
    icon: <MdRateReview className="h-6 w-6" />,
    component: <SuperAdminReviews />,
  },
  {
    name: "Profil",
    layout: "/journal-admin",
    path: "profile",
    icon: <MdPerson className="h-6 w-6" />,
    component: <SuperAdminProfile />,
  },
];

export default routes;
