/**
 * Structured API Error class
 */
export class ApiError extends Error {
    public readonly status: number;
    public readonly code?: string;
    public readonly details?: any;

    constructor(message: string, status: number, code?: string, details?: any) {
        super(message);
        this.name = 'ApiError';
        this.status = status;
        this.code = code;
        this.details = details;

        // Maintains proper stack trace for where our error was thrown (only available on V8)
        if ((Error as any).captureStackTrace) {
            (Error as any).captureStackTrace(this, ApiError);
        }
    }

    /**
     * Check if error is a specific status code
     */
    public isStatus(status: number): boolean {
        return this.status === status;
    }

    /**
     * Check if error is a 401 Unauthorized
     */
    public isUnauthorized(): boolean {
        return this.status === 401 || this.status === 403;
    }
}
