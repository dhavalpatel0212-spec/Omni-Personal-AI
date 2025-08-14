import { AppLayout } from '../components/AppLayout';

// The landing page uses the AppLayout in its 'minimal' variant for the unauthenticated state,
// which means it won't have the standard app header or navigation.
// When a user is logged in, the full AppLayout will render, providing access to the dashboard.
export default [AppLayout];