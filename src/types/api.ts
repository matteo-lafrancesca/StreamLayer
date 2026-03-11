/**
 * Définitions liées aux échanges avec l'API et à la gestion des erreurs.
 */

/**
 * Classe structurée pour les erreurs retournées par l'API.
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

        if ((Error as any).captureStackTrace) {
            (Error as any).captureStackTrace(this, ApiError);
        }
    }

    /**
     * Vérifie si l'erreur correspond à un code de statut spécifique.
     */
    public isStatus(status: number): boolean {
        return this.status === status;
    }

    /**
     * Vérifie si l'erreur est de type 401 (Non autorisé) ou 403 (Interdit).
     */
    public isUnauthorized(): boolean {
        return this.status === 401 || this.status === 403;
    }
}

/**
 * Interface générique pour les réponses paginées de l'API.
 */
export interface PaginatedResponse<T> {
    limit: number;
    offset: number;
    count_item: number;
    next_link: string | null;
    prev_link: string | null;
    direct_link: string;
    items: T[];
}
