import { forwardRef, TextareaHTMLAttributes } from "react";

type Props = TextareaHTMLAttributes<HTMLTextAreaElement>;
const StyledTextarea = forwardRef(({ className, ...rest }: Props, ref) => {
  return (
    <textarea
      ref={ref}
      className={`rounded text-sm p-2 bg-background text-foreground resize-none w-full shadow-sm
  border border-solid border-border outline-none
  disabled:bg-muted dark:disabled:bg-card/50 dark:disabled:border-border
  disabled:text-muted-foreground
  disabled:pointer-events-none
  placeholder:text-muted-foreground
  ${className}`}
      {...rest}
    ></textarea>
  );
});
export default StyledTextarea;
