import EditorDashboard from "views/editor/default";
import SuperAdminArticles from "views/superadmin/articles";
import SuperAdminIssues from "views/superadmin/issues";
import SuperAdminReviews from "views/superadmin/reviews";
import SuperAdminProfile from "views/superadmin/profile";
import { MdHome, MdArticle, MdLibraryBooks, MdRateReview, MdPerson } from "react-icons/md";

const routes = [
  {
    name: "Bosh sahifa",
    layout: "/editor",
    path: "default",
    icon: <MdHome className="h-6 w-6" />,
    component: <EditorDashboard />,
  },
  {
    name: "Maqolalar",
    layout: "/editor",
    path: "articles",
    icon: <MdArticle className="h-6 w-6" />,
    component: <SuperAdminArticles />,
  },
  {
    name: "Sonlar",
    layout: "/editor",
    path: "issues",
    icon: <MdLibraryBooks className="h-6 w-6" />,
    component: <SuperAdminIssues />,
  },
  {
    name: "Retsenziyalar",
    layout: "/editor",
    path: "reviews",
    icon: <MdRateReview className="h-6 w-6" />,
    component: <SuperAdminReviews />,
  },
  {
    name: "Profil",
    layout: "/editor",
    path: "profile",
    icon: <MdPerson className="h-6 w-6" />,
    component: <SuperAdminProfile />,
  },
];

export default routes;
