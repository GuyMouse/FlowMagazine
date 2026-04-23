import React, {
  createContext,
  FC,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { Course, CourseMode, NEW_COURSE_TEMPLATE } from "models";
import { getAllCourses } from "services/Courses";

interface CourseContextType {
  allCourses: Course[] | null;
  currentCourse: Course | null;
  setCurrentCourse: (a: Course) => void;
  clearCurrentCourse: () => void;
  createNewCourse: () => void;

  courseMode: CourseMode | null;
  setCourseMode: (a: CourseMode) => void;
  fetchCourses: () => void;

  loading: boolean;
  error: Error | null;
}

const defaultCourseContext: CourseContextType = {
  allCourses: null,
  currentCourse: null,
  courseMode: null,
  loading: true,
  error: null,
  setCurrentCourse: () => {},
  fetchCourses: () => {},
  clearCurrentCourse: () => {},
  createNewCourse: () => {},
  setCourseMode: () => {},
};

const CourseContext = createContext<CourseContextType>(defaultCourseContext);

interface courseProviderProps {
  children?: ReactNode;
}

export const CourseProvider: FC<courseProviderProps> = ({ children }) => {
  const [allCourses, setAllCourses] = useState<Course[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [currentCourse, setCurrentCourse] = useState<Course | null>(null);
  const [courseMode, setCourseMode] = useState<CourseMode | null>(null);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = useCallback(async () => {
    try {
      const data = await getAllCourses();
      setAllCourses(data);
    } catch (err) {
      if (err instanceof Error) {
        setError(err);
      } else {
        setError(new Error("An unexpected error occurred"));
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const clearCurrentCourse = () => setCurrentCourse(null);
  const createNewCourse = () => {
    setCourseMode("new");
    setCurrentCourse(NEW_COURSE_TEMPLATE);
  };

  return (
    <CourseContext.Provider
      value={{
        allCourses,
        currentCourse,
        setCurrentCourse,
        clearCurrentCourse,
        createNewCourse,
        fetchCourses,

        courseMode,
        setCourseMode,
        loading,
        error,
      }}
    >
      {children}
    </CourseContext.Provider>
  );
};

export const useCourse = () => {
  const context = useContext(CourseContext);
  if (context === undefined) {
    throw new Error("useCourse must be used within a CourseProvider");
  }
  return context;
};

export default CourseContext;
