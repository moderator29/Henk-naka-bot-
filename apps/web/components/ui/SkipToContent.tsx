/**
 * Skip-to-content link. Hidden until focused, when a keyboard user presses
 * Tab on a fresh page load, this becomes the first focusable element,
 * letting them jump past the nav. Per RPD §14 accessibility.
 */
export function SkipToContent() {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:rounded-lg focus:bg-magenta focus:text-white focus:font-medium focus:shadow-glow"
    >
      Skip to content
    </a>
  );
}
