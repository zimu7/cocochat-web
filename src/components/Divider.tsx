import { FC } from "react";
import clsx from "clsx";

interface Props {
  content: string;
  className?: string;
}

const Divider: FC<Props> = ({ content, className = "" }) => {
  return (
    <div
      className={clsx(
        "or relative border-none h-[1px] bg-secondary dark:bg-gray-500 my-6 overflow-visible",
        className
      )}
    >
      <span className="p-1 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-xs text-muted-foreground dark:text-muted-foreground font-semibold bg-white dark:bg-card">
        {content}
      </span>
    </div>
  );
};

export default Divider;
