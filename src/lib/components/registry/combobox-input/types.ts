export interface ComboboxOption {
  value: string;
  label: string;
  /** Secondary line under the label in the list. */
  description?: string;
}

/**
 * Loads options for a query. An empty query asks for the initial list shown
 * when the popover opens — return `[]` to show "start typing" instead.
 */
export type ComboboxSearch<T extends ComboboxOption = ComboboxOption> = (
  query: string,
) => Promise<T[]>;
