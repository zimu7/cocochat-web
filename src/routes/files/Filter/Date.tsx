import { FC } from "react";
import { useTranslation } from "react-i18next";

import CheckSign from "@/assets/icons/check.sign.svg";

export const DateKeys: Record<string, string> = {
  Day1: "last_24h",
  Day7: "last_7d",
  Day30: "last_30d",
  Day90: "last_3m",
  Day180: "last_6m",
};

type Props = {
  select: number;
  updateFilter: (param: { creation_time_type?: string }) => void;
};
const DateFilter: FC<Props> = ({ select = "", updateFilter }) => {
  const { t } = useTranslation("file");
  const handleClick = (dur?: string) => {
    updateFilter({ creation_time_type: dur });
  };

  return (
    <div className="p-3 bg-white dark:bg-gray-800 min-w-[200px] overflow-auto rounded-lg flex flex-col items-start relative drop-shadow">
      <ul className="w-full flex flex-col gap-4">
        <li
          className="relative cursor-pointer flex items-center gap-4 text-gray-500 dark:text-gray-300 font-semibold text-sm"
          onClick={handleClick.bind(null, undefined)}
        >
          {t("any_time")}
          {!select && <CheckSign className="absolute right-0 top-1/2 -translate-y-1/2" />}
        </li>
        {Object.entries(DateKeys).map(([_key, tKey]) => {
          return (
            <li
              key={_key}
              className="relative cursor-pointer flex items-center gap-4 text-gray-500 dark:text-gray-300 font-semibold text-sm"
              onClick={handleClick.bind(null, _key)}
            >
              {t(tKey)}
              {select == _key && (
                <CheckSign className="absolute right-0 -top-1/2 -translate-y-1/2" />
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
};
export default DateFilter;
