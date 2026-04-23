import { Course, NEW_COURSE_TEMPLATE } from "./Course";

export interface Instructor {
  id?: string;
  firstName: string;
  lastName: string;
  courseIds: string[];
}

export const EMPTY_INSTRUCTOR: Instructor = {
  id: "0",
  firstName: "",
  lastName: "",
  courseIds: [""],
};
