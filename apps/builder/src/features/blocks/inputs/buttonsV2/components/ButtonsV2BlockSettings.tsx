import { useTranslate } from "@tolgee/react";
import { defaultChoiceV2InputOptions } from "@typebot.io/blocks-inputs/choiceV2/constants";
import type { ChoiceV2InputBlock } from "@typebot.io/blocks-inputs/choiceV2/schema";
import { Field } from "@typebot.io/ui/components/Field";
import { MoreInfoTooltip } from "@typebot.io/ui/components/MoreInfoTooltip";
import { Switch } from "@typebot.io/ui/components/Switch";
import type { Variable } from "@typebot.io/variables/schemas";
import { DebouncedTextInputWithVariablesButton } from "@/components/inputs/DebouncedTextInput";
import { VariablesCombobox } from "@/components/inputs/VariablesCombobox";

type Props = {
  options?: ChoiceV2InputBlock["options"];
  onOptionsChange: (options: ChoiceV2InputBlock["options"]) => void;
};

export const ButtonsV2BlockSettings = ({
  options,
  onOptionsChange,
}: Props) => {
  const { t } = useTranslate();
  const updateIsMultiple = (isMultipleChoice: boolean) =>
    onOptionsChange({ ...options, isMultipleChoice });
  const updateIsSearchable = (isSearchable: boolean) =>
    onOptionsChange({ ...options, isSearchable });
  const updateButtonLabel = (buttonLabel: string) =>
    onOptionsChange({ ...options, buttonLabel });
  const updateSearchInputPlaceholder = (searchInputPlaceholder: string) =>
    onOptionsChange({ ...options, searchInputPlaceholder });
  const updateSaveVariable = (variable?: Variable) =>
    onOptionsChange({ ...options, variableId: variable?.id });
  const updateDynamicDataVariable = (variable?: Variable) =>
    onOptionsChange({ ...options, dynamicVariableId: variable?.id });
  const updateAreInitialSearchButtonsVisible = (
    areInitialSearchButtonsVisible: boolean,
  ) => onOptionsChange({ ...options, areInitialSearchButtonsVisible });
  const updateIsTextInputOnClick = (isTextInputOnClick: boolean) =>
    onOptionsChange({ ...options, isTextInputOnClick });

  return (
    <div className="flex flex-col gap-4">
      <Field.Container>
        <Field.Root className="flex-row items-center">
          <Switch
            checked={
              options?.isMultipleChoice ??
              defaultChoiceV2InputOptions.isMultipleChoice
            }
            onCheckedChange={updateIsMultiple}
          />
          <Field.Label className="font-medium">
            {t("blocks.inputs.settings.multipleChoice.label")}
          </Field.Label>
        </Field.Root>
        {(options?.isMultipleChoice ??
          defaultChoiceV2InputOptions.isMultipleChoice) && (
          <Field.Root>
            <Field.Label>
              {t("blocks.inputs.settings.submitButton.label")}
            </Field.Label>
            <DebouncedTextInputWithVariablesButton
              defaultValue={
                options?.buttonLabel ??
                t("blocks.inputs.settings.buttonText.label")
              }
              onValueChange={updateButtonLabel}
            />
          </Field.Root>
        )}
      </Field.Container>
      <Field.Container>
        <Field.Root className="flex-row items-center">
          <Switch
            checked={
              options?.isSearchable ?? defaultChoiceV2InputOptions.isSearchable
            }
            onCheckedChange={updateIsSearchable}
          />
          <Field.Label className="font-medium">
            {t("blocks.inputs.settings.isSearchable.label")}
          </Field.Label>
        </Field.Root>
        {(options?.isSearchable ??
          defaultChoiceV2InputOptions.isSearchable) && (
          <>
            <Field.Root className="flex-row items-center">
              <Switch
                checked={
                  options?.areInitialSearchButtonsVisible ??
                  defaultChoiceV2InputOptions.areInitialSearchButtonsVisible
                }
                onCheckedChange={updateAreInitialSearchButtonsVisible}
              />
              <Field.Label>Default display buttons</Field.Label>
            </Field.Root>
            <Field.Root>
              <Field.Label>
                {t("blocks.inputs.settings.input.placeholder.label")}
              </Field.Label>
              <DebouncedTextInputWithVariablesButton
                defaultValue={
                  options?.searchInputPlaceholder ??
                  t("blocks.inputs.settings.input.filterOptions.label")
                }
                onValueChange={updateSearchInputPlaceholder}
              />
            </Field.Root>
          </>
        )}
      </Field.Container>
      <Field.Root className="flex-row items-center">
        <Switch
          checked={
            options?.isTextInputOnClick ??
            defaultChoiceV2InputOptions.isTextInputOnClick
          }
          onCheckedChange={updateIsTextInputOnClick}
        />
        <Field.Label className="font-medium">
          Text input on click
          <MoreInfoTooltip>
            When enabled, clicking a button transforms it into a text input
            field where the user can type a custom response.
          </MoreInfoTooltip>
        </Field.Label>
      </Field.Root>
      <Field.Root>
        <Field.Label>
          {t("blocks.inputs.button.settings.dynamicData.label")}
          <MoreInfoTooltip>
            {t("blocks.inputs.button.settings.dynamicData.infoText.label")}
          </MoreInfoTooltip>
        </Field.Label>
        <VariablesCombobox
          initialVariableId={options?.dynamicVariableId}
          onSelectVariable={updateDynamicDataVariable}
        />
      </Field.Root>
      <Field.Root>
        <Field.Label>
          {t("blocks.inputs.settings.saveAnswer.label")}
        </Field.Label>
        <VariablesCombobox
          initialVariableId={options?.variableId}
          onSelectVariable={updateSaveVariable}
        />
      </Field.Root>
    </div>
  );
};
