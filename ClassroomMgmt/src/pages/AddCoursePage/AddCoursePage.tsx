import React, { useEffect, useState } from "react";
import MainPage from "../MainPage/MainPage";
import "./AddCoursePage.scss";
import { Button } from "components";
import { createCourse } from "../../services/Courses";
import { getStudentById, createStudent } from "../../services/Students";
import { Course, NEW_COURSE_TEMPLATE } from "../../models/Course";
import { Student } from "../../models/Student";
import GeneralInfoTab from "../../components/CourseTabs/GeneralInfoTab";
import StudyContentTab from "../../components/CourseTabs/StudyContentTab";
import StudentsTab from "../../components/CourseTabs/StudentsTab";
import { useNavigate } from "react-router-dom";
import { TABS_IDS } from "hooks/NavBar.hook";
import { Tabs } from "../../components/Tabs";
import { SimpleConfirmPopup } from "../../components/SimplePopup";

const AddCoursePage: React.FC = () => {
  const navigate = useNavigate();
  //   const [showPopup, setShowPopup] = useState(false);

  const tabs = [
    {
      id: "general",
      title: "מידע כללי",
      Component: GeneralInfoTab,
    },
    {
      id: "study",
      title: "תכנים לימודיים",
      Component: StudyContentTab,
    },
    {
      id: "students",
      title: "תלמידים",
      Component: StudentsTab,
    },
  ];

  const [currentTabIndex, setCurrentTabIndex] = useState(0);
  const currentTab = tabs[currentTabIndex];

  const [course, setCourse] = useState<Course>(
    JSON.parse(JSON.stringify(NEW_COURSE_TEMPLATE)),
  );

  const renderTabs = () => {
    if (currentTab.id === "study") {
      return (
        <StudyContentTab
          isEditable={true}
          setCourse={setCourse}
          currentCourse={course}
        />
      );
    }
    if (currentTab.id === "students") {
      return (
        <StudentsTab isEditable={true} setCourse={setCourse} course={course} />
      );
    }

    return (
      <GeneralInfoTab
        isEditable={true}
        currentCourse={course}
        setCourse={setCourse}
      />
    );
  };
  useEffect(() => {
    console.log("course", course);
  }, [course]);

  const isSaveDisabled = !course.name || course.name.trim() === "";

  const handleTabClick = (index: number) => {
    setCurrentTabIndex(index);
  };

  const checkExistingStudents = async (students: Student[]) => {
    students.forEach(async (student) => {
      const existingStudent = await getStudentById(String(student.id));

      if (!existingStudent) {
        try {
          await createStudent(student);
        } catch (e: any) {
          throw new Error("there's an error boi", e);
        }
      }
    });
  };

  const handleSaveCourse = async () => {
    try {
      if (course.students) {
        await checkExistingStudents(course.students);
      }
      const {
        name,
        status,
        instructor,
        instructorId,
        students,
        studyUnitIds,
        trainingIds,
      } = course;
      //   console.log("course  instructor here", course.instructor);
      await createCourse({
        name,
        status,
        // instructor,
        // instructorId = 'ewq123',
        students,
        studyUnitIds,
        trainingIds,
      } as Course);
      navigate(`/${TABS_IDS.COURSES}`);
      // console.log('courseData from add course page', courseData)
      console.log("קורס נשמר בהצלחה");
    } catch (error) {
      console.log("שגיאה בשמירת הקורס", error);
    }
  };

  return (
    <MainPage>
      <div className="course">
        <div className="course--wrapper">
          <div className="course--head">
            <div className="bread-crumbs-container"></div>
            <div className="buttons-container">
              <div className="actions-buttons">
                <Button
                  variant="danger"
                  className="delete"
                  onClick={() => {
                    navigate(`/${TABS_IDS.COURSES.toLowerCase()}`);
                  }}
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
              </div>
            </div>
          </div>

          <div className="course--body" id="course--body">
            <Tabs
              tabs={tabs}
              activeTab={currentTab.id}
              handleTabClick={handleTabClick}
            />
            <div className="tab-content">{renderTabs()}</div>
          </div>
          {/* <SimpleConfirmPopup
            showPopup={showPopup}
            setShowPopup={setShowPopup}
            confirmText="סטודנט קיים במערכת, אין אפשרות להוסיף את המניאק"
            type="error"
          /> */}
        </div>
      </div>
    </MainPage>
  );
};

export default AddCoursePage;
