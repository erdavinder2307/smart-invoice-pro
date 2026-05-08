import usePageTracking from '../hooks/usePageTracking';

/**
 * PageTracker Component
 * Tracks page views on route changes
 * Must be rendered inside a Router component
 * 
 * Usage:
 * <BrowserRouter>
 *   <PageTracker />
 *   <Routes>
 *     ...
 *   </Routes>
 * </BrowserRouter>
 */
export const PageTracker = () => {
  usePageTracking();
  return null; // This component doesn't render anything
};

export default PageTracker;
