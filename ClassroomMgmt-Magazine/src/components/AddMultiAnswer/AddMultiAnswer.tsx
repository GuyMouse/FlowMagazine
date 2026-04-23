import React from 'react';
// import { Checkbox } from "@mui/material";
import { ReactComponent as DeleteIcon } from "../../assets/icons/delete.svg";
import { ReactComponent as CheckInCircle } from "../../assets/icons/CheckInCircle.svg";

import './AddMultiAnswer.scss';

interface AddMultiAnswerProps {
    id: number;
    onDelete?: (id: number) => void;
    correct: boolean;
    index: number;
    value?: string;
    onChange?: (id: number, value: string) => void;
}

const AddMultiAnswer: React.FC<AddMultiAnswerProps> = ({ id, onDelete, correct, index, value = "", onChange }) => {
    const placeholderText = correct ? "כתוב את התשובה כאן" : "";
    return (
        <>
            <li className={`answer-item${correct ? ' correct-answer' : ''}`}>
                <div className="answer-item--wrapper">
                    <div className="input-container">
                        <div className="input-wrapper">
                            <input
                                type="text"
                                name={`answer-input-${index}`}
                                className="answer-input"
                                id={`answer-input-${index}`}
                                placeholder={placeholderText}
                                value={value}
                                onChange={(e) => {
                                    onChange?.(id, e.target.value);
                                }} />
                        </div>
                    </div>
                    <div className="button-wrapper">
                        <button
                            type="button"
                            className="delete"
                            onClick={() => {
                                onDelete?.(id);
                            }}>
                            <DeleteIcon />
                        </button>
                    </div>
                </div>
                {
                    correct &&
                    <div className="correct-answer-indicator">
                        <CheckInCircle />
                        <span>תשובה נכונה</span>
                    </div>

                }
            </li>
        </>
    )
}

export default AddMultiAnswer;