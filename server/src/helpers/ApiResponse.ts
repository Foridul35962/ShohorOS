class ApiResponse {
    status: number;
    data: unknown;
    message: string;
    success: boolean;

    constructor(
        status: number,
        data: unknown = [],
        message: string = "Worked successfully"
    ) {
        this.status = status;
        this.data = data;
        this.message = message;
        this.success = status < 400;
    }
}

export default ApiResponse;