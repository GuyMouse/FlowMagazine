import { apiRequest } from "helpers/api.helpers";
import { Course } from "models";

export async function startSimulation(): Promise<Course[]> {
  return apiRequest("/simulation/start", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
}

export async function stopSimulation(): Promise<Course[]> {
  return apiRequest("/simulation/stop", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
}
