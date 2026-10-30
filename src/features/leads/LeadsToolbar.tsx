import { Search } from "lucide-react";
import { fieldClass, searchClass } from "@/components/ui/fieldStyles";
import { LEAD_SORT_LABELS } from "@/features/leads/leadFilters";
import type { LeadFilters, LeadSort } from "@/features/leads/leadFilters";
import {
  LEAD_PRIORITIES,
  LEAD_PRIORITY_LABELS,
  LEAD_STATUSES,
  LEAD_STATUS_LABELS,
} from "@/lib/constants";

interface LeadsToolbarProps {
  filters: LeadFilters;
  onChange: (filters: LeadFilters) => void;
}

const sortOptions = Object.keys(LEAD_SORT_LABELS) as LeadSort[];

export default function LeadsToolbar({ filters, onChange }: LeadsToolbarProps) {
  const update = <K extends keyof LeadFilters>(key: K, value: LeadFilters[K]) =>
    onChange({ ...filters, [key]: value });

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1.3fr]">
      <div className="relative">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
          aria-hidden="true"
        />
        <input
          type="search"
          aria-label="Search leads"
          placeholder="Search business, contact, email…"
          value={filters.search}
          onChange={(event) => update("search", event.target.value)}
          className={searchClass}
        />
      </div>

      {/* The DOM only gives us `string`, so we tell TypeScript it's one of our unions. */}
      <select
        aria-label="Filter by status"
        value={filters.status}
        onChange={(event) =>
          update("status", event.target.value as LeadFilters["status"])
        }
        className={fieldClass}
      >
        <option value="all">All statuses</option>
        {LEAD_STATUSES.map((status) => (
          <option key={status} value={status}>
            {LEAD_STATUS_LABELS[status]}
          </option>
        ))}
      </select>

      <select
        aria-label="Filter by priority"
        value={filters.priority}
        onChange={(event) =>
          update("priority", event.target.value as LeadFilters["priority"])
        }
        className={fieldClass}
      >
        <option value="all">All priorities</option>
        {LEAD_PRIORITIES.map((priority) => (
          <option key={priority} value={priority}>
            {LEAD_PRIORITY_LABELS[priority]}
          </option>
        ))}
      </select>

      <select
        aria-label="Sort leads"
        value={filters.sort}
        onChange={(event) => update("sort", event.target.value as LeadSort)}
        className={fieldClass}
      >
        {sortOptions.map((sort) => (
          <option key={sort} value={sort}>
            {LEAD_SORT_LABELS[sort]}
          </option>
        ))}
      </select>
    </div>
  );
}
