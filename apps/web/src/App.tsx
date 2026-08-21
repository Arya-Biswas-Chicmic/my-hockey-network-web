import React from 'react';
import { Providers } from './theme/providers';
import { AppRouter } from './components/app-router';

export default function App() {
  return (
    <Providers>
      <AppRouter />
    </Providers>
  );
}
