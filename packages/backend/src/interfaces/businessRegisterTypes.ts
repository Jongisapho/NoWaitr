
export type BusinessStatus = 'ACTIVE' | 'SUSPENDED' | 'ARCHIVED';
export type DayOfWeek = 'MON' | 'TUE' | 'WED' | 'THU' | 'FRI' | 'SAT' | 'SUN';
export type Role = 'ADMIN' | 'MANAGER' | 'STAFF';

export interface BusinessSettingsPayload {
  defaults?: unknown;
  notifications?: unknown;
}

export interface BusinessPayload {
  name: string;
  legalName?: string;
  registrationNumber?: string;
  contactEmail: string;
  contactPhone?: string;
  website?: string;
  timezone?: string;          // default: "Africa/Johannesburg"
  preferredLanguage?: string; // default: "en"
  status?: BusinessStatus;    // default: "ACTIVE"
  settings?: BusinessSettingsPayload;
}

export interface BranchOperatingHoursPayload {
  day: DayOfWeek;
  openTime?: string | null;
  closeTime?: string | null;
}

export interface BranchSettingsPayload {
  overrides?: unknown;
  notifications?: unknown;
}

export interface BranchPayload {
  name: string;
  code: string;
  slug?: string;
  description?: string;
  contactPhone?: string;
  email?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  province?: string;
  postalCode?: string;
  country?: string;       // default: "ZA"
  timezone?: string | null;
  isDefault?: boolean;    // default: true
  operatingHours?: BranchOperatingHoursPayload[];
  settings?: BranchSettingsPayload;
}

export interface AdminUserPayload {
  name?: string;
  email: string;
  password: string;
  role?: Role;            // default: "ADMIN"
}

export interface RegisterBusinessRequest {
  business: BusinessPayload;
  branch: BranchPayload;
  adminUser: AdminUserPayload;
}

export interface RegisterBusinessResult {
    business: {
        id: number;
        name: string;
        contactEmail: string;
        status: BusinessStatus;
    };
    branch: {
        id: number;
        slug: string;
        code: string;
        isDefault: boolean;
        isActive: boolean;
      };

    adminUser: {
        id: number;
        email: string;
        role: Role;
    };
}

export interface RegisterBranchResult{
  branch: {
    id: number;
    name: string;
    slug: string;
    code: string;
    isDefault: boolean;
    isActive: boolean;
  };
}
