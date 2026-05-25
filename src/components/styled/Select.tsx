import { FC, useState } from "react";
import { useTranslation } from "react-i18next";

import IconArrow from "@/assets/icons/arrow.down.svg";
import IconSelect from "@/assets/icons/check.sign.svg";
import Popover from "../Popover";

export interface Option {
  icon?: string;
  title: string;
  value: string;
  selected: boolean;
  underline?: boolean;
}

interface Props {
  options: Option[];
  updateSelect: null | ((option: Partial<Option>) => void);
  current: null | Partial<Option>;
}

const Select: FC<Props> = ({ options = [], updateSelect = null, current = null }) => {
  const { t } = useTranslation();
  const [optionsVisible, setOptionsVisible] = useState(false);
  const [curr, setCurr] = useState<Partial<Option> | null>(null);
  const toggleVisible = () => {
    setOptionsVisible((prev) => !prev);
  };
  const handleSelect = (data: Partial<Option>) => {
    setCurr(data);
    setOptionsVisible(false);
    if (updateSelect) {
      updateSelect(data);
    }
  };

  return (
    <Popover
      placement="bottom"
      open={optionsVisible}
      onOpenChange={setOptionsVisible}
      content={
        <ul className="context-menu">
          {options.map(({ title, value, selected, underline }) => {
            return (
              <li
                onClick={selected ? undefined : handleSelect.bind(null, { title, value })}
                className={`item sb ${underline ? "bottom_line" : ""}`}
                data-disabled={selected}
                key={value}
              >
                {title}
                {selected && <IconSelect className="icon" />}
              </li>
            );
          })}
        </ul>
      }
    >
      <div
        className="cursor-pointer select-none border border-slate-200 dark:border-slate-800 p-2 flex items-center gap-2"
        onClick={toggleVisible}
      >
        <span className="text-sm text-gray-500 dark:text-gray-200 min-w-[120px]">
          {(current !== null ? current : curr)?.title || t("action.select")}
        </span>
        <IconArrow className="!w-5 !h-5" />
      </div>
    </Popover>
  );
};

export default Select;
