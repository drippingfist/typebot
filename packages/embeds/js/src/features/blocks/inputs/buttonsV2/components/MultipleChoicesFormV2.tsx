import { defaultChoiceV2InputOptions } from "@typebot.io/blocks-inputs/choiceV2/constants";
import type { ChoiceV2InputBlock } from "@typebot.io/blocks-inputs/choiceV2/schema";
import { guessDeviceIsMobile } from "@typebot.io/lib/guessDeviceIsMobile";
import { createSignal, For, onMount, Show } from "solid-js";
import { SearchInput } from "@/components/inputs/SearchInput";
import { SendButton } from "@/components/SendButton";
import type { InputSubmitContent } from "@/types";
import { Checkbox } from "@/features/blocks/inputs/buttons/components/Checkbox";

type Props = {
  defaultItems: ChoiceV2InputBlock["items"];
  options: ChoiceV2InputBlock["options"];
  onSubmit: (value: InputSubmitContent) => void;
};

export const MultipleChoicesFormV2 = (props: Props) => {
  let inputRef: HTMLInputElement | undefined;
  let textInputRef: HTMLInputElement | undefined;
  const isTextInputOnClick =
    props.options?.isTextInputOnClick ??
    defaultChoiceV2InputOptions.isTextInputOnClick;
  const [filteredItems, setFilteredItems] = createSignal(
    props.options?.isSearchable &&
      !props.options?.areInitialSearchButtonsVisible
      ? []
      : props.defaultItems,
  );
  const [selectedItemIds, setSelectedItemIds] = createSignal<string[]>([]);
  const [isTextMode, setIsTextMode] = createSignal(false);
  const [textValue, setTextValue] = createSignal("");

  onMount(() => {
    if (!guessDeviceIsMobile() && inputRef)
      inputRef.focus({ preventScroll: true });
  });

  const handleClick = (itemId: string) => {
    if (isTextInputOnClick) {
      setIsTextMode(true);
      setTimeout(() => {
        textInputRef?.focus({ preventScroll: true });
      }, 50);
      return;
    }
    toggleSelectedItemId(itemId);
  };

  const toggleSelectedItemId = (itemId: string) => {
    const existingIndex = selectedItemIds().indexOf(itemId);
    if (existingIndex !== -1) {
      setSelectedItemIds((ids) => ids.filter((id) => id !== itemId));
    } else {
      setSelectedItemIds((ids) => [...ids, itemId]);
    }
  };

  const handleSubmit = () => {
    const selectedItems = selectedItemIds().map((selectedItemId) =>
      props.defaultItems.find((item) => item.id === selectedItemId),
    );
    const hasInternalValue = selectedItems.some((item) => item?.value);
    props.onSubmit({
      type: "text",
      value: selectedItems.map((item) => item?.value ?? item?.content).join(", "),
      label: hasInternalValue
        ? selectedItems.map((item) => item?.content ?? item?.value).join(", ")
        : undefined,
    });
  };

  const handleTextSubmit = (e?: Event) => {
    e?.preventDefault();
    const value = textValue();
    if (!value.trim()) return;
    props.onSubmit({ type: "text", value });
  };

  const handleBackToButtons = () => {
    setIsTextMode(false);
    setTextValue("");
  };

  const filterItems = (inputValue: string) => {
    if (inputValue === "" || inputValue.trim().length === 0) {
      setFilteredItems(
        !props.options?.areInitialSearchButtonsVisible
          ? []
          : props.defaultItems,
      );
      return;
    }
    setFilteredItems(
      props.defaultItems.filter((item) =>
        item.content?.toLowerCase().includes(inputValue.toLowerCase()),
      ),
    );
  };

  return (
    <Show
      when={!isTextMode()}
      fallback={
        <form
          class="flex items-end justify-between typebot-input w-full gap-2"
          onSubmit={handleTextSubmit}
        >
          <button
            type="button"
            class="flex items-center justify-center shrink-0 w-6 h-6 rounded-full text-xs font-semibold cursor-pointer transition-colors hover:opacity-80 bg-host-bubble-bg text-host-bubble-text"
            on:click={handleBackToButtons}
            aria-label="Back to buttons"
          >
            ←
          </button>
          <input
            ref={textInputRef}
            class="focus:outline-none bg-transparent px-2 py-3 flex-1 w-full text-input placeholder:opacity-50"
            type="text"
            placeholder="Type your answer..."
            value={textValue()}
            onInput={(e) => setTextValue(e.currentTarget.value)}
          />
          <SendButton
            isDisabled={textValue().trim().length === 0}
            on:click={() => handleTextSubmit()}
          >
            {"Send"}
          </SendButton>
        </form>
      }
    >
      <form
        class="flex flex-col items-end gap-2 w-full typebot-buttons-input"
        onSubmit={handleSubmit}
      >
        <Show when={props.options?.isSearchable}>
          <div class="flex items-end typebot-input w-full">
            <SearchInput
              ref={inputRef}
              onInput={filterItems}
              placeholder={
                props.options?.searchInputPlaceholder ??
                defaultChoiceV2InputOptions.searchInputPlaceholder
              }
              onClear={() =>
                setFilteredItems(
                  !props.options?.areInitialSearchButtonsVisible
                    ? []
                    : props.defaultItems,
                )
              }
            />
          </div>
        </Show>
        <div
          class={
            "flex justify-end gap-2" +
            (props.options?.isSearchable
              ? " overflow-y-scroll max-h-80 rounded-md"
              : "")
          }
          data-slot="list"
        >
          <For each={filteredItems()}>
            {(item) => (
              <span class="relative w-full @xs:w-auto">
                <label
                  class={
                    "block w-full py-2 px-4 font-semibold focus:outline-none cursor-pointer select-none typebot-selectable" +
                    (selectedItemIds().some((id) => id === item.id)
                      ? " selected"
                      : "")
                  }
                  data-itemid={item.id}
                >
                  <input
                    type="checkbox"
                    class="sr-only"
                    checked={selectedItemIds().some((id) => id === item.id)}
                    on:change={() => handleClick(item.id)}
                  />
                  <div class="flex items-center gap-2">
                    <Checkbox
                      isChecked={selectedItemIds().some((id) => id === item.id)}
                      class="shrink-0"
                    />
                    <span>{item.content}</span>
                  </div>
                </label>
              </span>
            )}
          </For>
        </div>
        {selectedItemIds().length > 0 && (
          <SendButton disableIcon>
            {props.options?.buttonLabel ?? defaultChoiceV2InputOptions.buttonLabel}
          </SendButton>
        )}
      </form>
    </Show>
  );
};
