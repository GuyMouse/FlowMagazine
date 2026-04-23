import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Course } from "models/Course";
import BaseGrid from "../BaseGrid/BaseGrid";
import { Button } from "components";
import { ReactComponent as SearchIcon } from "assets/icons/search.svg";
import { ReactComponent as AddCircleIcon } from "../../assets/icons/Add_Circle.svg";
import { ReactComponent as PlayIcon } from "../../assets/icons/PlayIcon.svg";
import { ReactComponent as EditIcon } from "../../assets/icons/EditIcon.svg";
import { ReactComponent as ContentCopyIcon } from "../../assets/icons/content_copy.svg";
import { ReactComponent as DeleteIcon } from "../../assets/icons/delete.svg";
import "./StudyContentTab.scss";
import { Lesson, StudyUnit } from "../../models/ContentManagement";
import { createStudyUnit, deleteStudyUnit, updateStudyUnit } from "../../services/ContentManagement";
import { getFlowHub } from "../../services/Socket";

import NewContentPopup from "components/NewContentPopup/NewContentPopup";

export const DEFAULT_NUMBER_OF_STATIONS = 10;


interface StudyContentTabProps extends React.HTMLAttributes<HTMLDivElement> {
    isEditable?: boolean;
    setCourse: (course: Course) => void;
    currentCourse: Course;
    initialStudyUnits?: StudyUnit[];
}

