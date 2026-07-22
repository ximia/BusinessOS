import { z } from "zod";

/** Shared validation schemas for public forms and admin mutations. */

export const contactSchema = z.object({
  name: z.string().min(2, "Please enter your name.").max(80),
  email: z.string().email("Enter a valid email address."),
  phone: z
    .string()
    .max(30)
    .optional()
    .or(z.literal("")),
  message: z
    .string()
    .min(10, "Tell us a little more (10+ characters).")
    .max(2000),
  // Honeypot — must stay empty. Bots fill it in.
  company: z.string().max(0).optional(),
});
export type ContactInput = z.infer<typeof contactSchema>;

export const quoteSchema = z.object({
  customerName: z.string().min(2, "Please enter your name.").max(80),
  email: z.string().email("Enter a valid email address."),
  phone: z.string().min(7, "Enter a phone number.").max(30),
  service: z.string().min(1, "Choose a service."),
  address: z.string().max(200).optional().or(z.literal("")),
  preferredDate: z.string().optional().or(z.literal("")),
  budget: z.string().max(60).optional().or(z.literal("")),
  notes: z.string().max(2000).optional().or(z.literal("")),
  company: z.string().max(0).optional(), // honeypot
});
export type QuoteInput = z.infer<typeof quoteSchema>;

export const reviewSchema = z.object({
  name: z.string().min(2).max(80),
  rating: z.number().int().min(1).max(5),
  quote: z.string().min(10).max(1000),
  service: z.string().max(120).optional().or(z.literal("")),
});
export type ReviewInput = z.infer<typeof reviewSchema>;

export const leadUpdateSchema = z.object({
  status: z.enum(["new", "contacted", "qualified", "quoted", "won", "lost"]),
  assigned_to: z.string().nullable().optional(),
  tags: z.array(z.string()).optional(),
  value: z.number().nullable().optional(),
});
export type LeadUpdateInput = z.infer<typeof leadUpdateSchema>;

export const postSchema = z.object({
  title: z.string().min(3).max(140),
  slug: z.string().min(3).max(140),
  excerpt: z.string().min(10).max(300),
  content: z.string().min(20),
  category: z.string().min(2).max(60),
  status: z.enum(["draft", "scheduled", "published"]),
  cover_image: z.string().url().nullable().optional().or(z.literal("")),
  seo_title: z.string().max(70).nullable().optional().or(z.literal("")),
  seo_description: z.string().max(160).nullable().optional().or(z.literal("")),
  published_at: z.string().nullable().optional(),
});
export type PostInput = z.infer<typeof postSchema>;

export const loginSchema = z.object({
  email: z.string().email("Enter a valid email address."),
  password: z.string().min(6, "Password must be at least 6 characters."),
});
export type LoginInput = z.infer<typeof loginSchema>;
