import { useMemo } from 'react';
import { useTheme } from '../contexts/ThemeContext';

/**
 * Hook helper to create theme-aware styles.
 * Usage:
 *   const styles = useThemedStyles(theme => ({ container: { backgroundColor: theme.background } }));
 * Optionally pass dependencies: useThemedStyles(factory, [dep1, dep2])
 */
export const useThemedStyles = <T extends Record<string, any>>(
    styleFactory: (theme: any) => T,
    deps: any[] = []
): T => {
    const { theme } = useTheme();

    if (typeof styleFactory !== 'function') {
        // Fail early with a clearer message instead of throwing "undefined is not a function" later
        throw new Error('useThemedStyles: first argument must be a function that receives theme and returns styles');
    }

    // Include theme and any additional deps in the memo key
    return useMemo(() => styleFactory(theme), [theme, ...deps]);
};