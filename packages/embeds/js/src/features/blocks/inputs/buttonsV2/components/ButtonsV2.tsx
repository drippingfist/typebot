import { defaultChoiceV2InputOptions } from "@typebot.io/blocks-inputs/choiceV2/constants";
import type { ChoiceV2InputBlock } from "@typebot.io/blocks-inputs/choiceV2/schema";
import { guessDeviceIsMobile } from "@typebot.io/lib/guessDeviceIsMobile";
import { cx } from "@typebot.io/ui/lib/cva";
import { createSignal, For, onMount, Show } from "solid-js";
import { Button } from "@/components/Button";
import { SearchInput } from "@/components/inputs/SearchInput";
import { SendButton } from "@/components/SendButton";
import type { InputSubmitContent } from "@/types";

type Props = {
  chunkIndex: number;
  defaultItems: ChoiceV2InputBlock["items"];
  options: ChoiceV2InputBlock["options"];
  onSubmit: (value: InputSubmitContent) => void;
};

export const ButtonsV2 = (props: Props) => {
  let inputRef: HTMLInputElement | undefined;
  let textInputRef: HTMLInputElement | undefined;
  const isTextInputOnClick =
    props.options?.isTextInputOnClick ??
    defaultChoiceV2InputOptions.isTextInputOnClick;
  const areButtonsVisible =
    props.options?.areInitialSearchButtonsVisible ??
    defaultChoiceV2InputOptions.areInitialSearchButtonsVisible;
  const [filteredItems, setFilteredItems] = createSignal(
    props.options?.isSearchable && !areButtonsVisible ? [] : props.defaultItems,
  );
  const [isTextMode, setIsTextMode] = createSignal(false);
  const [textValue, setTextValue] = createSignal("");

  onMount(() => {
    if (!guessDeviceIsMobile() && inputRef)
      inputRef.focus({ preventScroll: true });
  });

  const handleClick = (itemIndex: number) => {
    if (isTextInputOnClick) {
      setIsTextMode(true);
      setTimeout(() => {
        textInputRef?.focus({ preventScroll: true });
      }, 50);
      return;
    }
    const item = filteredItems()[itemIndex];
    const { value, content } = item;
    props.onSubmit({
      type: "text",
      value: value || content || "",
      label: value ? content : undefined,
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
      setFilteredItems(!areButtonsVisible ? [] : props.defaultItems);
      return;
    }
    setFilteredItems(
      props.defaultItems.filter((item) =>
        item.content?.toLowerCase().includes(inputValue.toLowerCase()),
      ),
    );
  };

  return (
    <div class="flex flex-col items-end gap-2 w-full typebot-buttons-input">
      <Show when={!isTextMode()}>
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
                setFilteredItems(!areButtonsVisible ? [] : props.defaultItems)
              }
            />
          </div>
        </Show>
        <div
          class={cx(
            "flex justify-end gap-2 w-full @xs:w-auto",
            props.options?.isSearchable &&
              "overflow-y-scroll max-h-80 rounded-md",
          )}
          data-slot="list"
        >
          <For each={filteredItems()}>
            {(item, index) => (
              <span class="relative">
                <Button
                  on:click={() => handleClick(index())}
                  data-itemid={item.id}
                  class="w-full"
                >
                  {item.content}
                </Button>
                {props.chunkIndex === 0 &&
                  props.defaultItems.length === 1 && (
                    <span class="flex h-3 w-3 absolute top-0 right-0 -mt-1 -mr-1 ping">
                      <span class="animate-ping absolute inline-flex h-full w-full rounded-full brightness-200 opacity-75" />
                      <span class="relative inline-flex rounded-full h-3 w-3 brightness-150" />
                    </span>
                  )}
              </span>
            )}
          </For>
        </div>
      </Show>

      <Show when={isTextMode()}>
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
      </Show>
    </div>
  );
};
