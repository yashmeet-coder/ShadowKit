import React, { useState } from "react";
import { MessageSquare } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { StarRating } from "@/components/ui/rating";
import { useIsMobile } from "@/hooks/use-is-mobile";

const CATEGORIES = ["General", "Bug", "Feature request", "Praise"];

// The demo widget: a floating trigger button plus a modal form. Submissions are
// delivered via the configured onSubmit callback and/or POSTed to apiUrl.
export default function FeedbackWidget({
  title = "Feedback",
  triggerText = "Feedback",
  apiUrl = null,
  onSubmit = null,
  isOpen,
  setIsOpen,
  portalContainer,
}) {
  const isMobile = useIsMobile();

  const [rating, setRating] = useState(0);
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [email, setEmail] = useState("");
  const [comment, setComment] = useState("");
  const [status, setStatus] = useState("idle"); // idle | submitting | success | error
  const [errorMsg, setErrorMsg] = useState("");

  const reset = () => {
    setRating(0);
    setCategory(CATEGORIES[0]);
    setEmail("");
    setComment("");
    setStatus("idle");
    setErrorMsg("");
  };

  const handleOpenChange = (open) => {
    setIsOpen(open);
    if (!open) setTimeout(reset, 200); // reset after close animation
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim()) {
      setErrorMsg("Please enter a comment.");
      return;
    }

    const data = {
      rating,
      category,
      email: email.trim() || null,
      comment: comment.trim(),
      submittedAt: new Date().toISOString(),
    };

    setStatus("submitting");
    setErrorMsg("");

    try {
      // Optional network side: POST to a backend if configured.
      if (apiUrl) {
        const res = await fetch(apiUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error(`Request failed (${res.status})`);
      }

      // Always hand the data to the host callback if provided.
      if (typeof onSubmit === "function") {
        await onSubmit(data);
      }

      setStatus("success");
    } catch (err) {
      setStatus("error");
      setErrorMsg(err?.message || "Something went wrong. Please try again.");
    }
  };

  const submitting = status === "submitting";

  return (
    <>
      {/* Floating trigger button. */}
      <div className="tw-fixed tw-bottom-5 tw-right-5 tw-z-[999999]">
        <Button
          onClick={() => setIsOpen(true)}
          className="tw-h-12 tw-rounded-full tw-px-5 tw-shadow-lg"
        >
          <MessageSquare className="tw-h-4 tw-w-4" />
          {triggerText}
        </Button>
      </div>

      <Dialog open={isOpen} onOpenChange={handleOpenChange}>
        <DialogContent
          container={portalContainer}
          className={
            isMobile
              ? "tw-w-[100dvw] tw-max-w-[100dvw] tw-h-[100dvh] tw-max-h-[100dvh]"
              : "tw-max-w-md"
          }
        >
          {status === "success" ? (
            <div className="tw-flex tw-flex-col tw-items-center tw-gap-3 tw-py-8 tw-text-center">
              <DialogTitle className="tw-text-xl">Thank you! 🎉</DialogTitle>
              <DialogDescription>
                Your feedback has been received.
              </DialogDescription>
              <Button className="tw-mt-2" onClick={() => handleOpenChange(false)}>
                Close
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="tw-flex tw-flex-col tw-gap-4">
              <DialogHeader>
                <DialogTitle>{title}</DialogTitle>
                <DialogDescription>
                  We'd love to hear what you think.
                </DialogDescription>
              </DialogHeader>

              {/* Rating */}
              <div className="tw-flex tw-flex-col tw-gap-2">
                <Label>How would you rate your experience?</Label>
                <StarRating size={28} onRatingChange={setRating} />
              </div>

              {/* Category */}
              <div className="tw-flex tw-flex-col tw-gap-2">
                <Label>Category</Label>
                <div className="tw-flex tw-flex-wrap tw-gap-2">
                  {CATEGORIES.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setCategory(c)}
                      className={
                        "tw-rounded-full tw-border tw-px-3 tw-py-1 tw-text-sm tw-transition-colors " +
                        (category === c
                          ? "tw-border-primary tw-bg-primary tw-text-primary-foreground"
                          : "tw-border-input tw-bg-background hover:tw-bg-accent")
                      }
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>

              {/* Email (optional) */}
              <div className="tw-flex tw-flex-col tw-gap-2">
                <Label htmlFor="sdw-email">Email (optional)</Label>
                <Input
                  id="sdw-email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              {/* Comment */}
              <div className="tw-flex tw-flex-col tw-gap-2">
                <Label htmlFor="sdw-comment">Comment</Label>
                <Textarea
                  id="sdw-comment"
                  placeholder="Tell us more..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={4}
                />
              </div>

              {errorMsg && (
                <p className="tw-text-sm tw-text-destructive">{errorMsg}</p>
              )}

              <DialogFooter>
                <Button type="submit" disabled={submitting} className="tw-w-full sm:tw-w-auto">
                  {submitting ? (
                    <span className="tw-flex tw-items-center tw-gap-2">
                      <span className="sdw-spinner" /> Sending...
                    </span>
                  ) : (
                    "Send feedback"
                  )}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
