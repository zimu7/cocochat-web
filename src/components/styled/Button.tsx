import { Button, buttonVariants } from "@/components/ui/button";

type Props = React.ComponentProps<typeof Button>;

const StyledButton = ({ children, className = "", variant, size, ...rest }: Props) => {
  // Map legacy className-based variants to cva variants for backward compatibility
  let resolvedVariant = variant;
  let resolvedSize = size;
  let resolvedClassName = className;

  if (!resolvedVariant) {
    if (className.includes("ghost")) resolvedVariant = "outline";
    else if (className.includes("cancel")) resolvedVariant = "secondary";
    else if (className.includes("danger")) resolvedVariant = "destructive";
  }

  if (!resolvedSize) {
    if (className.includes("mini")) resolvedSize = "xs";
    else if (className.includes("small")) resolvedSize = "sm";
  }

  // Clean up legacy class names
  resolvedClassName = resolvedClassName
    .replace(/\b(ghost|cancel|danger|small|mini|border_less)\b/g, "")
    .replace(/\s+/g, " ")
    .trim();

  // Handle flex -> w-full
  if (resolvedClassName.includes("flex")) {
    resolvedClassName = resolvedClassName.replace(/\bflex\b/g, "w-full");
  }

  // Handle border_less -> remove shadow
  if (className.includes("border_less")) {
    resolvedClassName += " shadow-none border-none";
  }

  return (
    <Button
      variant={resolvedVariant}
      size={resolvedSize}
      className={resolvedClassName || undefined}
      {...rest}
    >
      {children}
    </Button>
  );
};

export default StyledButton;
export { buttonVariants };
