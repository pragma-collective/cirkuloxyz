import { useState, useCallback } from "react";

/**
 * Hook to copy text to clipboard with feedback state
 *
 * @returns Object with copyToClipboard function, copied state, and error state
 *
 * @example
 * const { copyToClipboard, copied, error } = useCopyToClipboard();
 *
 * <button onClick={() => copyToClipboard("0x1234...")}>
 *   {copied ? "Copied!" : "Copy"}
 * </button>
 */
export function useCopyToClipboard() {
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const copyToClipboard = useCallback(async (text: string) => {
    try {
      // Reset states
      setError(null);
      setCopied(false);

      // Use Clipboard API
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
      } else {
        // Fallback for older browsers or non-HTTPS contexts
        const textArea = document.createElement("textarea");
        textArea.value = text;
        textArea.style.position = "fixed";
        textArea.style.left = "-999999px";
        textArea.style.top = "-999999px";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();

        try {
          document.execCommand("copy");
          textArea.remove();
        } catch (err) {
          console.error("[useCopyToClipboard] Fallback failed:", err);
          textArea.remove();
          throw new Error("Copy failed");
        }
      }

      // Set copied state
      setCopied(true);

      // Reset after 2 seconds
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (err) {
      console.error("[useCopyToClipboard] Error:", err);
      setError(err instanceof Error ? err.message : "Failed to copy");
    }
  }, []);

  return { copyToClipboard, copied, error };
}
