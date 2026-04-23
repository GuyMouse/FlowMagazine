import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import Button from "../Button/Button";
import { translateCourseStatus } from "../../helpers/data.helpers";
import "./CustomCourseCard.scss";
import { ReactComponent as HomeIcon } from "../../assets/icons/home.svg";
import { ReactComponent as EditIcon } from "../../assets/icons/EditIcon.svg";
import { ReactComponent as ContentCopyIcon } from "../../assets/icons/content_copy.svg";
import { ReactComponent as DeleteIcon } from "../../assets/icons/delete.svg";
import {
  createCourse,
  getAllCourses,
  getCourseById,
} from "../../services/Courses";
import { Course } from "../../models/Course";
import { CourseStatus } from "../../models/Course";
import { ROUTES_IDS } from "hooks/NavBar.hook";
import { useNavigate } from "react-router-dom";

interface CustomCourseCardProps extends React.HTMLAttributes<HTMLDivElement> {
  course: Course;
  onDeleteCourse?: (courseId: string) => void;
}

const CustomCourseCard: React.FC<CustomCourseCardProps> = ({
  course,
  onDeleteCourse,
}) => {
  const navigate = useNavigate();
  //   const [isUpdated, setIsUpdated] = useState(course.status);
  // const statusupdate = isUpdated ? "completed" : "in-progress";
  const { t } = useTranslation();

  return (
    <div className="custom-course-card">
      <div
        className={`custom-course-card--status ${course.status.toLowerCase()}`}
      >
        <span className="status">{translateCourseStatus(course.status)}</span>
      </div>
      <div className="text-part">
        <div className="course-info">
          <span>בסיס</span>
          <span>שם קורס</span>
          <span>סטטוס</span>
          <span>מדריך</span>
          <span>מספר תלמידים</span>
        </div>
        <div className="course-data">
          <span className="base-name">{course.location}</span>
          <span className="course-name">{course.name}</span>
          <span className="course-status">
            {translateCourseStatus(course.status)}
          </span>
          <span className="instructor-name">
            {"ללא מדריך"}
            {/* {course.instructor ? course.instructor : "ללא מדריך"} */}
          </span>
          <span className="students-number">{course.students.length + 1}</span>
        </div>
      </div>
      <div className="buttons-part">
        <button
          className="delete-button"
          onClick={() => {
            if (onDeleteCourse) {
              onDeleteCourse(course.id);
            }
          }}
        >
          <DeleteIcon />
        </button>
        <button
          className="copy-button"
          onClick={async () => {
            try {
              const full = (await getCourseById(course.id)) as any;
              if (!full) return;
              console.log(full);
              await createCourse({
                id: full.id,
                name: full.name + " (העתק)",
                trainingIds: full.trainingIds,
                instructor: full.instructor,
                status: full.status ?? (course.status as CourseStatus),
                students: full.students,
                location: full.location,
                studyUnitIds: full.studyUnitIds,
                instructorId: full.instructorId,
                studentIds: full.studentIds,
              }) as Course;
              //   window.location.reload();
            } catch (err) {
              console.error("failed to duplicate course:", err);
            }
          }}
        >
          <ContentCopyIcon />
        </button>
        <button
          className="edit-button"
          onClick={() =>
            navigate(`/${ROUTES_IDS.EDIT_COURSE.toLowerCase()}/${course.id}`, {
              state: { isEditable: true },
            })
          }
        >
          <EditIcon />
        </button>
        <Button
          className="enter-to-course"
          onClick={() =>
            navigate(`/${ROUTES_IDS.COURSE.toLowerCase()}/${course.id}`)
          }
          startIcon={<HomeIcon />}
        >
          {"כניסה לקורס"}
        </Button>
      </div>
    </div>
  );
};
export default CustomCourseCard;
