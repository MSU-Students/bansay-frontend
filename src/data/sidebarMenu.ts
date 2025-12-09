// src/config/menuConfig.ts

export interface MenuItem {
  label: string;
  icon: string;
  route?: string;
  separator?: boolean;
}

export interface MenuConfig {
  [role: string]: MenuItem[];
}

export const menuConfig: MenuConfig = {
  Student: [
    {
      label: 'Dashboard',
      icon: 'space_dashboard',
      route: '/student/dashboard'
    },
    {
      label: 'My Liabilities',
      icon: 'account_balance_wallet',
      route: '/student/liability'
    },
    {
      label: 'Settle Payment',
      icon: 'payment',
      route: '/student/payment'
    },
    {
      label: 'Submit Appeal',
      icon: 'gavel',
      route: '/student/appeal'
    }
  ],
  
  Officer: [
    {
      label: 'Dashboard',
      icon: 'space_dashboard',
      route: '/officer/dashboard'
    },
    {
      label: 'Liability Management',
      icon: 'inventory_2',
      route: '/officer/management'
    },
    {
      label: 'Appeal Review',
      icon: 'rate_review',
      route: '/officer/appeals'
    },
    {
      label: 'Payment Verification',
      icon: 'verified',
      route: '/officer/officer-verify'
    },
    {
      separator: true,
      label: '',
      icon: ''
    },
    {
      label: 'Reports',
      icon: 'assessment',
      route: '/officer/officer-reports'
    }
  ],
  
  Admin: [
    {
      label: 'Dashboard',
      icon: 'space_dashboard',
      route: '/admin/dashboard'
    },
    {
      label: 'User Management',
      icon: 'manage_accounts',
      route: '/admin/user-management'
    },
    {
      separator: true,
      label: '',
      icon: ''
    },
    {
      label: 'System Settings',
      icon: 'settings',
      route: '/admin/settings'
    },
    {
      label: 'Reports',
      icon: 'assessment',
      route: '/admin/reports'
    }
  ]
};

export const getMenuForRole = (role: string): MenuItem[] => {
  return menuConfig[role] || [];
};