export interface allocatedInspectorTypes {
    projectId: string;
    inspectorId: string;
    date: string;
}

export interface availableInspectorTypes {
    _id: string;
    name: string;
    profilePic?: {
        url?: string;
    };
    phoneNumber: string;
}