import { setupWorker } from 'msw/browser';
import { demoHandlers } from './demo-handlers';

export const worker = setupWorker(...demoHandlers);
