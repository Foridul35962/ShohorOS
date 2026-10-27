export interface Pagination {
    totalPages: number;
    totalUsers: number;
    currentPage: number;
    limit: number;
}

export interface RequestedCitizen {
    _id: string;
    name: string;
    email: string;
    phoneNumber: string;
    district: string;
    createdAt: string;
    updatedAt: string;
}

export interface RequestedContractor {
    _id: string;
    name: string;
    email: string;
    phoneNumber: string;
    companyName: string;
    registrationNumber: string;
    address: {
        district: string;
        house: String,
        street: String,
        postalCode: String,
    };
    description?: string;
    createdAt: string;
    updatedAt: string;
}

export interface RequestedCitizenResponseTypes {
    users: RequestedCitizen[];
    pagination: Pagination;
}

export interface RequestedContractorResponseTypes {
    users: RequestedContractor[];
    pagination: Pagination;
}