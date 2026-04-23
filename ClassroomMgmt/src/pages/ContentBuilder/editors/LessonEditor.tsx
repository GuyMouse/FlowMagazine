import React from "react";
import { ReactComponent as EditIcon } from "../../../assets/icons/EditIcon.svg";

interface LessonEditorProps {
    title: string;
    description: string;
    onTitleChange: (value: string) => void;
    onDescriptionChange: (value: string) => void;
}

export const LessonEditor: React.FC<LessonEditorProps> = ({
    title,
    description,
    onTitleChange,
    onDescriptionChange,
}) => (
    <>
        <div className="content-questions--head">
            <div className="name-container">
                <input
                    className="name-input"
                    name="lesson-title"
                    id="lesson-title"
                    value={title}
                    onChange={(e) => onTitleChange(e.target.value)}
                    placeholder="שם השיעור"
                />
                {/* <EditIcon className="edit" /> */}
            </div>
        </div>
        <div className="content-questions--body">
            <div className="content-questions--body-wrapper">
                <div className="form-field">
                    <label htmlFor="lesson-description">תיאור השיעור</label>
                    <textarea
                        id="lesson-description"
                        className="description-input"
                        value={description}
                        onChange={(e) => onDescriptionChange(e.target.value)}
                        placeholder="הכנס תיאור לשיעור"
                        rows={6}
                    />
                </div>
            </div>
        </div>
    </>
);
export default LessonEditor;
