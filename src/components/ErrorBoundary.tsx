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
            return this.props.fallback !== undefined ? this.props.fallback : null;
        }

        return this.props.children;
    }
}
