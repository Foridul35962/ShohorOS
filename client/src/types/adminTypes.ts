export interface addMembersTypes {
    name: string
    email: string
    phoneNumber: string
    password: string
    district: string
    role: "moderator" | "department-officer" | "inspector"
}