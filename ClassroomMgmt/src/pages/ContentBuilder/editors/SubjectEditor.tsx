import React from "react";
import { ReactComponent as EditIcon } from "../../../assets/icons/EditIcon.svg";
import "../ContentBuilder.scss";
interface SubjectEditorProps {
    title: string;
    description: string;
    onTitleChange: (value: string) => void;
    onDescriptionChange: (value: string) => void;
}
export const SubjectEditor: React.FC<SubjectEditorProps> = ({
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
                    name="subject-title"
                    id="subject-title"
                    value={title}
                    onChange={(e) => onTitleChange(e.target.value)}
                    placeholder="שם הנושא"
                />
                {/* <EditIcon className="edit" /> */}
            </div>
        </div>
        <div className="content-questions--body">
            <div className="content-questions--body-wrapper">
                <div className="form-field">
                    <label htmlFor="subject-description">תיאור הנושא</label>
                    <textarea
                        id="subject-description"
                        className="description-input"
                        value={description}
                        onChange={(e) => onDescriptionChange(e.target.value)}
                        placeholder="הכנס תיאור לנושא"
                        rows={6}
                    />
                </div>
            </div>
        </div>
    </>
);
export default SubjectEditor;