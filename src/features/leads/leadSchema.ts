import { z } from "zod";
import { LEAD_PRIORITIES, LEAD_SOURCES, LEAD_STATUSES } from "@/lib/constants";
import { isValidWebsite } from "@/lib/url";
import type { Lead, LeadInput } from "@/types";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_PATTERN = /^\+?[\d\s\-()]{6,20}$/;
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export const leadFormSchema = z.object({
  businessName: z
    .string()
    .trim()
    .min(1, "Business name is required")
    .max(120, "Keep it under 120 characters"),
  contactName: z.string().trim().max(120, "Keep it under 120 characters"),
  email: z
    .string()
    .trim()
    .refine(
      (value) => value === "" || EMAIL_PATTERN.test(value),
      "Enter a valid email address",
    ),
  phone: z
    .string()
    .trim()
    .refine(
      (value) => value === "" || PHONE_PATTERN.test(value),
      "Enter a valid phone number",
    ),
  website: z
    .string()
    .trim()
    .max(200, "Keep it under 200 characters")
    .refine(isValidWebsite, "Enter a valid website, like example.com"),
  source: z.enum(LEAD_SOURCES),
  priority: z.enum(LEAD_PRIORITIES),
  status: z.enum(LEAD_STATUSES),
  dealValue: z
    .string()
    .trim()
    .refine(
      (value) =>
        value === "" ||
        (Number.isFinite(Number(value)) &&
          Number(value) >= 0 &&
          Number(value) <= 1_000_000_000),
      "Enter an amount between 0 and 1,000,000,000",
    ),
  nextFollowUp: z
    .string()
    .refine(
      (value) => value === "" || DATE_PATTERN.test(value),
      "Enter a valid date",
    ),
  notes: z.string().trim().max(2000, "Notes are limited to 2000 characters"),
});

export type LeadFormValues = z.infer<typeof leadFormSchema>;

export const emptyLeadFormValues: LeadFormValues = {
  businessName: "",
  contactName: "",
  email: "",
  phone: "",
  website: "",
  source: "referral",
  priority: "medium",
  status: "new",
  dealValue: "",
  nextFollowUp: "",
  notes: "",
};

// Domain model -> form model (numbers/null become strings)
export function leadToFormValues(lead: Lead): LeadFormValues {
  return {
    businessName: lead.businessName,
    contactName: lead.contactName,
    email: lead.email,
    phone: lead.phone,
    website: lead.website,
    source: lead.source,
    priority: lead.priority,
    status: lead.status,
    dealValue: lead.dealValue === 0 ? "" : String(lead.dealValue),
    nextFollowUp: lead.nextFollowUp ?? "",
    notes: lead.notes,
  };
}

// Form model -> domain model (strings become numbers/null)
export function formValuesToLeadInput(values: LeadFormValues): LeadInput {
  return {
    ...values,
    dealValue: values.dealValue === "" ? 0 : Number(values.dealValue),
    nextFollowUp: values.nextFollowUp === "" ? null : values.nextFollowUp,
  };
}
