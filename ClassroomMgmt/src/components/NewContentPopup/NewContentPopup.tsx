import React, { useState, useEffect } from "react";
import "./NewContetPopup.scss";
import { getAllSubjects } from "../../services/ContentManagement";
import { Subject, Lesson, TaskBase } from "../../models/ContentManagement";
import { ReactComponent as CloseIcon } from "../../assets/icons/close.svg";
import Button from "../Button/Button";
import { ReactComponent as SearchIcon } from "../../assets/icons/search.svg";

interface NewContetPopupProps {
    show: boolean;
    onClose: () => void;
    onSelect: (lessons: Lesson[]) => void;
    editTaskIds?: string[];
}

const NewContetPopup: React.FC<NewContetPopupProps> = ({ show, onClose, onSelect, editTaskIds }) => {
    const [allsubjects, setAllSubjects] = useState<Subject[]>([]);
    const [searchValue, setSearchValue] = useState("");
    const [checkedData, setCheckedData] = useState<string[]>([]); // Stores IDs of selected items
    const [lessonForStudyUnit, setLessonForStudyUnit] = useState<Lesson[]>([]);

    // Fetch all subjects when the popup is shown
    useEffect(() => {
        if (!show) return;

        getAllSubjects().then((subjects) => {
            if (!subjects) {
                console.error("subjects not found");
                return;
            }
            setAllSubjects(subjects);
        }).catch((err) => {
            console.error("Error fetching subjects:", err);
        });
    }, [show]);

    // Filter subjects, lessons, and tasks based on Title
    function searchFilterdData(subjects: Subject[], searchValue: string): Subject[] {
        const query = searchValue.toLowerCase();
        
        // If search is empty, return the original state
        if (query === "") return allsubjects;

        const filteredSubject: Subject[] = [];

        subjects.forEach((sub) => {
            const filteredLessons: Lesson[] = [];

            if (sub.lessons) {
                sub.lessons.forEach((lesson) => {
                    let added = false;
                    
                    // Check Title match for lesson (Case-insensitive)
                    if (lesson.title.toLowerCase().includes(query)) {
                        filteredLessons.push({ ...lesson });
                        added = true;
                    }

                    // Check Title match for tasks if lesson wasn't already added
                    if (!added && lesson.taskDetails) {
                        lesson.taskDetails.forEach((task) => {
                            if (task.title.toLowerCase().includes(query) && !added) {
                                filteredLessons.push({ ...lesson });
                                added = true;
                            }
                        });
                    }
                });
            }

            // Check Title match for subject or if it contains matching lessons
            if (sub.title.toLowerCase().includes(query)) {
                filteredSubject.push({ ...sub });
            } else if (filteredLessons.length > 0) {
                filteredSubject.push({ ...sub, lessons: filteredLessons });
            }
        });

        return filteredSubject;
    }

    // Handle selection logic using IDs to track checked items and manage hierarchy
    const handleCheckboxChange = (id: string, item: any) => {
        const isChecked = !checkedData.includes(id);

        if (isChecked) {
            const checkedContentIds: string[] = [];

            // If subject is selected, add all its lessons and their tasks IDs
            if (item.lessons) {
                setLessonForStudyUnit(prev => [...prev, ...item.lessons]);
                item.lessons.forEach((lesson: Lesson) => {
                    checkedContentIds.push(lesson.id);
                    lesson.taskDetails?.forEach((task: { id: string }) => {
                        checkedContentIds.push(task.id);
                    });
                });
            }
            // If a specific lesson is selected, add its ID and its tasks IDs
            if (item?.subjectId) {
                setLessonForStudyUnit(prev => [...prev, item]);
                item?.taskDetails?.forEach((task: { id: string }) => {
                    checkedContentIds.push(task.id);
                });
            }

            checkedContentIds.push(id);
            setCheckedData([...checkedData, ...checkedContentIds]);
        }
        else {
            // Remove the ID from checkedData and manage child item removal
            setCheckedData((prev) => prev.filter((idToRemove) => id !== idToRemove));
            
            if (item?.lessons) {
                item.lessons.forEach((lesson: Lesson) => {
                    setCheckedData((prev) => prev.filter((idToRemove) => lesson.id !== idToRemove));
                    setLessonForStudyUnit((prevlesson) => prevlesson.filter((itemToRemove) => lesson.id !== itemToRemove.id));

                    if (lesson.taskDetails) {
                        lesson.taskDetails.forEach((task: { id: string }) => {
                            setCheckedData((prev) => prev.filter((idToRemove) => task.id !== idToRemove));
                        });
                    }
                });
            }
            if (item?.subjectId) {
                setLessonForStudyUnit((prevlesson) => prevlesson.filter((lesson) => lesson.id !== item.id));
                item?.taskDetails?.forEach((task: { id: string }) => {
                    setCheckedData((prev) => prev.filter((idToRemove) => task.id !== idToRemove));
                });
            }
        }
    };

    // Render the tree hierarchy with Selection logic
    const buildContentTree = () => {
        const filteredSubjects = searchFilterdData(allsubjects, searchValue);
        return filteredSubjects.map((subject) => (
            <ul className="popup-subjects selection-node" key={`popup-subjects-${subject.id}`}>
                <li className="popup-subject" key={subject.id}>
                    <input type="checkbox" className="subject-checkbox" id={subject.id} 
                        checked={checkedData.includes(subject.id)}
                        onChange={() => handleCheckboxChange(subject.id, subject)}
                    />
                    <label htmlFor={subject.id}>{subject.title}</label>
                    {
                        subject.lessons ? subject.lessons.map((lesson) => (
                            <ul className="popup-lessons selection-node" key={`popup-lessons-${lesson.id}`}>
                                <li className="popup-lesson" key={lesson.id}>
                                    <input type="checkbox" className="lesson-checkbox" 
                                        checked={checkedData.includes(lesson.id)}
                                        onChange={() => handleCheckboxChange(lesson.id, lesson)}
                                        id={lesson.id} />
                                    <label htmlFor={lesson.id}>{lesson.title}</label>
                                    {
                                        lesson.taskDetails ? lesson.taskDetails.map((task) => (
                                            <ul className="popup-tasks selection-node" key={`popup-tasks-${task.id}`}>
                                                <li className="popup-task" key={task.id}>
                                                    <input type="checkbox" className="task-checkbox" 
                                                        checked={checkedData.includes(task.id)}
                                                        onChange={() => handleCheckboxChange(task.id, task)}
                                                        id={task.id} />
                                                    <label htmlFor={task.id}>{task.title}</label>
                                                </li>
                                            </ul>)) : null
                                    }
                                </li>
                            </ul>
                        )) : null
                    }
                </li>
            </ul>
        ));
    };

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchValue(e.target.value);
    }

    return (
        <div className="popup-overlay" onClick={onClose}>
            <div className="new-content-popup" onClick={(e) => e.stopPropagation()}>
                <div className="new-content-popup--header">
                    <div className="header-top">
                        <span>הוסף תכנים</span>
                        <button className="btn-close" onClick={onClose}>
                            <CloseIcon />
                        </button>
                    </div>
                    <div className="header-top--search">
                        <input className="search-input" name="search-input"
                            id="search-input"
                            placeholder="חיפוש"
                            value={searchValue}
                            onChange={(e) => handleSearch(e)}
                        />
                    </div>
                </div>
                <div className="new-content-popup--body">
                    {buildContentTree()}
                </div>
                <div className="new-content-popup--actions">
                    <Button onClick={onClose} variant="secondary">ביטול</Button>
                    <Button onClick={() => onSelect(lessonForStudyUnit)}
                        disabled={lessonForStudyUnit.length === 0}
                        variant="primary">
                        <span>הוסף תוכן</span>
                    </Button>
                </div>
            </div>
        </div >
    );
};

export default NewContetPopup;