import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import { TanstackQueryWrapper } from '@/components/TanstackQueryWrapper';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <TanstackQueryWrapper>
      <App />
    </TanstackQueryWrapper>
  </StrictMode>,
);
