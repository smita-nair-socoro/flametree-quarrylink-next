import { AdditionalContactDTO } from '@/lib/types/customer';

export const MOCK_DATA: AdditionalContactDTO[] = [
  {
    id: 1,
    customerId: 1,
    firstName: 'Sarah',
    lastName: 'Mitchell',
    email: 'sarah.mitchell@acmecorp.com.au',
    phone: '+61412345678',
    position: 'Accounts Manager',
  },
  {
    id: 2,
    customerId: 1,
    firstName: 'James',
    lastName: 'Nguyen',
    email: 'james.nguyen@acmecorp.com.au',
    phone: '+61498765432',
    position: 'Site Supervisor',
  },
  {
    id: 3,
    customerId: 1,
    firstName: 'Emma',
    lastName: 'Thompson',
    email: 'emma.thompson@acmecorp.com.au',
    phone: '+61487654321',
    position: 'Operations Coordinator',
  },
];
