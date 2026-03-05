import { Component, type ReactNode } from 'react';
import { Logger } from '@utils/logger';

interface ErrorBoundaryProps {
    children: ReactNode;
    fallback?: ReactNode;
    onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface ErrorBoundaryState {
    hasError: boolean;
}

/**
 * ErrorBoundary intercepts React rendering errors in its child tree
 * and displays a fallback UI instead of crashing the whole host application.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(_: Error): ErrorBoundaryState {
        return { hasError: true };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        Logger.error('[StreamLayer] Critical Crash Captured:', error, errorInfo);

        if (this.props.onError) {
            this.props.onError(error, errorInfo);
        }
    }

    render() {
        if (this.state.hasError) {
            if (this.props.fallback !== undefined) {
                return this.props.fallback;
            }
            return (
                <div style={{ padding: '20px', textAlign: 'center', fontFamily: 'sans-serif' }}>
                    <h2>Oups, une erreur inattendue s'est produite.</h2>
                    <p>Veuillez recharger la page ou réessayer plus tard.</p>
                    <button
                        onClick={() => window.location.reload()}
                        style={{ padding: '8px 16px', marginTop: '10px', cursor: 'pointer' }}
                    >
                        Recharger
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}
