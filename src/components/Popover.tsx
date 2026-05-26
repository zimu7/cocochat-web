import { FC, ReactElement, ReactNode } from "react";
import * as PopoverPrimitive from "@radix-ui/react-popover";

type Side = "top" | "bottom" | "left" | "right";
type Align = "start" | "center" | "end";

type Props = {
  placement?: string;
  offset?: number;
  alignOffset?: number;
  avoidCollisions?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  disabled?: boolean;
  content: ReactNode;
  children: ReactElement;
  className?: string;
};

function parsePlacement(placement: string = "bottom"): { side: Side; align: Align } {
  const parts = placement.split("-");
  const sideMap: Record<string, Side> = { top: "top", bottom: "bottom", left: "left", right: "right" };
  const alignMap: Record<string, Align> = { start: "start", end: "end", center: "center" };
  return {
    side: sideMap[parts[0]] || "bottom",
    align: alignMap[parts[1]] || "center"
  };
}

const Popover: FC<Props> = ({
  placement = "bottom",
  offset = 8,
  alignOffset = 0,
  avoidCollisions = true,
  open,
  onOpenChange,
  disabled,
  content,
  children,
  className
}) => {
  if (disabled) {
    return children;
  }

  const { side, align } = parsePlacement(placement);

  return (
    <PopoverPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <PopoverPrimitive.Trigger asChild>{children}</PopoverPrimitive.Trigger>
      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content
          side={side}
          sideOffset={offset}
          align={align}
          alignOffset={alignOffset}
          avoidCollisions={avoidCollisions}
          className={`z-[1000] outline-none ${className ?? ""}`}
          onInteractOutside={(e) => {
            onOpenChange?.(false);
          }}
        >
          {content}
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  );
};

export { PopoverPrimitive };
export default Popover;
