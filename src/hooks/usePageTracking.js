import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import analyticsService from '../services/analyticsService';

/**
 * Hook to track page views on route changes
 * 
 * Usage in main App component:
 * const PageTracker = () => {
 *   usePageTracking();
 *   return null;
 * };
 * 
 * Then add <PageTracker /> as a child of <BrowserRouter>
 */
export const usePageTracking = () => {
  const location = useLocation();

  useEffect(() => {
    // Map route paths to human-readable page titles
    const getPageTitle = (pathname) => {
      const routeTitleMap = {
        '/dashboard': 'Dashboard',
        '/invoices': 'Invoices',
        '/invoices/new': 'Create Invoice',
        '/customers': 'Customers',
        '/customers/new': 'Add Customer',
        '/products': 'Products',
        '/products/new': 'Add Product',
        '/stock': 'Inventory',
        '/quotes': 'Quotes',
        '/sales-orders': 'Sales Orders',
        '/purchase-orders': 'Purchase Orders',
        '/bills': 'Bills',
        '/expenses': 'Expenses',
        '/payments': 'Payments',
        '/reports': 'Reports',
        '/settings': 'Settings',
        '/profile': 'Profile',
        '/admin': 'Admin Panel',
        '/admin/tenants': 'Admin - Tenants',
        '/admin/users': 'Admin - Users',
        '/admin/feature-flags': 'Admin - Feature Flags',
        '/login': 'Login',
        '/signup': 'Sign Up',
        '/forgot-password': 'Forgot Password',
        '/privacy': 'Privacy Policy',
        '/terms': 'Terms of Service',
        '/customer/login': 'Customer Portal - Login',
        '/customer/dashboard': 'Customer Portal - Dashboard',
        '/contact': 'Contact Support',
      };

      // Check for exact match first
      if (routeTitleMap[pathname]) {
        return routeTitleMap[pathname];
      }

      // Check for dynamic routes (e.g., /invoices/123)
      if (pathname.startsWith('/invoices/')) {
        return 'Invoice Details';
      }
      if (pathname.startsWith('/customers/')) {
        return 'Customer Details';
      }
      if (pathname.startsWith('/products/')) {
        return 'Product Details';
      }
      if (pathname.startsWith('/quotes/')) {
        return 'Quote Details';
      }
      if (pathname.startsWith('/reset-password/')) {
        return 'Reset Password';
      }

      return 'Page';
    };

    const pageTitle = getPageTitle(location.pathname);
    analyticsService.trackPageView(location.pathname, pageTitle);

    const isDemo =
      window.location.hostname === 'demo.solidevbooks.com' ||
      Boolean(JSON.parse(localStorage.getItem('user') || '{}').is_demo);
    if (isDemo) {
      analyticsService.trackInteractiveWorkspaceVisit(pageTitle, location.pathname);
    }
  }, [location]);
};

export default usePageTracking;
