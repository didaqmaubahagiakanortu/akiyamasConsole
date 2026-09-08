import { HttpStatus } from "@nestjs/common";

export interface ApiResponse<T = any> {
    status: HttpStatus;
    message: string;
    data: T | null;
}

export function buildResponse<T = any>(
    status: HttpStatus,
    action: string,
    entityName: string,
    data: T | null = null,
    error?: string
): ApiResponse<T> {
    const message = error ?
        `Error when ${action.toUpperCase()} from ${entityName}: ${error}` :
        `${action.toUpperCase()} from ${entityName} successful`

    return {
        status,
        message,
        data
    }
}