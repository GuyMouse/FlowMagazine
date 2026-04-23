// Content Management Models

import { Course } from "./Course";

export interface Subject {
    id: string;
    title: string;
    description?: string;
    lessons?: Lesson[];
}

export interface Lesson {
    id: string;
    title: string;
    description?: string;
    subjectId?: string;
    tasks?: string[];
    // ========== taskDetails ==========
    // Full task objects from getAllSubjects for tree/editors (id, title, type, prompt, options, etc.).
    // =========================================
    taskDetails?: TaskBase[];
}
export interface StudyUnit {
    id: string;
    title: string;
    description?: string;
    taskIds?: string[];
    tasks?: TaskBase[];
    course?:Course;
    courseId:string;
    trainingId?:string;

}

export type TaskType = "SelectionQuestion" | "OpenQuestion";

export interface TaskBase {
    id: string;
    title: string;
    lessonId: string;
    type: TaskType;
}

export interface SelectionQuestion extends TaskBase {
    type: "SelectionQuestion";
    prompt: string;
    options: string[];
    correctIndex: number;
}

export interface OpenQuestion extends TaskBase {
    type: "OpenQuestion";
    question: string;
    answer: string;
}


export interface TreeNode {
    id: string;
    title: string;
    type: "subject" | "lesson" | "question";
    data: Subject | Lesson | SelectionQuestion | OpenQuestion;
    children?: TreeNode[];
}