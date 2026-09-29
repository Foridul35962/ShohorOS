interface ApiErrorDetail {
    field?: string;
    message?: string;
}

class ApiErrors extends Error {
    status: number;
    error: ApiErrorDetail[];
    success: boolean;

    constructor(
        status: number,
        message: string = "Something is wrong",
        error: ApiErrorDetail[] = []
    ) {
        super(message);

        this.status = status;
        this.error = error;
        this.success = false;

        Object.setPrototypeOf(this, ApiErrors.prototype);
    }
}

export default ApiErrors;