import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ReactComponent as CardsViewIcon } from "../../assets/icons/CardsViewIcon.svg";
import { ReactComponent as GridViewIcon } from "../../assets/icons/GridViewIcon.svg";
import { Course, NEW_COURSE_TEMPLATE } from "models";
import { Instructor } from "../../models/Instructor";
import { Student } from "../../models/Student";
import BaseGrid from "../../components/BaseGrid/BaseGrid";
import "./courses.scss";
import MainPage from "../MainPage/MainPage";
import { ROUTES_IDS } from "hooks/NavBar.hook";
import { useTranslation } from "react-i18next";
import { CustomCourseCard } from "components/CustomCourseCard";
import CoursesActions from "components/CoursesActions/CoursesActions";
import Button from "../../components/Button/Button";
import { deleteCourse as deleteCourseService } from "../../services/Courses";
import { SimplePopup, SimpleConfirmPopup } from "../../components/SimplePopup";
import { ReactComponent as HomeIcon } from "../../assets/icons/home.svg";
import { ReactComponent as EditIcon } from "../../assets/icons/EditIcon.svg";
import { ReactComponent as ContentCopyIcon } from "../../assets/icons/content_copy.svg";
import { ReactComponent as DeleteIcon } from "../../assets/icons/delete.svg";
import { StudyUnit, Lesson } from "../../models/ContentManagement";
import { createCourse, getAllCourses } from "../../services/Courses";
import { StatusIndicator } from "../../components/StatusIndicator";

