import type { ChoiceInputBlock } from "@typebot.io/blocks-inputs/choice/schema";
import type { ChoiceV2InputBlock } from "@typebot.io/blocks-inputs/choiceV2/schema";
import { defaultConditionItemContent } from "@typebot.io/blocks-logic/condition/constants";
import { executeCondition } from "@typebot.io/conditions/executeCondition";
import type { SessionStore } from "@typebot.io/runtime-session-store";
import type { Variable } from "@typebot.io/variables/schemas";

export const filterChoiceItems = (
  block: ChoiceInputBlock | ChoiceV2InputBlock,
  {
    sessionStore,
    variables,
  }: { sessionStore: SessionStore; variables: Variable[] },
): ChoiceInputBlock | ChoiceV2InputBlock => {
  const filteredItems = block.items.filter((item) => {
    if (item.displayCondition?.isEnabled && item.displayCondition?.condition)
      return executeCondition(
        {
          ...item.displayCondition.condition,
          logicalOperator:
            item.displayCondition.condition.logicalOperator ??
            defaultConditionItemContent.logicalOperator,
        },
        {
          variables,
          sessionStore,
        },
      );

    return true;
  });
  return {
    ...block,
    items: filteredItems,
  };
};
