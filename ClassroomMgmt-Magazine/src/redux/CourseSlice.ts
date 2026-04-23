// import { createSlice, PayloadAction } from "@reduxjs/toolkit";
// import { Student, } from "../models/Student";

// import { CourseStatus } from "../models/Course";



// interface AddCourseState {

//     data: {
//         id: string;
//         name: string;
//         status: CourseStatus;
//         instructor: string;
//         base: string;
//         students?: Student[];
//         studyUnitIds?: string[];
//     };
//     //isEdit:boolean
// }

// // interface StudentData {
// //     id: number;
// //     firstname: string;
// //     lastname: string;
// //     role: string;
// //     unit: string;
// //     grade: number;
// // }

// const initialState: AddCourseState = {
//     data: {
//         id: "",
//         name: "",
//         status: "Inactive",
//         instructor: "",
//         base: "",
//         students: [],
//         studyUnitIds: []
//     },
//     //  isEdit:false
// }


// const courseSlice = createSlice({
//     name: "addcourse", initialState,
//     reducers: {
//         setCourse: (state, action: PayloadAction<AddCourseState>) => {
//             state.data = { ...action.payload.data };
            

//         },
//         deleteCourse: (state) => {
//             state.data = { ...initialState.data };

//         },
//         addStudent: (state, action: PayloadAction<Student>) => {
//             /// add student propeties to data (staff like name , role , unit , grade 
//             if (state.data.students !== undefined) {
//                 state.data.students = [...state.data.students,
//                 {
//                     id: action.payload.id, firstName: action.payload.firstName, lastName: action.payload.lastName,
//                     role: action.payload.role, unit: action.payload.unit, grade: action.payload.grade
//                 }
//                 ];
//             }
//             else {
//                 state.data.students = [{
//                     id: action.payload.id, firstName: action.payload.firstName, lastName: action.payload.lastName,
//                     role: action.payload.role, unit: action.payload.unit, grade: action.payload.grade
//                 }];
//             }

//         },
//         deleteStudent: (state, action: PayloadAction<number>) => {
//             state.data.students = state.data.students?.filter(student => student.id !== action.payload);
//         },
//         deleteStudyUnit: (state, action: PayloadAction<string>) => {
//             state.data.studyUnitIds = state.data.studyUnitIds?.filter(id => id !== action.payload);
//         }
//     }
// });

// export const { setCourse, deleteCourse, addStudent, deleteStudent, deleteStudyUnit } = courseSlice.actions;
// export default courseSlice.reducer;

export default '';
