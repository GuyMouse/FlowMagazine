export interface Student {
  id: string;
  firstName: string;
  lastName: string;
  serviceNumber?: string; // (personal ID)
  // trainings: TrainingRecord[];
  studentHistoryId?: string;
}

export const EMPTY_STUDENT: Student = {
  id: "",
  firstName: "",
  lastName: "",
  studentHistoryId: "",
  // trainings: [],
};
