import { z } from "zod";
import { PROJECT_STATUSES } from "@/lib/constants";
import { roundMoney } from "@/lib/money";
import type { Project, ProjectInput } from "@/types";

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const optionalDate = z
  .string()
  .refine(
    (value) => value === "" || DATE_PATTERN.test(value),
    "Enter a valid date",
  );

export const projectFormSchema = z
  .object({
    leadId: z.string().min(1, "Choose a client"),
    name: z
      .string()
      .trim()
      .min(1, "Project name is required")
      .max(120, "Keep it under 120 characters"),
    budget: z
      .string()
      .trim()
      .min(1, "Enter a budget")
      .refine(
        (value) =>
          Number.isFinite(Number(value)) &&
          Number(value) >= 0 &&
          Number(value) <= 1_000_000_000,
        "Enter an amount between 0 and 1,000,000,000",
      ),
    status: z.enum(PROJECT_STATUSES),
    startDate: optionalDate,
    deadline: optionalDate,
  })
  .refine(
    (values) =>
      values.startDate === "" ||
      values.deadline === "" ||
      values.deadline >= values.startDate,
    {
      message: "Deadline must be on or after the start date",
      path: ["deadline"],
    },
  );

export type ProjectFormValues = z.infer<typeof projectFormSchema>;

export const emptyProjectFormValues: ProjectFormValues = {
  leadId: "",
  name: "",
  budget: "",
  status: "planning",
  startDate: "",
  deadline: "",
};

export function projectToFormValues(project: Project): ProjectFormValues {
  return {
    leadId: project.leadId,
    name: project.name,
    budget: String(project.budget),
    status: project.status,
    startDate: project.startDate ?? "",
    deadline: project.deadline ?? "",
  };
}

export function formValuesToProjectInput(
  values: ProjectFormValues,
): ProjectInput {
  return {
    leadId: values.leadId,
    name: values.name,
    budget: roundMoney(Number(values.budget)),
    status: values.status,
    startDate: values.startDate === "" ? null : values.startDate,
    deadline: values.deadline === "" ? null : values.deadline,
  };
}
