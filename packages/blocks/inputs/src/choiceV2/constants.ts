import { defaultButtonLabel } from "../constants";
import type { ChoiceV2InputBlock } from "./schema";

export const defaultChoiceV2InputOptions = {
  buttonLabel: defaultButtonLabel,
  searchInputPlaceholder: "Filter the options...",
  isMultipleChoice: false,
  isSearchable: false,
  areInitialSearchButtonsVisible: true,
  isTextInputOnClick: false,
} as const satisfies ChoiceV2InputBlock["options"];