const Courses: React.FC = () => {
  const navigate = useNavigate();

  const { t } = useTranslation();
  const [allCourses, setAllCourses] = useState<Course[]>([]);

  // const coursesFromApi = (allCourses ?? []).map(toCourseData);
  const [activeView, setActiveView] = useState<string>("grid");
  /// when a course is entered (כניסה לקורס), we show its StudyUnits
  const [enteredCourseId, setEnteredCourseId] = useState<string | null>(null);
  const [courseStudyUnits, setCourseStudyUnits] = useState<StudyUnit[]>([]);
  const [enteredCourse, setEnteredCourse] = useState<Course>();
  // edit StudyUnit popup state

  useEffect(() => {
    getAllCourses().then((courses) => {
      setAllCourses(courses);
    });
  }, []);

  // when a course is entered, fetch its StudyUnits from DB
  useEffect(() => {
    if (!enteredCourseId) {
      setCourseStudyUnits([]);
      setEnteredCourse(NEW_COURSE_TEMPLATE);
      return;
    }

    // fetch the course to get its studyUnitsIds, then fetch all StudyUnits and filter
    // Also fetch all lessons to get descriptions

    // const enteredCourse =
    setEnteredCourse(
      allCourses.find((course) => course.id === enteredCourseId) || undefined,
    );
    const studyunits = enteredCourse?.studyUnits ?? [];
    setCourseStudyUnits(studyunits);
  }, [enteredCourseId, allCourses]);

  /// filter state for instructor select, status select, and search input
  const [selectedInstructor, setSelectedInstructor] = useState<string>("");
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [searchText, setSearchText] = useState<string>("");

  // Popup states
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");
  const [popupType, setPopupType] = useState<
    "info" | "error" | "warning" | "success"
  >("info");
  const [showConfirmPopup, setShowConfirmPopup] = useState(false);
  const [confirmCallback, setConfirmCallback] = useState<(() => void) | null>(
    null,
  );

  /// filter courses based on the selected filters and search text
  const filteredCourses = allCourses.filter((course) => {
    const matchesInstructor =
      selectedInstructor === "" || course.instructor === selectedInstructor;
    const matchesStatus =
      selectedStatus === "" || course.status === selectedStatus;
    const matchesSearch =
      searchText === "" ||
      course.name.includes(searchText) ||
      course.instructor.includes(searchText) ||
      course.location?.includes(searchText) ||
      course.status.includes(searchText);
    return matchesInstructor && matchesStatus && matchesSearch;
  });

  const handleViewClick = (viewType: string) => {
    setActiveView(viewType);
  };

  const handleDeleteCourse = async (courseId: string) => {
    setConfirmCallback(() => async () => {
      try {
        await deleteCourseService(courseId);
        // Refresh the courses list after deletion
        getAllCourses().then((courses) => {
          setAllCourses(courses);
        });
        setShowConfirmPopup(false);
        setPopupMessage("הקורס נמחק בהצלחה");
        setPopupType("success");
        setShowPopup(true);
      } catch (error) {
        console.error("שגיאה במחיקת הקורס", error);
        setShowConfirmPopup(false);
        setPopupMessage("שגיאה במחיקת הקורס");
        setPopupType("error");
        setShowPopup(true);
      }
    });
    setShowConfirmPopup(true);
  };
  // column definitions for the "manage" courses grid (all action buttons)
  const courseColums = [
    { head: "שם קורס", key: "name" as keyof Course },
    {
      head: "סטטוס",
      key: "status" as keyof Course,
      render: (c: Course) => <StatusIndicator status={c.status} />,
    },
    { head: "בסיס", key: "baseName" as keyof Course },
    { head: "מדריך", key: "instructor" as keyof Course },
    { head: "מספר תלמידים", key: "studentsCount" as keyof Course },
    {
      head: "פעולות",
      render: (course: Course) => (
        <div className="grid-actions">
          <Button
            variant="primary"
            startIcon={<HomeIcon />}
            onClick={() =>
              navigate(`/${ROUTES_IDS.COURSE.toLowerCase()}/${course.id}`)
            }
          >
            <span>כניסה לקורס</span>
          </Button>
          <button
            onClick={() =>
              navigate(
                `/${ROUTES_IDS.EDIT_COURSE.toLowerCase()}/${course.id}`,
                {
                  state: { isEditable: true },
                },
              )
            }
          >
            <EditIcon />
          </button>
          <button
            onClick={async () => {
              if (!course) return;
              // duplicate the course in DB – first create the course shell, then study units with its ID
              //   const newCourse = (await createCourse({
              //     name: course.name + " (העתק)",
              //     status: course.status as any,
              //     location: course.location,
              //     studyUnitIds: course.studyUnitIds,
              //     instructorId: course.instructorId,
              //     studentIds: course.studentIds,
              //   })) as Course;
              // }}
              (await createCourse({
                id: course.id,
                name: course.name + " (העתק)",
                trainingIds: course.trainingIds,
                instructor: course.instructor,
                status: course.status,
                students: course.students,
                location: course.location,
                studyUnitIds: course.studyUnitIds,
                instructorId: course.instructorId,
                studentIds: course.studentIds,
              })) as Course;
            }}
          >
            <ContentCopyIcon />
          </button>
          <button onClick={() => handleDeleteCourse(course.id)}>
            <DeleteIcon />
          </button>
        </div>
      ),
    },
  ];

  return (
    <MainPage>
      <div className="courses-page">
        <div className="courses-page--wrapper">
          <CoursesActions
            coursesData={allCourses}
            searchText={searchText}
            selectedInstructor={selectedInstructor}
            selectedStatus={selectedStatus}
            onSearchChange={setSearchText}
            onInstructorChange={setSelectedInstructor}
            onStatusChange={setSelectedStatus}
          />
          <hr className="grey-line"></hr>
          <div className="courses-view-filter">
            <div className="button-wrapper">
              <Button
                startIcon={<GridViewIcon />}
                onClick={() => handleViewClick("grid")}
                customClass={`button ${activeView === "grid" ? "active" : ""}`}
              />
            </div>
            <div className="button-wrapper">
              <Button
                startIcon={<CardsViewIcon />}
                onClick={() => handleViewClick("cards")}
                customClass={`button ${activeView === "cards" ? "active" : ""}`}
              />
            </div>
          </div>
          <div
            className={`courses${activeView === "cards" ? " has-cards" : ""}`}
          >
            {activeView === "cards" ? (
              filteredCourses.map((course) => (
                <CustomCourseCard
                  key={course.id}
                  course={{
                    ...course /* , studentsCount: course.students.length */,
                  }}
                  onDeleteCourse={handleDeleteCourse}
                />
              ))
            ) : (
              <BaseGrid
                columns={courseColums}
                data={filteredCourses}
                showSortIcon={true}
              />
            )}
          </div>
        </div>
      </div>

      <SimplePopup
        show={showPopup}
        message={popupMessage}
        type={popupType}
        onClose={() => setShowPopup(false)}
      />

      <SimpleConfirmPopup
        show={showConfirmPopup}
        message="האם אתה בטוח שברצונך למחוק את הקורס?"
        onConfirm={() => {
          if (confirmCallback) {
            confirmCallback();
          }
        }}
        onCancel={() => {
          setShowConfirmPopup(false);
          setConfirmCallback(null);
        }}
        confirmText="מחק"
        cancelText="ביטול"
        type="warning"
      />
    </MainPage>
  );
};

export default Courses;
