import React from 'react';
import { ThemeProvider } from './contexts/ThemeContext';
import AppNavigator from './navigation/AppNavigator';

const App = () => {
  return (
    <ThemeProvider>
      <AppNavigator />
    </ThemeProvider>
  );
};

export default App;