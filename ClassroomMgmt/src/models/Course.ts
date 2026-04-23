import { Student,Training } from "models";
import { Instructor, EMPTY_INSTRUCTOR } from "models/Instructor";
import { StudyUnit } from "./ContentManagement";

export type CourseStatus = "Active" | "Inactive" | "Completed";
export type CourseMode = "edit" | "open" | "new";

export interface Course {
    id: string;
    name: string;
    status: CourseStatus;
    instructor: Instructor;
    instructorId: string | null;
    students: Student[];
    studentIds?: string[];
    studyUnits?: StudyUnit[];
    studyUnitIds: string[];
    trainingIds: string[],
    trainings?:Training[];
    creationDate?: Date;
    location?: string;
}


export const courseStatusArray: CourseStatus[] = [
    "Active",
    "Inactive",
    "Completed",
];

export const NEW_COURSE_TEMPLATE: Course = {
    id: "",
    name: "",
    status: "Inactive",
    instructor: EMPTY_INSTRUCTOR,
    instructorId: null,
    students: [],
    studentIds: [],
    trainingIds: [],
    creationDate: new Date(),
    location: "",
    studyUnitIds: [],
    studyUnits: [],
};
// ﻿using System;
// using System.Collections.Generic;
// using System.ComponentModel.DataAnnotations;

// namespace ClassroomServer.Models
// {
//     public class Course
//     {
//         public Guid Id { get; set; } = Guid.NewGuid();

//         [Required]
//         public string Name { get; set; } = null!;

//         [Required]
//         public string Status { get; set; } = null!;

//         public List<Guid> TrainingIds { get; set; } = new();

//         public DateTime CreationDate { get; set; }


// public string Base { get; set; } = null!;
// public string Instructor { get; set; } = null!;
// public List<Guid> StudentsData { get; set; } = new();

//         public int Version { get; set; }
//     }
// }