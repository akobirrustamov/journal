import MainDashboardSuper from "views/superadmin/default";
import MainJournal from "views/superadmin/journal";


import {
  MdArticle,
  MdHome,
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
    name: "Jurnallar",
    layout: "/superadmin",
    path: "journals",
    icon: <MdArticle className="h-6 w-6" />,
    component: <MainJournal />,
  },
 
];
export default routes;
