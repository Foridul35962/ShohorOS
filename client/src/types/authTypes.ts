export interface citizenRegiTypes {
    name: string,
    email: string,
    phoneNumber: string,
    password: string,
    district: string
}

export interface verifyTypes {
    otp: string,
    email: string
}

export interface resetPassTypes {
    password: string,
    email: string
}

export interface contractorRegistrationTypes {
    companyName: string
    registrationNumber: string
    description: string
    address: {
        house: string
        street: string
        postalCode: string
        district: string
    }
    name: string
    email: string
    password: string
    phoneNumber: string
}

export interface userTypes {
    _id: string
    name: string
    email: string
    phoneNumber: string
    profilePic: {
        url: string
    }
    role: "citizen" | "moderator" | "department-officer" | "city-admin" | "contractor" | "project-staff" | "inspector",
    district: string
}

export interface resendOtpTypes {
    email: string
    topic: "registrationCitizen" | "registrationContractor" | "addMembers" | "forgotPass"
}