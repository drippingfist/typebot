import {
  blockBaseSchema,
  optionBaseSchema,
} from "@typebot.io/blocks-base/schemas";
import { z } from "zod";
import { buttonItemSchemas } from "../choice/schema";
import { InputBlockType } from "../constants";

export const choiceV2InputOptionsSchema = optionBaseSchema.merge(
  z.object({
    isMultipleChoice: z.boolean().optional(),
    buttonLabel: z.string().optional(),
    dynamicVariableId: z.string().optional(),
    isSearchable: z.boolean().optional(),
    searchInputPlaceholder: z.string().optional(),
    areInitialSearchButtonsVisible: z.boolean().optional(),
    isTextInputOnClick: z.boolean().optional(),
  }),
);

export const buttonsV2InputV5Schema = blockBaseSchema.merge(
  z.object({
    type: z.enum([InputBlockType.CHOICE_V2]),
    items: z.array(buttonItemSchemas.v5),
    options: choiceV2InputOptionsSchema.optional(),
  }),
);

export const buttonsV2InputSchemas = {
  v5: buttonsV2InputV5Schema,
  v6: buttonsV2InputV5Schema.extend({
    items: z.array(buttonItemSchemas.v6),
  }),
} as const;

export const buttonsV2InputSchema = z.union([
  buttonsV2InputSchemas.v5,
  buttonsV2InputSchemas.v6,
]);

export type ChoiceV2InputBlock = z.infer<typeof buttonsV2InputSchema>;
