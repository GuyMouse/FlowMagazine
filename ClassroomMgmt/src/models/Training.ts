import { Station } from "./Station"; 

export interface Training {
  id: string;
  location: string | null;
  title: string;
  isLive: boolean;
  courseId?: string | null;
  instructorId?: string | null;
  stationIds?: string[] | null;
  stations?: Station[] | null;
  trainingStatisticsId?: string | null;
  studyUnitId: string;
  creationDate: Date;
  version: number;
}

export const NEW_TRAINING_TEMPLATE: Training = {
  id: "", 
  location: "",
  title: "",
  isLive: false,
  courseId: null,
  instructorId: null,
  stationIds: [],
  stations: [],
  trainingStatisticsId: null,
  studyUnitId: "",
  creationDate: new Date(),
  version: 1
};