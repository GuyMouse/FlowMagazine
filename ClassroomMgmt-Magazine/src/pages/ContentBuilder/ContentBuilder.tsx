import React, { useEffect } from "react";
import { Button } from "components/Button";
import { MainPage } from "pages/MainPage";
import { TreeView } from "../../components/TreeView";
import { SimplePopup, /* SimpleInputPopup,  */ SimpleConfirmPopup, DeletePopup } from "../../components/SimplePopup";
import { ReactComponent as SearchIcon } from "../../assets/icons/search.svg";
import { ReactComponent as PlusIcon } from "../../assets/icons/Add_Circle.svg";
import { TreeNode, Subject, Lesson, TaskBase, SelectionQuestion } from "../../models/ContentManagement";
import { SubjectEditor } from "./editors/SubjectEditor";
import { LessonEditor } from "./editors/LessonEditor";
import { QuestionEditor } from "./editors/QuestionEditor";
import { EditorState, ContentState } from "draft-js";
import {
    getAllSubjects,
    createSubject,
    updateSubject,
    deleteSubject,
    getSubjectById,
    createLesson,
    updateLesson,
    deleteLesson,
    getLessonById,
    createSelectionQuestion,
    deleteTask,
    updateSelectionQuestion,
    getTaskById
} from "services/ContentManagement";

import "./ContentBuilder.scss";
import { AddMultiAnswer } from "components/AddMultiAnswer";

