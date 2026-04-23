import { apiRequest } from "helpers/api.helpers";

/**
 * Generic API Service
 * 
 * Provides reusable CRUD operations (GET, POST, PUT, DELETE) for any entity type.
 * 
 * Usage:
 *   const courseService = new GenericApiService<Course>("/api/courses");
 *   const allCourses = await courseService.getAll();
 *   const single = await courseService.getById("123");
 *   const created = await courseService.create(newCourse);
 *   const updated = await courseService.update("123", partialCourse);
 *   const deleted = await courseService.delete("123");
 */
class GenericApiService<T extends { id?: string }> {
    private basePath: string;

    constructor(basePath: string) {
        this.basePath = basePath;
    }

    // ────────── GET ──────────

    /** GET all items */
    async getAll(): Promise<T[]> {
        return apiRequest<T[]>(this.basePath, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
        });
    }

    /** GET a single item by ID */
    async getById(id: string): Promise<T | null> {
        if (!id) return null;
        return apiRequest<T>(`${this.basePath}/${id}`, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
        });
    }

    // ────────── POST ──────────

    /** POST - create a new item */
    async create(item: Omit<T, "id">): Promise<T | null> {
        return apiRequest<T>(this.basePath, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(item),
        });
    }

    // ────────── PUT ──────────

    /** PUT - update an existing item by ID */
    async update(id: string, item: Partial<T>): Promise<T | null> {
        if (!id) return null;
        return apiRequest<T>(`${this.basePath}/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(item),
        });
    }

    // ────────── DELETE ──────────

    /** DELETE - remove an item by ID */
    async delete(id: string): Promise<boolean> {
        if (!id) return false;
        return apiRequest<boolean>(`${this.basePath}/${id}`, {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
        });
    }

    // ────────── Custom Request ──────────

    /** Send a custom request to any sub-path under this service's base path */
    async customRequest<R>(
        subPath: string,
        method: "GET" | "POST" | "PUT" | "DELETE",
        body?: unknown
    ): Promise<R> {
        const options: RequestInit = {
            method,
            headers: { "Content-Type": "application/json" },
        };
        if (body) {
            options.body = JSON.stringify(body);
        }
        return apiRequest<R>(`${this.basePath}${subPath}`, options);
    }
}

export default GenericApiService;
