import { AdminProfile } from '../types';

export const ADMIN_PROFILES: Record<string, AdminProfile> = {
  admin1: {
    admin_id: 'admin1',
    admin_name: 'Apex Tech Admin',
    email: 'admin1@smartretail.com',
    business_name: 'Apex Tech & Electronics',
    phone: '+1 234 567 8900',
    gstin: '27AADCB2230M1Z2',
    address: '123 Tech Park, Silicon Valley, CA',
    categories: ['Electronics', 'Gadgets']
  },
  admin2: {
    admin_id: 'admin2',
    admin_name: 'Vogue Living Admin',
    email: 'admin2@smartretail.com',
    business_name: 'Vogue & Living Retail',
    phone: '+1 987 654 3210',
    gstin: '27AADCB2230M1Z3',
    address: '456 Fashion Ave, New York, NY',
    categories: ['Clothing', 'Home']
  }
};