const ContentBuilder: React.FC = () => {

    const [treeNodes, setTreeNodes] = React.useState<TreeNode[] | null>(null);
    const [treeNodeId, setTreeNodeId] = React.useState(1);
    const [selectedId, setSelectedId] = React.useState<string | null>(null);
    const [selectedNode, setSelectedNode] = React.useState<TreeNode | null>(null);
    const [isCollpased, setIsCollapsed] = React.useState<boolean>(false);

    const [loading, setLoading] = React.useState(false);

    // Subject Handling
    const [subjectTitle, setSubjectTitle] = React.useState("");
    const [subjectDescription, setSubjectDescription] = React.useState("");

    // Lesson Handling
    const [lessonTitle, setLessonTitle] = React.useState("");
    const [lessonDescription, setLessonDescription] = React.useState("");

    // Question Handling
    const [questionName, setQuestionName] = React.useState("");
    const [questionPrompt, setQuestionPrompt] = React.useState("");
    const [questionOptions, setQuestionOptions] = React.useState<string[]>([]);
    const [questionCorrectIndex, setQuestionCorrectIndex] = React.useState(0);
    const [questionEditorState, setQuestionEditorState] = React.useState<EditorState>(() => EditorState.createEmpty());

    // Popup Handling
    const [showPopup, setShowPopup] = React.useState(false);
    const [showSuccessPopup, setShowSuccessPopup] = React.useState(false);
    const [popupNodesToDelete, setPopupNodesToDelete] = React.useState<string[]>([""]);

    const [hasUnsavedChanges, setHasUnsavedChanges] = React.useState(false);

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
        if (hasUnsavedChanges) {
            e.preventDefault();
            e.returnValue = "";
        }
    };

    useEffect(() => {
        window.addEventListener("beforeunload", handleBeforeUnload);
        console.log(hasUnsavedChanges, "hasUnsavedChanges");
        return () => {
            window.removeEventListener("beforeunload", handleBeforeUnload);
        };
    }, [hasUnsavedChanges]);

    useEffect(() => {
        setHasUnsavedChanges(true);
    }, [treeNodes]);

    const handleDeleteNodePopup = async (node: TreeNode) => {
        setSelectedNode(node);
        setSelectedId(node.id);
        setShowPopup(true);
        const titles = [] as string[];
        node?.children?.map((child) => {
            titles.push(child.title as string);
            child.children?.map(grandchild => titles.push(grandchild.title as string))
        });
        node?.children?.filter((child) => child.title !== node.title)
        setPopupNodesToDelete([node.title, ...titles]);
    }

    const handleDeleteNode = async (node: TreeNode) => {
        switch (node.type) {
            case "subject":
                if (!node.id.startsWith("treeNode-")) {
                    await deleteSubject(node.id);
                }
                setTreeNodes(prev => prev ? prev.filter(n => n.id !== node.id) : null);
                break;
            case "lesson":
                if (!node.id.startsWith("lesson-")) {
                    await deleteLesson(node.id);
                }
                setTreeNodes(prev => prev ? prev.map(subject => ({
                    ...subject,
                    children: subject.children?.filter(lesson => lesson.id !== node.id) || []
                })) : null);
                break;
            case "question":
                if (!node.id.startsWith("question-")) {
                    await deleteTask(node.id);
                }
                setTreeNodes(prev => prev ? prev.map(subject => ({
                    ...subject,
                    children: subject.children?.map(lesson => ({
                        ...lesson,
                        children: lesson.children?.filter(question => question.id !== node.id) || []
                    }))
                })) : null);
                break;
        }
        setSelectedNode(null);
    };

    const onAddAnswer = () => {
        setQuestionOptions(prev => [...prev, ""]);
        updateQuestionInTree(selectedNode?.id, { options: [...questionOptions, ""] });
    };

    const onRemoveAnswer = (index: number) => {
        const updated = questionOptions.filter((_, i) => i !== index);
        setQuestionOptions(updated);
        updateQuestionInTree(selectedNode?.id, { options: updated });
    };

    const onUpdateAnswer = (index: number, value: string) => {
        const updated = questionOptions.map((answer, i) => (i === index ? value : answer));
        setQuestionOptions(updated);
        updateQuestionInTree(selectedNode?.id, { options: updated });
    };

    const updateQuestionInTree = (questionId: string | undefined, updates: any) => {
        if (!questionId) return;
        setTreeNodes(prev => {
            if (!prev) return prev;
            return prev.map(subject => ({
                ...subject,
                children: subject.children?.map(lesson => ({
                    ...lesson,
                    children: lesson.children?.map(question => {
                        if (question.id === questionId) {
                            return {
                                ...question,
                                data: {
                                    ...(question.data as SelectionQuestion),
                                    ...updates
                                }
                            };
                        }
                        return question;
                    })
                }))
            }));
        });
    };

    const onEditorStateChange = (newState: EditorState) => {
        setQuestionEditorState(newState);
        const plainText = newState.getCurrentContent().getPlainText();
        setQuestionPrompt(plainText);
        updateQuestionInTree(selectedNode?.id, { prompt: plainText });
    };

    const onSubjectTitleChange = (title: string, selectedNodeId: string) => {
        if (selectedNode?.type !== "subject") return;
        if (selectedNode.id === selectedNodeId) {
            setSubjectTitle(title || "");
            setTreeNodes(prev => {
                if (!prev) return prev;
                return prev.map(node => {
                    if (node.id === selectedNodeId) {
                        return {
                            ...node,
                            title,
                            data: {
                                ...(node.data as Subject),
                                title
                            }
                        };
                    }
                    return node;
                });
            });
        }
    }

    const onSubjectDescriptionChange = (description: string, selectedNodeId: string) => {
        if (selectedNode?.type !== "subject") return;
        if (selectedNode.id === selectedNodeId) {
            setSubjectDescription(description || "");
            setTreeNodes(prev => {
                if (!prev) return prev;
                return prev.map(node => {
                    if (node.id === selectedNodeId) {
                        return {
                            ...node,
                            description,
                            data: {
                                ...(node.data as Subject),
                                description
                            }
                        };
                    }
                    return node;
                });
            });
        }
    }

    const onLessonTitleChange = (title: string, selectedNodeId: string) => {
        if (selectedNode?.type !== "lesson") return;
        if (selectedNode.id === selectedNodeId) {
            setLessonTitle(title || "");
            setTreeNodes(prev => {
                if (!prev) return prev;
                return prev.map(subjectNode => {
                    const updatedChildren = subjectNode.children?.map(lessonNode => {
                        if (lessonNode.id === selectedNodeId) {
                            return {
                                ...lessonNode,
                                title,
                                data: {
                                    ...(lessonNode.data as Lesson),
                                    title
                                }
                            };
                        }
                        return lessonNode;
                    });
                    return updatedChildren ? { ...subjectNode, children: updatedChildren } : subjectNode;
                });
            });
        }
    }

    const onLessonDescriptionChange = (description: string, selectedNodeId: string) => {
        if (selectedNode?.type !== "lesson") return;
        if (selectedNode.id === selectedNodeId) {
            setLessonDescription(description || "");
            setTreeNodes(prev => {
                if (!prev) return prev;
                return prev.map(subjectNode => {
                    const updatedChildren = subjectNode.children?.map(lessonNode => {
                        if (lessonNode.id === selectedNodeId) {
                            return {
                                ...lessonNode,
                                description,
                                data: {
                                    ...(lessonNode.data as Lesson),
                                    description
                                }
                            };
                        }
                        return lessonNode;
                    });
                    return updatedChildren ? { ...subjectNode, children: updatedChildren } : subjectNode;
                });
            });
        }
    }

    const onQuestionTitleChange = (title: string, selectedNodeId: string) => {
        if (selectedNode?.type !== "question") return;
        if (selectedNode.id === selectedNodeId) {
            setQuestionName(title || "");
            setTreeNodes(prev => {
                if (!prev) return prev;
                return prev.map(subjectNode => {
                    const updatedChildren = subjectNode.children?.map(lessonNode => {
                        const updatedQuestions = lessonNode.children?.map(questionNode => {
                            if (questionNode.id === selectedNodeId) {
                                return {
                                    ...questionNode,
                                    title: title,
                                    data: {
                                        ...(questionNode.data as SelectionQuestion),
                                        title: title
                                    }
                                };
                            }
                            return questionNode;
                        });
                        return { ...lessonNode, children: updatedQuestions };
                    });
                    return updatedChildren ? { ...subjectNode, children: updatedChildren } : subjectNode;
                });
            });
        }
    }

    const handleNodeSelect = (node: any) => {
        setSelectedNode(node);
        setSelectedId(node.id);
        switch (node?.type) {
            case 'subject':
                setSubjectTitle(node.data?.title);
                setSubjectDescription(node.data?.description);
                break;
            case 'lesson':
                setLessonTitle(node.data?.title);
                setLessonDescription(node.data?.description);
                break;
            case 'question':
                setQuestionName(node.data?.title);
                setQuestionOptions(node.data?.options);
                setQuestionCorrectIndex(node.data?.correctIndex);
                setQuestionPrompt(node.data?.prompt);
                break;
        }
    };

    const handleAddMultiQuestion = () => {
        if (selectedNode?.type !== "lesson" && selectedNode?.type !== "question") return;

        const newQuestion: TreeNode = {
            id: `question-${treeNodeId}`,
            title: `שאלה חדשה`,
            type: "question",
            data: {
                id: `question-${treeNodeId}`,
                title: `שאלה חדשה`,
                lessonId: selectedNode.id,
                type: "SelectionQuestion",
                prompt: "",
                options: [],
                correctIndex: 0
            } as SelectionQuestion,
        };

        setTreeNodes(prev => {
            if (!prev) return prev;

            return prev.map(subject => {
                // Only this subject if it contains the selected lesson or the lesson that contains the selected question
                const containsSelected = subject.children?.some(lesson =>
                    lesson.id === selectedNode.id ||
                    lesson.children?.some(question => question.id === selectedNode.id)
                );

                if (!containsSelected) return subject;

                return {
                    ...subject,
                    children: subject.children?.map(lesson => {
                        // Add question only to this lesson (selected) or the lesson that contains the selected question
                        const isTargetLesson =
                            lesson.id === selectedNode.id ||
                            lesson.children?.some(q => q.id === selectedNode.id);
                        if (isTargetLesson) {
                            return {
                                ...lesson,
                                children: [...(lesson.children || []), newQuestion]
                            };
                        }
                        return lesson;
                    })
                };
            });
        });

        handleNodeSelect(newQuestion);
        setTreeNodeId(id => id + 1);
    };


    const handleAddSubject = () => {
        setTreeNodes(prev => {
            const newSubject: TreeNode = {
                id: `treeNode-${treeNodeId}`,
                title: `נושא חדש`,
                type: "subject",
                data: {
                    id: `treeNode-${treeNodeId}`,
                    title: `נושא חדש`,
                    description: "",
                    lessons: []
                } as Subject
            } as TreeNode;

            handleNodeSelect(newSubject);

            return prev ? [...prev, newSubject] : [newSubject];
        })
        setTreeNodeId(prev => prev + 1);
    }

    const handleAddLesson = () => {
        if (selectedNode?.type !== "subject" && selectedNode?.type !== "lesson") return;

        if (selectedNode.type === "lesson") {
            const parentSubject = treeNodes?.find(node =>
                node.children?.some((child: any) => child.id === selectedNode.id)
            );

            if (!parentSubject) return;

            setTreeNodes(prev => {
                if (!prev) return prev;
                return prev.map(node => {
                    if (node.id === parentSubject.id) {
                        const newLesson: TreeNode = {
                            id: `lesson-${treeNodeId}`,
                            title: `שיעור חדש`,
                            type: "lesson",
                            data: {
                                id: `lesson-${treeNodeId}`,
                                title: `שיעור חדש`,
                                description: "",
                                subjectId: parentSubject.id,
                                tasks: [],
                                taskDetails: []
                            } as Lesson,
                        };

                        handleNodeSelect(newLesson);
                        const children = node.children ? [...node.children, newLesson] : [newLesson];
                        return { ...node, children };
                    }
                    return node;
                });
            });
        }

        if (selectedNode.type === "subject") {
            setTreeNodes(prev => {
                if (!prev) return prev;
                return prev.map(node => {
                    if (node.id === selectedNode.id) {
                        const newLesson: TreeNode = {
                            id: `lesson-${treeNodeId}`,
                            title: `שיעור חדש`,
                            type: "lesson",
                            data: {
                                id: `lesson-${treeNodeId}`,
                                title: `שיעור חדש`,
                                description: "",
                                subjectId: selectedNode.id,
                                tasks: [],
                                taskDetails: []
                            } as Lesson,
                        };

                        handleNodeSelect(newLesson);
                        const children = node.children ? [...node.children, newLesson] : [newLesson];
                        return { ...node, children };
                    }
                    return node;
                });
            });
        }

        setTreeNodeId(id => id + 1);
    };
