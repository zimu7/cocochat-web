import React from "react";
import Spinner from "./Spinner";

type Props = {
  title: string;
  desc: string;
  toggler?: React.ReactNode;
  children?: React.ReactNode;
  loading?: boolean;
};

const SettingBlock = ({ toggler, title, desc, children, loading }: Props) => {
  if (!title) return <div className="min-w-56">{children}</div>;
  return (
    <div className="text-sm w-full">
      <div className="flex justify-between mb-2">
        <div className="">
          <p className="text-foreground dark:text-foreground font-semibold flex items-center gap-2">
            {title}
            {loading && <Spinner type="ring" size={14} lineWeight={2} className="text-muted-foreground" />}
          </p>
          <p className="flex justify-between w-full text-muted-foreground text-xs">{desc}</p>
        </div>
        {toggler && <div className="flex items-center gap-2">{toggler}</div>}
      </div>
      {children}
    </div>
  );
};

export default SettingBlock;
