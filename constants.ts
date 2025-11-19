// constants.ts
import { Page, NavigationItem } from './types';

export const APP_NAME = "Inventory Flow Tracker";

export const NAVIGATION_ITEMS: NavigationItem[] = [
  {
    name: 'Dashboard',
    path: Page.DASHBOARD,
    icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',
  },
  {
    name: 'Item Master',
    path: Page.ITEM_MASTER,
    icon: 'M7 7h.01M7 3h5.989A2 2 0 0115 5.01V21h-8A2 2 0 015 19V5.01C5 3.901 5.901 3 7 3z',
  },
  {
    name: 'Vehicle Master',
    path: Page.VEHICLE_MASTER,
    icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10',
  },
  {
    name: 'Category Master',
    path: Page.CATEGORY_MASTER,
    icon: 'M17.54 2.46a2.46 2.46 0 00-3.48 0L3.46 13.06a2.46 2.46 0 000 3.48l5.4 5.4a2.46 2.46 0 003.48 0L22.94 11.34a2.46 2.46 0 000-3.48l-5.4-5.4zM12 15a3 3 0 110-6 3 3 0 010 6z',
  },
  {
    name: 'Stock In',
    path: Page.STOCK_IN,
    icon: 'M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z',
  },
  {
    name: 'Stock Out',
    path: Page.STOCK_OUT,
    icon: 'M15 12H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z',
  },
  {
    name: 'Reports',
    path: Page.REPORTS,
    icon: 'M9 17v-4m-2 2h4m6 0h-4m2-4H9m4-2V7m-2 2h4M9 5h.01M17 5h.01M12 19H7a2 2 0 01-2-2V5a2 2 0 012-2h10a2 2 0 012 2v12a2 2 0 01-2 2h-5z',
  },
];