// 1. First, move the fetch logic to a reusable function
const fetchSubjects = async () => {
    setLoading(true);
    try {
        const subjects = await getAllSubjects();
        if (!subjects) return;
        setTreeNodes(subjects.map(subject => ({
            id: subject.id,
            title: subject.title ?? "New Subject",
            type: "subject",
            data: subject,
            children: subject.lessons?.map(lesson => ({
                id: lesson.id,
                title: lesson.title ?? "New Lesson",
                type: "lesson",
                data: lesson,
                children: lesson.taskDetails?.map(task => ({
                    id: task.id,
                    title: task.title ?? "New Question",
                    type: "question",
                    data: task,
                })) ?? []
            })) ?? []
        })));
        setHasUnsavedChanges(false); // Reset changes tracker
    } catch (error) {
        console.error("Failed to fetch subjects:", error);
    } finally {
        setLoading(false);
    }
};

// 2. Update handleSave to refresh the tree after completion
const handleSave = async () => {
    try {
        if (!treeNodes) return;
        
        // Use a simple loop or Promise.all to handle saves
        for (const subjectNode of treeNodes) {
            const subjectData = subjectNode.data as Subject;
            let subjectId: string;

            // Save or Update Subject
            if (subjectNode.id.startsWith("treeNode-")) {
                const newSub = await createSubject(subjectData.title, subjectData.description);
                subjectId = newSub.id;
            } else {
                const updated = await updateSubject(subjectNode.id, subjectData.title, subjectData.description);
                subjectId = updated?.id ?? subjectNode.id;
            }

            for (const lessonNode of subjectNode.children ?? []) {
                const lessonData = lessonNode.data as Lesson;
                let lessonId: string;

                // Save or Update Lesson
                if (lessonNode.id.startsWith("lesson-")) {
                    const newLesson = await createLesson(lessonData.title, subjectId, lessonData.description);
                    lessonId = newLesson.id;
                } else {
                    const updated = await updateLesson(lessonNode.id, lessonData.title, subjectId, lessonData.description);
                    lessonId = updated?.id ?? lessonNode.id;
                }

                for (const questionNode of lessonNode.children ?? []) {
                    const q = questionNode.data as SelectionQuestion;
                    
                    // Save or Update Question
                    if (questionNode.id.startsWith("question-")) {
                        await createSelectionQuestion(
                            q.title,
                            lessonId,
                            q.prompt,
                            q.options,
                            q.correctIndex
                        );
                    } else {
                        await updateSelectionQuestion(
                            questionNode.id,
                            q.title,
                            lessonId,
                            q.prompt,
                            q.options,
                            q.correctIndex
                        );
                    }
                }
            }
        }

        // CRITICAL FIX: Refresh the entire tree from the DB
        // This replaces temporary UI IDs with real Database IDs
        await fetchSubjects();
        
        setShowSuccessPopup(true);
    } catch (error) {
        console.error("Save failed:", error);
        alert("An error occurred while saving. Please try again.");
    }
};

