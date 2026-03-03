import { ConfigManager } from '../config/ConfigManager';

/**
 * Custom Logger for StreamLayer.
 * It silences console outputs unless the `debug` prop is explicitly set to true.
 */
export const Logger = {
    info(...args: any[]) {
        if (ConfigManager.isInitialized() && ConfigManager.getConfig().debug) {
            console.log(...args);
        }
    },
    warn(...args: any[]) {
        if (ConfigManager.isInitialized() && ConfigManager.getConfig().debug) {
            console.warn(...args);
        }
    },
    error(...args: any[]) {
        if (ConfigManager.isInitialized() && ConfigManager.getConfig().debug) {
            console.error(...args);
        }
    }
};
