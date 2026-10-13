export interface addMembersTypes {
    name: string
    email: string
    phoneNumber: string
    password: string
    district: string
    role: "moderator" | "department-officer" | "inspector"
}

export interface Member {
    _id: string;
    name: string;
    email: string;
    phoneNumber: string;
    role:
    | "moderator"
    | "department-officer"
    | "city-admin"
    | "inspector";
    profilePic?: {
        url?: string;
    };
    companyId?: string;
    createdAt: string;
    updatedAt: string;
}

export interface MemberPagination {
    totalPages: number;
    totalUsers: number;
    currentPage: number;
    limit: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
}

export interface ViewAllMembersDataTypes {
    users: Member[];
    pagination: MemberPagination;
}