import { useMemo } from 'react';
import { useTheme } from '../contexts/ThemeContext';

export const useThemedStyles = <T>(styleFactory: (theme: any) => T): T => {
    const { theme } = useTheme();

    return useMemo(() => styleFactory(theme), [theme, styleFactory]);
};