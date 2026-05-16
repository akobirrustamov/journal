import MainDashboardSuper from "views/superadmin/default";
import SuperAdminProfile from "views/superadmin/profile";
import SuperAdminUsers from "views/superadmin/users";

import {
  MdHome,
} from "react-icons/md";

const routes = [
  {
    name: "Bosh sahifa",
    layout: "/rektor",
    path: "default",
    icon: <MdHome className="h-6 w-6" />,
    component: <MainDashboardSuper />,
  },
 
];
export default routes;
