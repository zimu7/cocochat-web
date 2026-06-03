import { FC } from "react";
import { useTranslation } from "react-i18next";

import User from "@/components/User";
import useFilteredUsers from "@/hooks/useFilteredUsers";
import CheckSign from "@/assets/icons/check.sign.svg";
import Search from "../Search";

type Props = {
  select: number;
  updateFilter: (param: { uid?: number }) => void;
};
const From: FC<Props> = ({ select = "", updateFilter }) => {
  const { t } = useTranslation("file");
  const { input, updateInput, users } = useFilteredUsers();
  const handleClick = (uid?: number) => {
    updateFilter({ from: uid });
  };

  return (
    <div className="rounded-lg p-1 pt-0 bg-white dark:bg-card overflow-auto max-h-[300px] flex flex-col items-start relative drop-shadow">
      <div className="bg-white dark:bg-card sticky top-0 z-10 w-full">
        <Search embed={true} value={input} updateSearchValue={updateInput} />
      </div>
      <ul className="w-full flex flex-col">
        <li
          className="relative cursor-pointer p-2.5 font-semibold text-sm text-muted-foreground"
          onClick={handleClick.bind(null, undefined)}
        >
          {t("any_from")}
          {!select && <CheckSign className="absolute right-1.5 top-1/2 -translate-y-1/2" />}
        </li>
        {users.map(({ uid }) => {
          return (
            <li
              key={uid}
              className="relative flex items-center gap-2 justify-between cursor-pointer"
              onClick={handleClick.bind(null, uid)}
            >
              <div className="flex-1 min-w-0">
                <User uid={uid} interactive={false} />
              </div>
              {select == uid && <CheckSign className="shrink-0" />}
            </li>
          );
        })}
      </ul>
    </div>
  );
};
export default From;
