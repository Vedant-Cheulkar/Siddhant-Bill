import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import { registerPwa } from './pwa/registerPwa';

async function bootstrap() {
  if (import.meta.env.VITE_MOCK_API === 'true') {
    const { worker } = await import('./test/mocks/browser');
    await worker.start({ onUnhandledRequest: 'bypass' });
  }

  registerPwa();

  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}

bootstrap();
