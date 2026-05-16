import MainDashboardSuper from "views/superadmin/default";
import SuperAdminProfile from "views/superadmin/profile";
import SuperAdminUsers from "views/superadmin/users";
import SuperAdminJournals from "views/superadmin/journals";
import SuperAdminArticles from "views/superadmin/articles";
import { Student } from "../views/superadmin/student";
import { Month } from "../views/superadmin/month";
import { MonthDetail } from "../views/superadmin/month/MonthDetail"
import StudentMonthDetails from "../views/superadmin/student-month-details";
import { StudentMonthPlans } from "../views/superadmin/student/StudentMonthPlans";
import RejaTekshirish from "views/shared/reja-tekshirish";
import StudentPlanTekshirish from "views/shared/reja-tekshirish/StudentPlanTekshirish";
import Statistics from "views/shared/statistics";

import {
  MdHome,
  MdPerson,
  MdGroup,
  MdOutlineCalendarToday,
  MdSchool,
  MdAssignmentTurnedIn,
  MdBarChart,
  MdMenuBook,
  MdArticle,
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
    name: "Doktorantlar",
    layout: "/superadmin",
    path: "students",
    icon: <MdSchool className="h-6 w-6" />,
    component: <Student />,
  },
  {
    name: "Talaba oylik statistikasi",
    layout: "/superadmin",
    path: "student/:studentId/month/:monthId",
    icon: <MdSchool className="h-6 w-6" />,
    component: <StudentMonthDetails />,
    hidden: true,
  },
  {
    name: "Talaba oylik rejalari",
    layout: "/superadmin",
    path: "student/plans/:studentId/month/:monthId",
    icon: <MdSchool className="h-6 w-6" />,
    component: <StudentMonthPlans />,
    hidden: true,
  },
  // {
  //   name: "Oy Yaratish",
  //   layout: "/superadmin",
  //   path: "month",
  //   icon: <MdOutlineCalendarToday className="h-6 w-6" />,
  //   component: <Month />,
  // },
  {
    name: "Oy detail",
    layout: "/superadmin",
    path: "month/:monthId",
    icon: <MdOutlineCalendarToday className="h-6 w-6" />,
    component: <MonthDetail />,
    hidden: true,
  },
  {
    name: "Hisobot ko'rish",
    layout: "/superadmin",
    path: "statistics",
    icon: <MdBarChart className="h-6 w-6" />,
    component: <Statistics />,
  },
  // {
  //   name: "Reja tekshirish",
  //   layout: "/superadmin",
  //   path: "reja-tekshirish",
  //   icon: <MdAssignmentTurnedIn className="h-6 w-6" />,
  //   component: <RejaTekshirish />,
  // },
  {
    name: "Shaxsiy rejalar tekshirish",
    layout: "/superadmin",
    path: "student-plan-tekshirish",
    icon: <MdAssignmentTurnedIn className="h-6 w-6" />,
    component: <StudentPlanTekshirish />,
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
