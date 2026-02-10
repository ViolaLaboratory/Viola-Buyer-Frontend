/**
 * Sidebar State Service
 * Manages sidebar collapsed/expanded state persistence in localStorage
 *
 * STORAGE KEY: 'viola_sidebar_collapsed'
 * VALUES: 'true' | 'false'
 */

const STORAGE_KEY = 'viola_sidebar_collapsed';

/**
 * Get the current sidebar collapsed state
 * @returns true if sidebar is collapsed, false if expanded
 * @default false (expanded)
 */
export const getSidebarCollapsed = (): boolean => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored === 'true';
  } catch (error) {
    console.error('Error reading sidebar state:', error);
    return false; // Default to expanded
  }
};

/**
 * Set the sidebar collapsed state
 * @param collapsed - true to collapse sidebar, false to expand
 */
export const setSidebarCollapsed = (collapsed: boolean): void => {
  try {
    localStorage.setItem(STORAGE_KEY, collapsed ? 'true' : 'false');
  } catch (error) {
    console.error('Error saving sidebar state:', error);
  }
};
