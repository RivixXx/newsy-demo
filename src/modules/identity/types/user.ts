import type { UUID } from '@/shared/types';

export type UserStatus = 'ACTIVE' | 'PENDING' | 'SUSPENDED' | 'DELETED';
export type AccountType = 'INDIVIDUAL' | 'IP' | 'OOO' | 'AO' | 'SELF_EMPLOYED';

export interface UserIdentity {
  id: UUID;
  email?: string | null;
  phone?: string | null;
  firstName: string;
  lastName: string;
  status: UserStatus;
}

export interface UserProfile extends UserIdentity {
  roles: string[];
  organizationIds: UUID[];
}

export interface BusinessFields {
  accountType: AccountType;
  companyName?: string | null;
  inn?: string | null;
  companySize?: string | null;
  employeeCount?: number | null;
  companyAddress?: string | null;
  platformName?: string | null;
}

