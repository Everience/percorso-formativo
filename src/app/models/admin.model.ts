export interface PaginatedResponse<T> {
    data: T[];
    meta: {
        totalItems: number;
        currentPage: number;
        totalPages: number;
        limit: number;
    };
}

export interface AdminUser {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    role: string;
    uid: string;
}

export interface AdminCourse {
    id: number;
    title: string;
    description: string | null;
    category: 'DEV' | 'TECH';
    position_row: number;
    display_order: number;
}

export interface AdminResource {
    id: number;
    course_id: number;
    title: string;
    platform: string;
    video_url: string;
    sort_order?: number;
}

export interface UserProgress {
    id: number;
    title: string;
    description: string | null;
    category: string;
    position_row: number;
    display_order: number;
    status: string;
}

export interface CourseStats {
    id: number;
    title: string;
    category: string;
    isCertification: boolean;
    position_row: number;
    display_order: number;
    completedCount: number;
    inProgressCount: number;
    notStartedCount: number;
    eligibleUsers: number;
    completionRate: number;
}

export interface AnalyticsOverview {
    users: {
        total: number;
        byRole: { dev: number; tech: number };
    };
    courses: {
        total: number;
        byCategory: { DEV: number; TECH: number };
    };
    completion: {
        overallRate: number;
        topCourses: CourseStats[];
        bottomCourses: CourseStats[];
    };
    courseStats: CourseStats[];
}
