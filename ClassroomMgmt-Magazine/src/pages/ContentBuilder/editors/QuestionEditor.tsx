import React from "react";
import { EditorState } from "draft-js";
import { Button } from "components/Button";
import { MEditor } from "../../../components/MEditor";
import AddMultiAnswer from "../../../components/AddMultiAnswer/AddMultiAnswer";
import { ReactComponent as EditIcon } from "../../../assets/icons/EditIcon.svg";
import { ReactComponent as PlusIcon } from "../../../assets/icons/Add_Circle.svg";
import { ReactComponent as ArrowIcon } from "../../../assets/icons/Arrow_down.svg";
import { ReactComponent as DeleteIcon } from "../../../assets/icons/delete.svg";
import { Answer } from "../../../models/Answer";

interface QuestionEditorProps {
    questionName: string;
    editorState: EditorState;
    answers: Answer[];
    onQuestionNameChange: (value: string) => void;
    onEditorStateChange: (state: EditorState) => void;
    onAddAnswer: () => void;
    onRemoveAnswer: (id: number) => void;
    onUpdateAnswer: (id: number, value: string) => void;
}

export const QuestionEditor: React.FC<QuestionEditorProps> = ({
    questionName,
    editorState,
    answers,
    onQuestionNameChange,
    onEditorStateChange,
    onAddAnswer,
    onRemoveAnswer,
    onUpdateAnswer,
}) => (
    <>
        <div className="content-questions--head">
            <div className="name-container">
                <input
                    className="name-input"
                    name="question-name"
                    id="question-name"
                    value={questionName}
                    onChange={(e) => onQuestionNameChange(e.target.value)}
                />
                {/* <EditIcon className="edit" /> */}
            </div>
            {/* <div className="instructor-questions-add-head-questions-buttons">
                <button type="button" className="copy">
                    <ArrowIcon className="copyicon" />
                </button>
                <button type="button" className="delete">
                    <DeleteIcon />
                </button>
            </div> */}
        </div>
        <div className="content-questions--body">
            <div className="content-questions--body-wrapper">
                <div className="editor-container">
                    <MEditor
                        state={editorState}
                        onChange={onEditorStateChange}
                    />
                </div>
                <div className="add-container">
                    <Button className="add" variant="primary" onClick={onAddAnswer}>
                        <PlusIcon />
                        <span>הוסף מסיח</span>
                    </Button>
                </div>
                <div className="answers-content">
                    <ul className="answers-list">
                        {answers.map((a, i) => (
                            <AddMultiAnswer
                                key={a.id}
                                id={a.id}
                                correct={i === 0}
                                index={i}
                                value={a.body}
                                onChange={onUpdateAnswer}
                                onDelete={onRemoveAnswer}
                            />
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    </>
);
export default QuestionEditor;