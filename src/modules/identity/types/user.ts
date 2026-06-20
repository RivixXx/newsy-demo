import type { UUID } from '@/shared/types';

export type UserStatus = 'ACTIVE' | 'PENDING' | 'SUSPENDED' | 'DELETED';

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

