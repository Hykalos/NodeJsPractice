import { z } from "zod";

const currentYearPlusOne = () => new Date().getUTCFullYear() + 1;

export const animeCreateSchema = z.object({
  title: z.string().trim().min(1).max(255),
  yearFrom: z.number().int().min(1900).max(currentYearPlusOne()),
  yearTo: z.number().int().min(1900).max(currentYearPlusOne()).nullable().optional()
}).superRefine((value, ctx) => {
  if (value.yearTo != null && value.yearTo < value.yearFrom) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["yearTo"],
      message: "yearTo must be greater than or equal to yearFrom"
    });
  }
});

export const animeUpdateSchema = animeCreateSchema;

export const animeListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  sortBy: z.enum(["title", "yearFrom"]).default("title"),
  sortOrder: z.enum(["asc", "desc"]).default("asc"),
  titleContains: z.string().trim().max(255).optional(),
  ongoing: z.enum(["true", "false"]).optional(),
  yearFromGte: z.coerce.number().int().min(1900).optional(),
  yearFromLte: z.coerce.number().int().max(currentYearPlusOne()).optional()
});