// 3. Update the initial useEffect to use the new function
useEffect(() => {
    fetchSubjects();
}, [])
    // Sync stable editor state when switching to another question so cursor/selection are preserved while editing
    useEffect(() => {
        if (selectedNode?.type === "question") {
            const prompt = (selectedNode.data as SelectionQuestion)?.prompt ?? "";
            setQuestionEditorState(
                prompt
                    ? EditorState.createWithContent(ContentState.createFromText(prompt))
                    : EditorState.createEmpty()
            );
        }
    }, [selectedNode?.id, selectedNode?.type]);


    return (
        <MainPage>
            <div className="content-management">
                <div className="content-management--wrapper">
                    <header className="content-management--head">
                        <div className="buttons-wrapper">
                            <Button
                                variant="danger"
                                onClick={() => { handleDeleteNodePopup(selectedNode as TreeNode); }}
                                disabled={selectedNode === null ? true : false}
                            >
                                <span>מחק</span>
                            </Button>
                            <Button variant="primary"
                                onClick={handleSave}
                            >
                                <span>שמור תכנים</span>
                            </Button>
                        </div>
                    </header>

                    <div className="content-management--container">
                        <div className="content-actions">
                            <div className="content-actions--search">
                                <input id="questions-search" className="questions-search" name="questions-search" />
                                <SearchIcon className="search-icon" />
                            </div>
                            <div className="buttons-wrapper">
                                <Button onClick={() => { handleAddSubject() }}>
                                    <PlusIcon />
                                    <span>נושא</span>
                                </Button>
                                <Button onClick={() => { handleAddLesson() }}
                                    disabled={selectedNode?.type !== "subject" && selectedNode?.type !== "lesson"}
                                // title={!canAddLesson ? "בחר נושא או שיעור" : "הוסף שיעור"}
                                >
                                    <PlusIcon />
                                    <span>שיעור</span>
                                </Button>
                                <Button onClick={() => { handleAddMultiQuestion() }}
                                    disabled={selectedNode?.type !== "lesson" && selectedNode?.type !== "question"}
                                // title={!canAddQuestion ? "בחר שיעור או שאלה" : "הוסף שאלה"}
                                >
                                    <PlusIcon />
                                    <span>שאלת רב ברירה</span>
                                </Button>
                            </div>
                        </div>
                        <div className="content-management--container-wrapper">
                            {loading ? (
                                <div className="content-tree-loading">טוען...</div>
                            ) : (
                                <TreeView
                                    nodes={treeNodes as TreeNode[]}
                                    selectedId={selectedId ?? null}
                                    onSelect={handleNodeSelect}
                                    onDelete={handleDeleteNodePopup}
                                // onToggleExpand={() => handleToggleExpand(selectedId ?? "")}
                                // liveLabelForSelected={liveTitle}
                                // pendingLabels={api.pendingLabels}
                                // expandedIds={api.expandedIds}
                                // onToggleExpand={api.handleToggleExpand}
                                />
                            )}

                            <div className="content-questions">
                                <div className="content-questions--wrapper">
                                    {selectedNode?.type === "subject" && (
                                        <SubjectEditor
                                            title={subjectTitle}
                                            description={subjectDescription}
                                            onTitleChange={(e) => { onSubjectTitleChange(e, selectedNode.id) }}
                                            onDescriptionChange={(e) => { onSubjectDescriptionChange(e, selectedNode.id) }}
                                        />
                                    )}
                                    {selectedNode?.type === "lesson" && (
                                        <LessonEditor
                                            title={lessonTitle}
                                            description={lessonDescription}
                                            onTitleChange={(e) => { onLessonTitleChange(e, selectedNode.id) }}
                                            onDescriptionChange={(e) => { onLessonDescriptionChange(e, selectedNode.id) }}
                                        />
                                    )}
                                    {selectedNode?.type === "question" && (
                                        <QuestionEditor
                                            questionName={questionName}
                                            answers={questionOptions.map((option, index) => ({ id: index, body: option }))}
                                            editorState={questionEditorState}
                                            onQuestionNameChange={(e) => { onQuestionTitleChange(e, selectedNode.id) }}
                                            onEditorStateChange={onEditorStateChange}
                                            onAddAnswer={onAddAnswer}
                                            onRemoveAnswer={onRemoveAnswer}
                                            onUpdateAnswer={onUpdateAnswer}
                                        />
                                    )}
                                    {!treeNodes || !selectedNode && (
                                        <div className="content-questions--body">
                                            <div className="content-questions--body-wrapper">
                                                <div className="no-data">
                                                    נא להוסיף תכנים כדי להתחיל לבנות את השיעורים שלך
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <DeletePopup
                show={showPopup}
                contents={popupNodesToDelete}
                onConfirm={() => {
                    handleDeleteNode(selectedNode as TreeNode);
                    setShowPopup(false);
                }}
                onCancel={() => {
                    setShowPopup(false);
                }}
            />
            <SimplePopup
                show={showSuccessPopup}
                message={'נשמר בהצלחה'}
                type={'success'}
                onClose={() => setShowSuccessPopup(false)}
            />
            {/* <SimpleConfirmPopup
                show={hasUnsavedChanges}
                message={'יש לך שינויים שלא נשמרו, האם אתה בטוח שברצונך לעזוב את הדף?'}
                type={'info'}
                onConfirm={() => { usePrompt("", true) }}
                onCancel={() => setHasUnsavedChanges(false)}
            /> */}

            {/* <SimplePopup
                    show={api.showPopup}
                    message={api.popupMessage}
                    type={api.popupType}
                    onClose={() => api.setShowPopup(false)}
                />

                <SimpleInputPopup
                    show={api.showInputPopup}
                    title={api.inputPopupTitle}
                    onConfirm={(value) => {
                        api.setShowInputPopup(false);
                        api.inputPopupCallback?.(value);
                        api.setInputPopupCallback(null);
                    }}
                    onCancel={() => {
                        api.setShowInputPopup(false);
                        api.setInputPopupCallback(null);
                    }}
                /> */}

            {/* <SimpleConfirmPopup
                show={api.showConfirmPopup}
                message={JSON.stringify(api.selectedNode)}
                onConfirm={() => {
                    api.setShowConfirmPopup(false);
                    api.confirmCallback?.();
                    api.setConfirmCallback(null);
                }}
                onCancel={() => {
                    api.setShowConfirmPopup(false);
                    api.setConfirmCallback(null);
                }}
                confirmText="מחק"
                cancelText="ביטול"
                type="warning"
            /> */}
            {/* <DeletePopup
                contents={allLabels}
                show={api.showConfirmPopup}
                onConfirm={() => {
                    api.setShowConfirmPopup(false);
                    api.confirmCallback?.();
                    api.setConfirmCallback(null);
                }}
                onCancel={() => {
                    api.setShowConfirmPopup(false);
                    api.setConfirmCallback(null);
                }}
            /> */}


        </MainPage >
    );
};

export default ContentBuilder;