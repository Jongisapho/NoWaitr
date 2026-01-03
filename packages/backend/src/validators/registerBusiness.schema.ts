import { z } from "zod";
import { TIME_REGEX, timeToMinutes } from "../utils/strings";
import { adminRegisterSchema } from "./user.schema";

//Enums
const BusinessStatus = z.enum(["ACTIVE", "SUSPENDED", "ARCHIVED"]);
const DayOfWeek = z.enum(["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"]);

//models
const businessSettingsSchema = z.object({
  defaults: z.any().optional(),
  notifications: z.any().optional(),
}).optional();

export const businessSchema = z.object({
  name: z.string().min(2, "Business name must be at least 2 characters"),
  legalName: z.string().optional(),
  registrationNumber: z.string().min(3).optional(),
  contactEmail: z.email("Invalid business contact email"),
  contactPhone: z.string().optional(),
  website: z.url("Invalid website URL").optional(),
  timezone: z.string().default("Africa/Johannesburg").optional(),
  preferredLanguage: z.string().default("en").optional(),
  status: BusinessStatus.default("ACTIVE").optional(),
  settings: businessSettingsSchema,
});

export const branchOperatingHoursSchema = z
  .object({
    day: DayOfWeek,
    openTime: z.string().regex(TIME_REGEX, "Invalid time format HH:MM").nullable().optional(),
    closeTime: z.string().regex(TIME_REGEX, "Invalid time format HH:MM").nullable().optional(),
  })
  .superRefine((val, ctx) => {
    const open = val.openTime ?? null;
    const close = val.closeTime ?? null;

    // Must be both provided or both null
    if ((open && !close) || (!open && close)) {
      ctx.addIssue({
        code: "custom",
        message: `Both openTime and closeTime must be provided together for ${val.day}, or both null.`,
        path: ["openTime"], // optional: point to a specific field
      });
      ctx.addIssue({
        code: "custom",
        message: `Both openTime and closeTime must be provided together for ${val.day}, or both null.`,
        path: ["closeTime"],
      });
      return; // stop further checks for this item
    }

    // If both provided, enforce open < close
    if (open && close) {
      if (timeToMinutes(open) >= timeToMinutes(close)) {
        ctx.addIssue({
          code: "custom",
          message: `openTime must be earlier than closeTime for ${val.day}.`,
          path: ["openTime"],
        });
      }
    }
  });

const branchSettingsSchema = z.object({
  overrides: z.any().optional(),
  notifications: z.any().optional(),
}).optional();

export const branchSchema = z.object({
  name: z.string().min(1, "Branch name is required"),
  code: z.string().min(2, "Branch code must be at least 2 characters"),
  slug: z.string().optional(),
  description: z.string().optional(),
  contactPhone: z.string().optional(),
  email: z.email("Invalid branch email").optional(),
  addressLine1: z.string().optional(),
  addressLine2: z.string().optional(),
  city: z.string().optional(),
  province: z.string().optional(),
  postalCode: z.string().regex(/^\d{4}$/).optional(),
  country: z.string().default("ZA").optional(),
  timezone: z.string().nullable().optional(),
  isDefault: z.boolean().default(true).optional(),
  operatingHours: z.array(branchOperatingHoursSchema).optional(),
  settings: branchSettingsSchema,
});

export const registerBusinessSchema = z.object({
  business: businessSchema,
  branch: branchSchema,
  adminUser: adminRegisterSchema,
});

export type RegisterBusinessDTO = z.infer<typeof registerBusinessSchema>;
export type RegisterBranchDTO = z.infer<typeof branchSchema>;

