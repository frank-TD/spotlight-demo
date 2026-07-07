import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

// tailwind-merge only knows Tailwind's stock type scale, so it lumps our M3
// utilities (text-label-md, text-headline-lg, …) into the *text color* group.
// A class list like "text-on-primary … text-label-md" then looks like two
// colors and the earlier one gets dropped — lime buttons lose their dark ink
// and fall back to inherited white. Registering the custom scale (the
// --text-* tokens in globals.css) as font-size classes keeps color and size
// utilities orthogonal again.
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      "font-size": [
        { text: ["label-md", "label-caps", "headline-md", "headline-lg", "body-md"] },
      ],
    },
  },
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
