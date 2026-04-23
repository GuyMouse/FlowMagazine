import React, {
  createContext,
  FC,
  ReactComponentElement,
  ReactNode,
  useContext,
  useState,
} from "react";
import {
  Courses,
  StudentLogin,
  CoursePage,
  ContentBuilder,
  SystemManagement,
  /* ContentManagement, */ ApprenticeFile,
  AddCoursePage,
  TrainingPage,
  RunningLesson,
} from "pages";
// ========== NewContentPopup – זמני ==========
// import + טאב + route נוספו לבדיקת NewContentPopup. להסיר כשה-popup משולב במקום הסופי.
// =============================================

import { useLocation, useNavigate } from "react-router-dom";
import { getDefaultTab } from "../helpers/navbar.helpers";
import { ReactComponent as NavbarIconCourses } from "../assets/icons/NavbarIcon-Courses.svg";
import { ReactComponent as NavbarIconContentBuilder } from "../assets/icons/NavbarIcon-ContentBuilder.svg";
import { ReactComponent as NavbarIconSystemManagement } from "../assets/icons/NavbarIcon-SystemManagement.svg";
import { NewTrainigPage } from "pages/TrainingPage";

export const TABS_IDS = {
  COURSES: "Courses",
  TRAININGS: "Trainings",
  CONTENTMANAGEMENT: "Content Management",
  SYSTEMMANAGEMENT: "System Management",
  APPRENTICEFILE: "ApprenticeFile",
  ContentBuilder: "ContentBuilder",
  NewContentPopup: "NewContentPopup", // ========== זמני – לבדיקת NewContentPopup, להסיר ==========
  TrainingPage: "TrainingPage",

  StudentLogin: "StudentLogin",
};

export const ROUTES_IDS = {
  COURSE: "Course",
  ADD_COURSE: "AddCourse",
  EDIT_COURSE: "EditCourse",
};

export interface Route {
  id: (typeof TABS_IDS)[keyof typeof TABS_IDS];
  routes: string[];
  component: React.FC;
  icon?: ReactNode;
}

export interface Tab extends Route {
  title: string;
}

interface NavBarContextType {
  currentTab: Tab;
  setCurrentTab: (tab: Tab) => void;
}

export const NAV_BAR_OPTIONS: Tab[] = [
  {
    id: TABS_IDS.COURSES,
    routes: ["/", `/${TABS_IDS.COURSES.toLocaleLowerCase()}`],
    title: "קורסים",
    component: Courses,
    icon: <NavbarIconCourses />,
  },
  {
    id: TABS_IDS.ContentBuilder,
    routes: [
      `/${TABS_IDS.ContentBuilder.toLocaleLowerCase().replace(/ /g, "")}`,
    ],
    title: "ניהול תוכן",
    component: ContentBuilder,
    icon: <NavbarIconContentBuilder />,
  },
  {
    id: TABS_IDS.SYSTEMMANAGEMENT,
    routes: [
      `/${TABS_IDS.SYSTEMMANAGEMENT.toLocaleLowerCase().replace(/ /g, "")}`,
    ],
    title: "ניהול מערכת",
    component: SystemManagement,
    icon: <NavbarIconSystemManagement />,
  },
  // ========== NewContentPopup – טאב זמני ==========
  // נוסף לבדיקת NewContentPopup. להסיר כשה-popup משולב במקום הסופי.
  // ================================================
];

export const ROUTE_OPTIONS: Route[] = [
  {
    id: "CoursePage",
    routes: [`/${ROUTES_IDS.COURSE.toLowerCase()}/:courseId`],
    component: CoursePage,
  },
  {
    id: "EditCourse",
    routes: [`/${ROUTES_IDS.EDIT_COURSE.toLowerCase()}/:courseId`],
    component: CoursePage,
  },
  {
    id: "AddCourse",
    routes: [`/${ROUTES_IDS.ADD_COURSE.toLowerCase()}`],
    component: AddCoursePage,
  },
  // {
  //     id: "SystemManagement",
  //     routes: [`/${ROUTES_IDS.SYSTEMMANAGEMENT.toLowerCase()}`],
  //     component: EditCoursePage,
  // },
  {
    id: TABS_IDS.TrainingPage,
    routes: ["/trainingpage"],
    component: TrainingPage,
  },
  {
    id: TABS_IDS.APPRENTICEFILE,
    routes: ["/apprenticefile"],
    component: ApprenticeFile,
  },
  {
    id: "RunningLesson",
    routes: ["/running-lesson/:courseId"],
    component: RunningLesson,
  },
];

const defaultNavBarContext: NavBarContextType = {
  currentTab: NAV_BAR_OPTIONS[0],
  setCurrentTab: () => {},
};

const NavBarContext = createContext<NavBarContextType>(defaultNavBarContext);

interface NavBarProviderProps {
  children?: ReactNode;
}

export const NavBarProvider: FC<NavBarProviderProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentTab, setCurrentTabState] = useState<Tab>(
    getDefaultTab(location.pathname),
  );

  const setCurrentTab = (tab: Tab, data?: any) => {
    setCurrentTabState(tab);
    const route = tab.routes[0];

    navigate(route, { state: { tableData: data } });
    window.scrollTo(0, 0);
  };

  return (
    <NavBarContext.Provider value={{ currentTab, setCurrentTab }}>
      {children}
    </NavBarContext.Provider>
  );
};

export const useNavBar = () => {
  const context = useContext(NavBarContext);
  if (context === undefined) {
    throw new Error("useNavBar must be used within a NavBarProvider");
  }
  return context;
};

export default NavBarContext;
