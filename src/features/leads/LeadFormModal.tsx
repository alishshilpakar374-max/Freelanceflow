import { toastAdded } from "@/components/layout/toastSlice";
import Modal from "@/components/ui/Modal";
import LeadForm from "@/features/leads/LeadForm";
import { createLead, updateLead } from "@/features/leads/leadsSlice";
import { useAppDispatch } from "@/hooks/redux";
import type { Lead, LeadInput } from "@/types";

interface LeadFormModalProps {
  // null = closed, 'new' = creating, a Lead = editing that lead
  target: Lead | "new" | null;
  onClose: () => void;
}

export default function LeadFormModal({ target, onClose }: LeadFormModalProps) {
  const dispatch = useAppDispatch();
  const lead = target !== null && target !== "new" ? target : undefined;

  // Returns an error message for the form to display, or null on success.
  const handleSubmit = async (input: LeadInput): Promise<string | null> => {
    if (lead) {
      const result = await dispatch(
        updateLead({ id: lead.id, changes: input }),
      );
      if (!updateLead.fulfilled.match(result)) {
        return result.payload ?? "Could not save your changes.";
      }
      dispatch(toastAdded(`${input.businessName} updated`));
    } else {
      const result = await dispatch(createLead(input));
      if (!createLead.fulfilled.match(result)) {
        return result.payload ?? "Could not add the lead.";
      }
      dispatch(toastAdded(`${input.businessName} added to your leads`));
    }

    onClose();
    return null;
  };

  return (
    <Modal
      open={target !== null}
      title={lead ? "Edit lead" : "Add lead"}
      onClose={onClose}
    >
      <LeadForm lead={lead} onSubmit={handleSubmit} onCancel={onClose} />
    </Modal>
  );
}
