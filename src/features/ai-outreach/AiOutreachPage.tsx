import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Copy, RefreshCw, Sparkles, AlertTriangle } from "lucide-react";
import { useForm } from "react-hook-form";

import { toastAdded } from "@/components/layout/toastSlice";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import EmptyState from "@/components/ui/EmptyState";
import FormField from "@/components/ui/FormField";
import { fieldClass, textareaClass } from "@/components/ui/fieldStyles";
import Skeleton from "@/components/ui/Skeleton";

import { generateOutreach } from "@/features/ai-outreach/outreachApi";
import {
  OUTREACH_CHANNELS,
  OUTREACH_CHANNEL_LABELS,
  OUTREACH_TONES,
  OUTREACH_TONE_LABELS,
  defaultOutreachValues,
  outreachFormSchema,
} from "@/features/ai-outreach/outreachSchema";
import type { OutreachFormValues } from "@/features/ai-outreach/outreachSchema";

import { getErrorMessage } from "@/features/leads/leadsApi";
import { useAppDispatch } from "@/hooks/redux";

export default function AiOutreachPage() {
  const dispatch = useAppDispatch();

  const [message, setMessage] = useState("");
  const [hasGenerated, setHasGenerated] = useState(false);
  const [generateError, setGenerateError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<OutreachFormValues>({
    resolver: zodResolver(outreachFormSchema),
    defaultValues: defaultOutreachValues,
  });

  // Warn users before refreshing, closing, or leaving during generation.
  useEffect(() => {
    if (!isSubmitting) return;

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [isSubmitting]);

  const generate = handleSubmit(async (values) => {
    setGenerateError(null);

    try {
      const text = await generateOutreach(values);
      setMessage(text);
      setHasGenerated(true);
    } catch (error) {
      setGenerateError(
        getErrorMessage(
          error,
          "Could not generate a message. Please try again.",
        ),
      );
    }
  });

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(message);
      dispatch(toastAdded("Copied to clipboard"));
    } catch {
      dispatch(
        toastAdded(
          "Could not copy. Select the text and copy it manually.",
          "error",
        ),
      );
    }
  };

  return (
    <div className="mx-auto grid max-w-6xl items-stretch gap-4 lg:grid-cols-2">
      <Card className="lg:col-span-2">
        <h2 className="text-base font-semibold">Before you send anything</h2>

        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-muted">
          <li>
            This only writes a draft. Nothing is sent for you. Review it, then
            send it yourself.
          </li>

          <li>
            The details you enter are sent to Google's Gemini API to write the
            draft. Don't include personal data such as private names, emails or
            phone numbers.
          </li>

          <li>
            Only contact businesses you have a lawful reason to contact,
            identify yourself honestly, include a way to opt out, and stop when
            someone says no. Rules differ by country and channel. This is not
            legal advice.
          </li>
        </ul>
      </Card>

      {/* Message details */}
      <Card className="flex h-full flex-col">
        <h2 className="text-base font-semibold">Message details</h2>

        <p className="text-sm text-muted">Tell the AI who you're writing to.</p>

        <form
          onSubmit={generate}
          noValidate
          className="mt-4 grid flex-1 content-start gap-4 sm:grid-cols-2"
        >
          <FormField
            label="Business name *"
            error={errors.businessName?.message}
          >
            {(control) => (
              <input
                type="text"
                className={fieldClass}
                {...control}
                {...register("businessName")}
              />
            )}
          </FormField>

          <FormField label="Business website" error={errors.website?.message}>
            {(control) => (
              <input
                type="text"
                inputMode="url"
                placeholder="example.com"
                className={fieldClass}
                {...control}
                {...register("website")}
              />
            )}
          </FormField>

          <FormField
            label="Service offered *"
            error={errors.service?.message}
            className="sm:col-span-2"
          >
            {(control) => (
              <input
                type="text"
                className={fieldClass}
                {...control}
                {...register("service")}
              />
            )}
          </FormField>

          <FormField label="Channel" error={errors.channel?.message}>
            {(control) => (
              <select
                className={fieldClass}
                {...control}
                {...register("channel")}
              >
                {OUTREACH_CHANNELS.map((channel) => (
                  <option key={channel} value={channel}>
                    {OUTREACH_CHANNEL_LABELS[channel]}
                  </option>
                ))}
              </select>
            )}
          </FormField>

          <FormField label="Tone" error={errors.tone?.message}>
            {(control) => (
              <select className={fieldClass} {...control} {...register("tone")}>
                {OUTREACH_TONES.map((tone) => (
                  <option key={tone} value={tone}>
                    {OUTREACH_TONE_LABELS[tone]}
                  </option>
                ))}
              </select>
            )}
          </FormField>

          <FormField
            label="Additional context"
            error={errors.context?.message}
            className="sm:col-span-2"
          >
            {(control) => (
              <textarea
                rows={3}
                className={textareaClass}
                {...control}
                {...register("context")}
              />
            )}
          </FormField>

          <div className="sm:col-span-2">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto"
            >
              <Sparkles className="h-4 w-4" aria-hidden="true" />

              {isSubmitting
                ? "Generating…"
                : hasGenerated
                  ? "Generate again"
                  : "Generate message"}
            </Button>
          </div>

          {isSubmitting && (
            <div
              role="status"
              aria-live="polite"
              className="sm:col-span-2 flex items-start gap-3 rounded-lg border border-warning/40 bg-warning/10 p-3 text-sm"
            >
              <AlertTriangle
                className="mt-0.5 h-4 w-4 shrink-0 text-warning"
                aria-hidden="true"
              />

              <p className="text-muted">
                <span className="font-semibold text-foreground">
                  Please don't reload or refresh this page.
                </span>{" "}
                Your message is being generated. Leaving this page may interrupt
                your experience, and your result might not be saved.
              </p>
            </div>
          )}
        </form>
      </Card>

      {/* Generated message */}
      <Card className="flex h-full flex-col">
        <h2 className="text-base font-semibold">Your message</h2>

        <p className="text-sm text-muted">
          Edit it freely. Nothing is ever sent automatically.
        </p>

        {generateError && (
          <p
            role="alert"
            className="mt-4 rounded-lg border border-danger/40 bg-danger/10 px-3 py-2 text-sm text-danger"
          >
            {generateError}
          </p>
        )}

        {isSubmitting ? (
          <div
            role="status"
            aria-live="polite"
            className="mt-4 flex flex-col gap-3"
          >
            <span className="sr-only">Writing your message…</span>

            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-11/12" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-4/5" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        ) : hasGenerated ? (
          <div className="mt-4 flex flex-1 flex-col gap-3">
            <FormField label="Generated message">
              {(control) => (
                <textarea
                  rows={12}
                  className={textareaClass}
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  {...control}
                />
              )}
            </FormField>

            <div className="flex flex-wrap gap-2">
              <Button
                onClick={() => void copy()}
                disabled={message.trim() === ""}
              >
                <Copy className="h-4 w-4" aria-hidden="true" />
                Copy
              </Button>

              <Button variant="secondary" onClick={() => void generate()}>
                <RefreshCw className="h-4 w-4" aria-hidden="true" />
                Regenerate
              </Button>
            </div>
          </div>
        ) : (
          !generateError && (
            <EmptyState
              icon={Sparkles}
              title="No message yet"
              description="Fill in the details and generate your first message."
            />
          )
        )}
      </Card>
    </div>
  );
}
