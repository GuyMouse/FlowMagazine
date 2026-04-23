import config from "config";

interface ApiResponse<T> {
    data: T;
}

export async function apiRequest<T>(
    endpoint: string,
    options: RequestInit,
): Promise<T> {
    try {
        const response = await fetch(`${config.apiUrl}${endpoint}`, options);

        if (!response.ok) {
            const errorDetails = await response.text();
            throw new Error(`Request failed: ${response.status} - ${errorDetails}`);
        }

        const json = await response.json();
        // Backend may return { data: T } or the raw value directly
        if (json != null && typeof json === "object" && !Array.isArray(json) && "data" in json) {
            return (json as ApiResponse<T>).data;
        }
        return json as T;
    } catch (error) {
        // Narrow the type of `error`
        if (error instanceof Error) {
            console.error(`API request error: ${error.message}`);
        } else {
            console.error(`Unknown error occurred during API request`);
        }
        throw error; // rethrow the error after logging
    }
}