const StudyContentTab: React.FC<StudyContentTabProps> = ({
    setCourse,
    isEditable,
    currentCourse,
    initialStudyUnits,
}) => {
    const navigate = useNavigate();
    const [searchText, setSearchText] = useState("");
    const [showPopup, setShowPopup] = useState(false);
    const [studyUnits, setStudyUnits] = useState<StudyUnit[]>(initialStudyUnits ?? []);
    const [addedLessonIds, setAddedLessonIds] = useState<Set<string>>(new Set());
    const [studyUnit, setStudyUnit] = useState<any>(null);
    // const [training, setTraining] = useState<any>(null);

    // edit mode: which StudyUnit is being edited (null = add mode)
    const [editingUnit, setEditingUnit] = useState<StudyUnit | null>(null);
    const studyUnitColumns = [
        { head: "שם השיעור", key: "title" as keyof StudyUnit },
        { head: "מטרת השיעור", key: "description" as keyof StudyUnit },
        {
            head: "פעולות",
            render: (unit: StudyUnit) => (
                <div className="grid-actions">

                    {!isEditable && (
                        <Button variant="primary" startIcon={<PlayIcon />} onClick={async () => {
                            if (!currentCourse.id) return;
                            setStudyUnit(unit);
                            const hub = getFlowHub();
                            try {
                                await hub.start();
                            } catch (err) {
                                console.error("Flow hub start failed:", err);
                                return;
                            }
                            const unregister = hub.trainingConnectionRegistered(() => {
                                unregister();
                                navigate(`/running-lesson/${currentCourse.id}`, {
                                    state: { courseId: currentCourse.id, studyUnit: unit },
                                });
                            });
                            hub.connectionRejected((payload: { Message?: string }) => {
                                unregister();
                                console.error("Flow connection rejected:", payload?.Message);
                                alert(`Connection rejected: ${payload?.Message ?? "Unknown error"}`);
                            });
                            try {
                                await hub.registerTrainingConnection({
                                    OwnerId: "",
                                    IsStation: false,
                                    StudyUnitId: unit.id,
                                    NumberOfStations: DEFAULT_NUMBER_OF_STATIONS,
                                });
                            } catch (err) {
                                console.error("Start flow training failed:", err);
                                unregister();
                            }
                        }}

                        >
                            <span>הרץ</span>
                        </Button>
                    )}
                    {isEditable &&
                        (<button onClick={() => {
                            setEditingUnit(unit);
                            setShowPopup(true);
                        }}
                        ><EditIcon /></button>

                        )}

                    {isEditable &&
                        (<button onClick={async () => {
                            if (!currentCourse.id) {
                                alert("יש לשמור את הקורס לפני שכפול תכנים");
                                return;
                            }
                            try {
                                const copy = await createStudyUnit(unit.title, unit.description, unit.taskIds, String(currentCourse.id));
                                const updatedUnits = [...studyUnits, copy];
                                setStudyUnits(updatedUnits);
                                updateCourseStudyUnitIds(updatedUnits);
                            } catch (err) {
                                console.error("failed to duplicate StudyUnit:", err);
                            }
                        }}

                        >

                            <ContentCopyIcon /></button>
                        )}

                    {isEditable &&
                        (<button onClick={() => {
                            const updatedUnits = studyUnits.filter((u) => u.id !== unit.id);
                            setStudyUnits(updatedUnits);
                            updateCourseStudyUnitIds(updatedUnits);
                            deleteStudyUnit(unit.id).catch((err) =>
                                console.error("failed to delete StudyUnit:", err)
                            );
                        }}
                            style={{ display: isEditable ? 'block' : 'none' }}
                        >
                            <DeleteIcon /></button>
                        )}
                </div>
            ),
        },
    ];

    const updateCourseStudyUnitIds = (units: StudyUnit[]) => {
        setCourse({
            ...currentCourse,
            studyUnitIds: units.map((u) => u.id),
        });
    };

    const filteredStudyUnits = studyUnits.filter((unit: StudyUnit) => {
        return unit.title.includes(searchText) || unit.description?.includes(searchText);
    })


    // creates a StudyUnit in the DB for each selected lesson, then adds them to the grid
    const handleSelect = async (lessons: Lesson[]) => {
        if (!currentCourse.id) {
            alert("יש לשמור את הקורס לפני הוספת תכנים לימודיים");
            return;
        }

        // Filter out lessons that have already been added (by lesson ID)
        const newLessons = lessons.filter((l) => !addedLessonIds.has(l.id));

        if (newLessons.length === 0) {
            return; // All lessons already added
        }

        // create StudyUnits in parallel and collect the results
        // Include task IDs from the lesson
        const created = await Promise.all(
            newLessons.map(async (lesson) => {
                // Get task IDs from the lesson (they should be string IDs)
                const taskIds = (lesson.tasks ?? []).filter((id): id is string => typeof id === 'string' && id !== '');
                const studyUnit = await createStudyUnit(lesson.title, lesson.description, taskIds, String(currentCourse.id));
                // Preserve the description on the frontend since backend doesn't save it
                return {
                    ...studyUnit,
                    description: lesson.description
                };
            })
        );

        // console.log("created StudyUnits:", created);
        const updatedUnits = [...studyUnits, ...created];
        setStudyUnits(updatedUnits);

        // Update the set of added lesson IDs
        setAddedLessonIds((prev) => {
            const next = new Set(prev);
            newLessons.forEach(lesson => next.add(lesson.id));
            return next;
        });

        // sync the IDs into currentCourse so they get saved with the course
        updateCourseStudyUnitIds(updatedUnits);
    };

    const handlePopupClose = () => {
        setShowPopup(false);
        setEditingUnit(null);
    };

    const handlePopupConfirm = async (lessons: Lesson[]) => {
        if (editingUnit) {
            // Edit mode: update the existing StudyUnit
            // Get all task IDs from selected lessons
            const allTaskIds = lessons.flatMap(lesson =>
                (lesson.tasks ?? []).filter((id): id is string => typeof id === 'string' && id !== '')
            );

            try {
                const updated = await updateStudyUnit(editingUnit.id, editingUnit.title, allTaskIds, editingUnit.description);
                if (updated) {
                    const updatedUnits = studyUnits.map(u => u.id === editingUnit.id ? updated : u).filter((u): u is StudyUnit => u !== null);
                    setStudyUnits(updatedUnits);
                    updateCourseStudyUnitIds(updatedUnits);
                }
            } catch (err) {
                console.error("failed to update StudyUnit:", err);
            }
        } else {
            // Add mode: create new StudyUnits
            await handleSelect(lessons);
        }
        handlePopupClose();
    };

    return (
        <div className="study-content-tab">
            <div className="tab-content-wrapper">
                <div className="content-actions">
                    <div className="search-bar">
                        <SearchIcon className="search-icon" />
                        <input
                            className="search"
                            placeholder="חיפוש"
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                        />
                    </div>
                    <Button
                        variant="primary"
                        onClick={() => {
                            setEditingUnit(null);
                            setShowPopup(true);
                        }}
                        disabled={!isEditable}
                        startIcon={<AddCircleIcon />}
                    >
                        הוספת תכנים
                    </Button>
                </div>
                <div className="content-area">
                    {studyUnits.length > 0 && (
                        <BaseGrid columns={studyUnitColumns} data={filteredStudyUnits} showSortIcon={true}/>
                    )}
                </div>
            </div>


            {showPopup &&

                <NewContentPopup
                    show={showPopup}
                    onClose={handlePopupClose}
                    onSelect={handlePopupConfirm}
                    editTaskIds={editingUnit?.taskIds}
                />}
        </div>
    );
};

export default StudyContentTab;
