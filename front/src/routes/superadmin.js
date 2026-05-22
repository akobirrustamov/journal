import MainDashboardSuper from "views/superadmin/default";
import SuperAdminProfile from "views/superadmin/profile";
import SuperAdminUsers from "views/superadmin/users";
import SuperAdminJournals from "views/superadmin/journals";
import SuperAdminArticles from "views/superadmin/articles";
import SuperAdminIssues from "views/superadmin/issues";
import SuperAdminReviews from "views/superadmin/reviews";

import {
  MdArticle,
  MdHome,
  MdPerson,
  MdGroup,
  MdMenuBook,
  MdLibraryBooks,
  MdRateReview,
} from "react-icons/md";

const routes = [
  {
    name: "Bosh sahifa",
    layout: "/superadmin",
    path: "default",
    icon: <MdHome className="h-6 w-6" />,
    component: <MainDashboardSuper />,
  },
  {
    name: "Xodimlar",
    layout: "/superadmin",
    path: "users",
    icon: <MdGroup className="h-6 w-6" />,
    component: <SuperAdminUsers />,
  },
  {
    name: "Jurnallar",
    layout: "/superadmin",
    path: "journals",
    icon: <MdMenuBook className="h-6 w-6" />,
    component: <SuperAdminJournals />,
  },
  {
    name: "Sonlar",
    layout: "/superadmin",
    path: "issues",
    icon: <MdLibraryBooks className="h-6 w-6" />,
    component: <SuperAdminIssues />,
  },
  {
    name: "Maqolalar",
    layout: "/superadmin",
    path: "articles",
    icon: <MdArticle className="h-6 w-6" />,
    component: <SuperAdminArticles />,
  },
  {
    name: "Retsenziyalar",
    layout: "/superadmin",
    path: "reviews",
    icon: <MdRateReview className="h-6 w-6" />,
    component: <SuperAdminReviews />,
  },
  {
    name: "Profile",
    layout: "/superadmin",
    path: "profile",
    icon: <MdPerson className="h-6 w-6" />,
    component: <SuperAdminProfile />,
  },
];
export default routes;
