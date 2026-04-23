import { Training } from "models/Training";
import { apiRequest } from "helpers/api.helpers";

export async function getAllTrainings(): Promise<Training[]> {
    return apiRequest("/api/trainings", {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
    });
}

export async function getTrainingById(id: string): Promise<Training | null> {
    return await apiRequest<Training>(`/api/trainings/${id}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
    });
} 