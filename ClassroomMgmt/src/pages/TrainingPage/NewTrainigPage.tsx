import React, { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import Button from "../../components/Button/Button";
import "./TrainingPage.scss";
import { Checkbox } from "@mui/material";
import { ReactComponent as CheckInCircle } from "../../assets/icons/CheckInCircle.svg";
import { ReactComponent as CheckIcon } from "../../assets/icons/check.svg";
import { MainPage } from "pages/MainPage";
import { getFlowHub } from "../../services/Socket";
import { getStudyUnitById } from "../../services/ContentManagement";
import { StudyUnit, SelectionQuestion } from "../../models/ContentManagement";

function shuffleIndices(length: number): number[] {
    const indices = Array.from({ length }, (_, i) => i);
    for (let i = indices.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [indices[i], indices[j]] = [indices[j], indices[i]];
    }
    return indices;
}

const NewTrainigPage: React.FC = () => {
    const location = useLocation();
    const locState = location.state as { station?: any; } | null;
    const station = locState?.station;
    
    
    const studyUnitId = station?.studyUnitId;

    const [userAnswers, setUserAnswers] = useState<{ [key: string]: number }>({});
    const [thisStudyUnit, setThisStudyUnit] = useState<StudyUnit | null>(null);
    const [currentTaskIndex, setCurrentTaskIndex] = useState<number>(0);
    const [submitExamClicked, setSubmitExam] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!studyUnitId) {
            setLoading(false);
            return;
        }

        const fetchData = async () => {
            try {
                const response = await getStudyUnitById(studyUnitId);
                if (response) setThisStudyUnit(response);
            } catch (error: any) {
                console.error("Failed to fetch study unit:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [studyUnitId]);

    const questions = thisStudyUnit?.tasks || [];
    const courseName = thisStudyUnit?.course?.name;
    const lessonName = thisStudyUnit?.title;
    const currentQuestion = questions[currentTaskIndex];
    const stationIdValue = station?.id ?? station?.Id;

    const goToQuestion = (index: number) => {
        if (index >= 0 && index < questions.length) {
            setCurrentTaskIndex(index);
            if (stationIdValue) {
                getFlowHub().jumpToTask(String(stationIdValue), index).catch(() => {});
            }
        }
    };

    const handleAnswerSelect = (taskId: string, chosenIndex: number) => {
        setUserAnswers((prev) => ({ ...prev, [taskId]: chosenIndex }));

        if (stationIdValue) {
            getFlowHub()
                .submitAnswer(String(stationIdValue), { AnswerIndex: chosenIndex })
                .catch((err) => console.error("submitAnswer failed:", err));
        }

        setTimeout(() => {
            if (currentTaskIndex < questions.length - 1) {
                setCurrentTaskIndex(prev => prev + 1);
            }
        }, 400);
    };

    const handleSubmitTraining = () => {
        if (stationIdValue) {
            getFlowHub()
                .submitTraining(String(stationIdValue))
                .then(() => setSubmitExam(true))
                .catch((err) => console.error("submitTraining failed:", err));
        }
    };

    const calculateResults = () => {
        let correctCount = 0;
        questions.forEach((q) => {
            const selectionTask = q as SelectionQuestion;
            if (userAnswers[q.id] === selectionTask.correctIndex) correctCount++;
        });
        const grade = questions.length > 0 ? Math.round((correctCount / questions.length) * 100) : 0;
        return { correctCount, grade };
    };

    if (loading) return <MainPage><div className="student-training">Loading...</div></MainPage>;

    if (submitExamClicked) {
        const { correctCount, grade } = calculateResults();
        return (
            <MainPage>
                <div className="student-training">
                    <div className="student-training--wrapper">
                        <div className="training-completed">
                            <CheckInCircle className="completed-icon" />
                            <h2>האימון הושלם בהצלחה!</h2>
                            
                            <div className="training-completed--grade">
                                <span className="grade-label">ציון:</span>
                                <span className="grade-value">{grade}%</span>
                            </div>
                            
                            <div className="training-completed--details">
                                <span>{correctCount} תשובות נכונות מתוך {questions.length}</span>
                            </div>

                            <div className="training-completed--summary">
                                {questions.map((q, idx) => {
                                    const selectionTask = q as SelectionQuestion;
                                    const isCorrect = userAnswers[q.id] === selectionTask.correctIndex;
                                    const chosenIndex = userAnswers[q.id];
                                    const correctIndex = selectionTask.correctIndex;
                                    const options = selectionTask.options || [];
                                    return (
                                        <div key={q.id} className={`summary-question-block ${isCorrect ? 'correct' : 'incorrect'}`}>
                                            <div className="summary-question-header">
                                                <span className="summary-question-title">שאלה {idx + 1}</span>
                                                <span className="summary-result">{isCorrect ? '✓' : '✗'}</span>
                                            </div>
                                            <div className="summary-question-content">{selectionTask.prompt}</div>
                                            <div className="summary-options-list">
                                                {options.map((optionText, optionIndex) => {
                                                    const isChosen = chosenIndex === optionIndex;
                                                    const isCorrectAnswer = correctIndex === optionIndex;
                                                    return (
                                                        <div
                                                            key={optionIndex}
                                                            className={`summary-option ${isChosen ? 'summary-option--chosen' : ''} ${isCorrectAnswer ? 'summary-option--correct' : ''}`}
                                                        >
                                                            <span className="summary-option-text">{optionText}</span>
                                                            <span className="summary-option-labels">
                                                                {isChosen && <span className="summary-option-label summary-option-label--yours">תשובתך</span>}
                                                                {isCorrectAnswer && <span className="summary-option-label summary-option-label--correct">התשובה הנכונה</span>}
                                                            </span>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                            <Button onClick={() => setSubmitExam(false)}>חזור לצפייה בשאלות</Button>
                        </div>
                    </div>
                </div>
            </MainPage>
        );
    }

    return (
        <MainPage>
            <div className="student-training">
                <div className="student-training--head">
                    <span className="course-name">{courseName || "קורס"}</span>
                    <div className="course-details">
                        <span className="lesson-name">{lessonName || "שיעור"}</span>
                    </div>
                </div>

                <div className="student-training--wrapper">
                    <div className="student-training--actions">
                        <Button onClick={handleSubmitTraining}>
                            <span>שלח מבחן</span>
                        </Button>
                    </div>

                    <div className="training-content">
                        <div className="training-content-side">
                            <div className="training-content-side--head">
                                <span className="list-head">רשימת שאלות</span>
                                <span className="question-conter">{currentTaskIndex + 1}/{questions.length}</span>
                            </div>
                            <div className="questions-list">
                                {questions.map((task, index) => (
                                    <div 
                                        key={task.id} 
                                        onClick={() => goToQuestion(index)} 
                                        className={`questions-list--item ${index === currentTaskIndex ? 'questions-list--item--current' : ''}`}
                                    >
                                        {userAnswers[task.id] !== undefined ? <CheckInCircle className="CheckInCircle" /> : <div className="empty-circle-icon"></div>}
                                        <span className="item-number">שאלה {index + 1}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {currentQuestion && currentQuestion.type === "SelectionQuestion" && (
                            <div className="training-content-body">
                                <div className="training-content-body--head">
                                    <span className="question-name">{currentQuestion.title}</span>
                                </div>
                                <div className="question-content">{(currentQuestion as SelectionQuestion).prompt}</div>
                                <div className="answer-content">
                                    {(currentQuestion as SelectionQuestion).options.map((option, index) => {
                                        const isChecked = userAnswers[currentQuestion.id] === index;
                                        return (
                                            <div key={index} className="student-answer-list" onClick={() => handleAnswerSelect(currentQuestion.id, index)}>
                                                <div className={isChecked ? "check-container-checked" : "check-container-unchecked"}>
                                                    <Checkbox checked={isChecked} icon={<CheckIcon />} checkedIcon={<CheckIcon />} readOnly />
                                                    <span className="checkbox-text">בחר תשובה</span>
                                                </div>
                                                <span className="answer-text">{option}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </MainPage>
    );
};

export default NewTrainigPage;