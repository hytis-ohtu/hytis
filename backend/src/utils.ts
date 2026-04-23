import { z } from "zod";

const PersonSchema = z.object({
  firstName: z.string().min(1, "First name is required").max(100),
  lastName: z.string().min(1, "Last name is required").max(100),
  titleId: z.number().nullable().optional(),
  departmentId: z.number().nullable().optional(),
  researchGroupId: z.number().nullable().optional(),
  freeText: z.string().max(1000).nullable().optional(),
  supervisorIds: z.array(z.number()).optional(),
  startDate: z.coerce.date().nullable().optional(),
  endDate: z.coerce.date().nullable().optional(),
  roomId: z.number().nullable().optional(),
});

export type PersonInput = z.infer<typeof PersonSchema>;

const toPersonInput = (object: unknown): PersonInput =>
  PersonSchema.parse(object);

export default toPersonInput;

const RoomSchema = z.object({
  capacity: z.preprocess((val) => {
    if (val === "" || val === null || val === undefined) return null;
    if (typeof val === "string") return Number(val);
    return val;
  }, z.number().int().nonnegative("Capacity must be non-negative").nullable().optional()),
  departmentId: z.preprocess(
    (val) => (val === "" ? null : val),
    z.number().nullable().optional(),
  ),
  freeText: z.preprocess(
    (val) => (val === "" ? null : val),
    z.string().nullable().optional(),
  ),
  roomTypeId: z.preprocess((val) => {
    if (val === "" || val === null || val === undefined) return null;
    if (typeof val === "string") return Number(val);
    return val;
  }, z.number().nullable().optional()),
});

export type RoomInput = z.infer<typeof RoomSchema>;

export const toRoomInput = (object: unknown): RoomInput =>
  RoomSchema.parse(object);
