import MainDashboardSuper from "views/superadmin/default";
import SuperAdminProfile from "views/superadmin/profile";
import SuperAdminUsers from "views/superadmin/users";
import SuperAdminJournals from "views/superadmin/journals";
import SuperAdminArticles from "views/superadmin/articles";

import {
  MdArticle,
  MdHome,
  MdPerson,
  MdGroup,
  MdMenuBook,
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
    name: "Maqolalar",
    layout: "/superadmin",
    path: "articles",
    icon: <MdArticle className="h-6 w-6" />,
    component: <SuperAdminArticles />,
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
