import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import MainPage from "../MainPage/MainPage";
import "./CoursePage.scss";
import { Button, SimpleConfirmPopup } from "components";
import { ReactComponent as ExportIcon } from "../../assets/icons/export.svg";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import {
  getCourseById,
  editCourse,
  deleteCourse,
} from "../../services/Courses";
import { Course, NEW_COURSE_TEMPLATE } from "../../models/Course";
import { StudyUnit } from "../../models/ContentManagement";
import { Student } from "../../models/Student";
import GeneralInfoTab from "../../components/CourseTabs/GeneralInfoTab";
import StudyContentTab from "../../components/CourseTabs/StudyContentTab";
import StudentsTab from "../../components/CourseTabs/StudentsTab";
import { TABS_IDS } from "hooks/NavBar.hook";
import { Tabs } from "../../components/Tabs";

const CoursePage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  let params = useParams();
  let courseId = params.courseid;
  const [course, setCourse] = useState<Course>(NEW_COURSE_TEMPLATE);
  //   console.log(" course id", courseId);
  const isEditable = location.state?.isEditable;
  const [currentTabIndex, setCurrentTabIndex] = useState(0);
  const [showPopup, setShowPopup] = useState(false);

  const tabs = [
    { id: "general", title: "מידע כללי", Component: GeneralInfoTab },
    { id: "study", title: "תכנים לימודיים", Component: StudyContentTab },
    { id: "students", title: "תלמידים", Component: StudentsTab },
  ];

  const currentTab = tabs[currentTabIndex];

  const handleGetCourse = (): void => {
    getCourseById(courseId)
      .then((course) => {
        if (!course) {
          console.error("course not found:", courseId);
          setLoading(false);
          return;
        }

        setCourse(course);
      })
      .catch((err) => {
        console.error("failed to load course for editing:", err);
        setLoading(false);
      });

    setLoading(false);
  };
  useEffect(() => {
    handleGetCourse();
  }, [courseId]);

  useEffect(() => {
    console.log("this is the course we get - ", course);
  }, [course]);

  const handleDeleteCourse = async () => {
    try {
      if (!courseId) return;
      await deleteCourse(courseId);
      navigate(`/${TABS_IDS.COURSES}`);
      console.log("קורס נמחק בהצלחה");
    } catch (error) {
      console.error("שגיאה במחיקת הקורס", error);
    }
  };
  const handleSaveCourse = async () => {
    try {
      const { id, students, ...courseData } = course;
      console.log(course);
      await editCourse(courseId, {
        ...courseData,
        studentIds: course.studentIds ?? [],
      });
      navigate(`/${TABS_IDS.COURSES}`);
      console.log("קורס עודכן בהצלחה");
    } catch (error) {
      console.error("שגיאה בעדכון הקורס", error);
    }
  };

  const renderTabs = () => {
    if (currentTab.id === "study") {
      return (
        <StudyContentTab
          setCourse={setCourse}
          currentCourse={course}
          initialStudyUnits={course.studyUnits}
          isEditable={isEditable || false}
        />
      );
    }
    if (currentTab.id === "students") {
      return (
        <StudentsTab
          setCourse={setCourse}
          course={course}
          initialStudents={course.students}
          isEditable={isEditable || false}
        />
      );
    }

    return (
      <GeneralInfoTab
        currentCourse={course}
        setCourse={setCourse}
        isEditable={isEditable || false}
      />
    );
  };

  if (loading) {
    return (
      <MainPage>
        <div className="course">
          <div className="course--wrapper">
            <p>טוען נתוני קורס...</p>
          </div>
        </div>
      </MainPage>
    );
  }

  const isSaveDisabled = !course.name || course.name.trim() === "";
  return (
    <MainPage>
      <div className="course">
        <div className="course--wrapper">
          <div className="course--head">
            <div className="bread-crumbs-container"></div>
            <div className="buttons-container">
              <div className="actions-buttons">
                {isEditable && (
                  <>
                    <Button
                      variant="danger"
                      className="delete"
                      onClick={() => setShowPopup(true)}
                    >
                      <span>מחק</span>
                    </Button>
                    <Button
                      className="save-course"
                      variant="primary"
                      disabled={isSaveDisabled}
                      onClick={handleSaveCourse}
                    >
                      <span>שמור קורס</span>
                    </Button>
                  </>
                )}
              </div>
              <div className="export-buttons">
                <Button
                  variant="primary"
                  onClick={async () => {
                    const el = document.getElementById("course--body");
                    if (!el) return;
                    const canvas = await html2canvas(el, {
                      scale: 2,
                      backgroundColor: "#FFFFFF",
                    });
                    const data = canvas.toDataURL("image/png");
                    const doc = new jsPDF({
                      orientation: "portrait",
                      unit: "mm",
                      format: "a4",
                    });
                    const pdfWidth = doc.internal.pageSize.getWidth();
                    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
                    doc.addImage(data, "PNG", 0, 0, pdfWidth, pdfHeight);
                    doc.save("קורס.pdf");
                  }}
                >
                  <ExportIcon className="export-icon" />
                  <span>ייצא קובץ PDF</span>
                </Button>
              </div>
            </div>
          </div>

          <div className="course--body" id="course--body">
            <Tabs
              tabs={tabs}
              activeTab={currentTab.id}
              handleTabClick={setCurrentTabIndex}
            />
            <div className="tab-content">{renderTabs()}</div>
          </div>
        </div>
      </div>
      <SimpleConfirmPopup
        show={showPopup}
        message="האם אתה בטוח שברצונך למחוק את הקורס?"
        onConfirm={handleDeleteCourse}
        onCancel={() => setShowPopup(false)}
        confirmText="מחק"
        cancelText="ביטול"
        type="warning"
      />
    </MainPage>
  );
};

export default CoursePage;
