import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// tailwind-merge doesn't understand our `tw-` prefix, so we strip the prefix
// before merging and re-apply it afterwards. This keeps conflict-resolution
// (e.g. `tw-p-2` vs `tw-p-4`) working while every class still ships prefixed.
export function cn(...inputs) {
  const cleanedInputs = inputs.flatMap((cls) => {
    if (!cls) return [];

    return cls.split(" ").map((c) => {
      const match = c.match(/^([a-zA-Z]+:)?(tw-.+)$/); // capture responsive/variant prefixes + class name
      if (match) {
        return `${match[1] ?? ""}${match[2].replace(/\btw-/g, "")}`;
      }
      return c;
    });
  });

  return twMerge(clsx(cleanedInputs))
    .split(" ")
    .map((cls) =>
      cls.includes(":") ? cls.replace(":", ":tw-") : `tw-${cls}`
    )
    .join(" ");
}
