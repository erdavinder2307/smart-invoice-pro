import { Navigate } from 'react-router-dom';

// Registration is handled by Login.jsx's built-in signup toggle.
// /signup is kept as a canonical URL for external links and SEO.
export default function Signup() {
  return <Navigate to="/login?register=1" replace />;
}
