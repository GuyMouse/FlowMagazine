import React, { useEffect, useState } from "react";
import {TextField} from "../../components/TextField"; 
import { useTranslation } from "react-i18next";
import { Course } from "models/Course";
import { Instructor } from "models/Instructor";
import "./GeneralInfoTab.scss";
import { createInstructor,getAllInstructors } from "../../services/Instructors";

interface GeneralInfoTabProps extends React.HTMLAttributes<HTMLDivElement> {
    isEditable: boolean;
    setCourse?: (course: Course) => void;
    currentCourse?: Course;
}

const GeneralInfoTab: React.FC<GeneralInfoTabProps> = ({
    isEditable,
    setCourse,
    currentCourse,
}) => {
    const { t } = useTranslation();
    const [instructors, setInstructors] = useState<Instructor[]>([]);



    useEffect(() => {
        const seedInstructors = async () => {
        
          
            const instructorsToCreate = [
                {
                    firstName: "Alloy",
                    lastName: "Hunter",
                },
                {
                    firstName: "klif",
                    lastName: "greybeard",

                },
            ];

            const savedInstructors: Instructor[] = [];
            
            for (const inst of instructorsToCreate) {
                try {
                    const saved = await createInstructor(inst);
                    console.log("Saved successfully:", saved);
                    savedInstructors.push(saved);
                } catch (err) {
                    console.error("Failed to save instructor:", inst.firstName, err);
                }
            }
            
        
            setInstructors(savedInstructors);
        };

        seedInstructors(); 

        // getAllInstructors().then((instructor)=>{
          
        //     setInstructors(instructor);

        // });


    }, []); 

    const editCourseKey = <K extends keyof Course>(key: K, value: Course[K]) => {
        if (isEditable && setCourse && currentCourse) {
            setCourse({ ...currentCourse, [key]: value });
        }
    };

    return (
        <div className="general-info-tab">
            <div className="tab-content-wrapper">
                
           
                <div className="form-row">
                    <label className="form-label" htmlFor="course-name">
                        {t("course.name") || "שם הקורס"}
                    </label>
                    <TextField
                        id="course-name"
                        name="name"
                        value={currentCourse?.name || ""}
                        onChange={(e: any) => editCourseKey("name", e.target.value)}
                        placeholder="הכנס שם קורס"
                        required
                        disabled={!isEditable}
                    />
                </div>

                
                <div className="form-row">
                    <label className="form-label" htmlFor="course-base">
                        {"בסיס"}
                    </label>
                    <TextField
                        id="course-base"
                        name="location"
                        value={currentCourse?.location || ""}
                        onChange={(e: any) => editCourseKey("location", e.target.value)}
                        placeholder="הכנס בסיס"
                        disabled={!isEditable}
                    />
                </div>

               
                <div className="form-row">
                    <label className="form-label" htmlFor="course-instructor">
                        {t("course.instructor_name") || "שם המדריך"}
                    </label>

                    <TextField
                        id="course-instructor"
                        name="instructorId"
                        value={currentCourse?.instructorId || ""}
                        onChange={(e: any) => editCourseKey("instructorId", e.target.value)}
                        placeholder="בחר מדריך"
                        disabled={!isEditable}
                        options={[
                            { label: "ללא מדריך", value: "" },
                            ...instructors.map((inst) => ({
                                label: `${inst.firstName} ${inst.lastName}`,
                                value: inst.id,
                            })),
                        ]}
                    />
                </div>
            </div>
        </div>
    );
};

export default GeneralInfoTab;