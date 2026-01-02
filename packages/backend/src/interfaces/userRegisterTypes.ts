import { RoleType } from "../validators/user.schema";

export interface tokenValidationResult{
  email: string;
}

export interface userRegistrationResult{
    name: string | null,
    email: string,
    role: RoleType
}