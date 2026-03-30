export interface PaginatedResponse<T> {
    data: T[];
    meta: {
        /** Rows matching search + role chip (pagination). */
        totalItems: number;
        /** DEV+TECH cohort total; same definition as dashboard KPI `users.total`. */
        appUsersTotal?: number;
        appUsersByRole?: { dev: number; tech: number };
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

export interface CourseCompletionRow {
    user_id: number;
    first_name: string;
    last_name: string;
    email: string;
    role: string;
    status: string;
}

export interface CourseCompletionsResponse {
    course: AdminCourse;
    summary: {
        total: number;
        completed: number;
        inProgress: number;
        notStarted: number;
    };
    rows: CourseCompletionRow[];
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
