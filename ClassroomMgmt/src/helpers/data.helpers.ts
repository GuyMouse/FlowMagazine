export const parseValue = (value: unknown): string => {
    if (typeof value === "string") {
        return value;
    } else if (typeof value === "object" && value !== null) {
        return JSON.stringify(value);
    }
    return String(value);
};

export function areKeysNotEmpty<T extends object>(
    obj: T,
    keys: (keyof T)[]
): boolean {
    return keys.every((key) => {
        const value = obj[key];
        return value !== undefined && value !== null && value !== "";
    });
}

export function isDeepEqual(obj1: any, obj2: any): boolean {
    if (obj1 === obj2) {
        return true;
    }

    if (
        typeof obj1 !== "object" ||
        typeof obj2 !== "object" ||
        obj1 === null ||
        obj2 === null
    ) {
        return false;
    }

    if (
        typeof obj1 === "string" &&
        typeof obj2 === "object" &&
        obj2 instanceof Date
    ) {
        return new Date(obj1).getTime() === obj2.getTime();
    }

    if (
        typeof obj2 === "string" &&
        typeof obj1 === "object" &&
        obj1 instanceof Date
    ) {
        return obj1.getTime() === new Date(obj2).getTime();
    }

    if (Array.isArray(obj1) && Array.isArray(obj2)) {
        if (obj1.length !== obj2.length) {
            return false;
        }
        for (let i = 0; i < obj1.length; i++) {
            if (!isDeepEqual(obj1[i], obj2[i])) {
                return false;
            }
        }
        return true;
    }

    if (Array.isArray(obj1) || Array.isArray(obj2)) {
        return false;
    }

    const keys1 = Object.keys(obj1);
    const keys2 = Object.keys(obj2);

    if (keys1.length !== keys2.length) {
        return false;
    }

    for (const key of keys1) {
        if (!keys2.includes(key)) {
            return false;
        }
        if (!isDeepEqual(obj1[key], obj2[key])) {
            return false;
        }
    }

    return true;
}

export function copyObject(obj: any): any {
    const copy = JSON.parse(JSON.stringify(obj));

    if (copy.creationDate) {
        copy.creationDate = new Date(copy.creationDate);
    }

    return copy;
}

export function translateCourseStatus(status: string): string {
    const statusMap: Record<string, string> = {
        "Active": "בעבודה",
        "Inactive": "טרם החל",
        "Completed": "הסתיים"
    };
    return statusMap[status] || status;
}

export function setAverageGradeClass(grade: number) {
    if (grade >= 85) {
        return 'excellent';
    } else if (grade <= 85 && grade >= 75) {
        return 'good';
    } else if (grade <= 75 && grade >= 55) {
        return 'pass';
    }
    return 'poor';
}