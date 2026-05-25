import { FC, ReactElement, ReactNode } from "react";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";

import { isMobile } from "../utils";

type Placement = "top" | "bottom" | "left" | "right";

type Props = {
  tip: string;
  placement?: Placement;
  delay?: number | null;
  disabled?: boolean;
  children: ReactElement;
};

const Tooltip: FC<Props> = ({ tip = "", placement = "right", delay = null, disabled, children }) => {
  if (isMobile() || disabled || !tip) {
    return children;
  }

  return (
    <TooltipPrimitive.Root delayDuration={delay ?? 150}>
      <TooltipPrimitive.Trigger asChild>{children}</TooltipPrimitive.Trigger>
      <TooltipPrimitive.Portal>
        <TooltipPrimitive.Content
          side={placement}
          sideOffset={6}
          className="z-50 bg-white dark:bg-gray-800 px-3 py-2 text-xs rounded-lg drop-shadow text-gray-700 dark:text-gray-100 animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95"
        >
          {tip}
          <TooltipPrimitive.Arrow className="fill-white dark:fill-gray-800" />
        </TooltipPrimitive.Content>
      </TooltipPrimitive.Portal>
    </TooltipPrimitive.Root>
  );
};

export { TooltipPrimitive };
export default Tooltip;
