import {z} from "zod";

/* ---------- Shared types ---------- */
export const Role = z.enum(["ADMIN", "MANAGER", "STAFF"]);
export type RoleType = z.infer<typeof Role>;


/* ---------- Base schema---------- */
export const userBaseSchema = z.object({
  name: z.string().min(1, "Name is required").transform(s => s.trim()),
  email: z.email("Invalid email").transform(s => s.trim().toLowerCase()),
  role: Role.default("STAFF"),
});
export type UserBaseDTO = z.infer<typeof userBaseSchema>;

/* ---------- Register (requires password) ---------- */
export const userRegisterSchema = z.object({
  password: z.string().min(8, "Password must be at least 8 characters"),
});
export type UserRegisterDTO = z.infer<typeof userRegisterSchema>;

/** Admin registration locks role to ADMIN */
export const adminRegisterSchema = userRegisterSchema.extend({
  role: z.literal("ADMIN"),
});
export type AdminRegisterDTO = z.infer<typeof adminRegisterSchema>;

/* ---------- Login ---------- */
export const userLoginSchema = z.object({
  email: z.email("Invalid email").transform(s => s.trim().toLowerCase()),
  password: z.string().min(8, "Password must be at least 8 characters"),
}).strict();
export type UserLoginDTO = z.infer<typeof userLoginSchema>;


/* ---------- Update (partial) ---------- */
export const userUpdateSchema = z.object({
  name: z.string().min(1).transform(s => s.trim()).optional(),
  email: z.email().transform(s => s.trim().toLowerCase()).optional(),
  // Consider handling role changes in a separate admin-only endpoint
  role: Role.optional(),
}).strict();







