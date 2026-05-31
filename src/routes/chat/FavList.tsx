import { FC, FormEvent } from "react";
import { useTranslation } from "react-i18next";

import FavoredMessage from "@/components/Message/FavoredMessage";
import useFavMessage from "@/hooks/useFavMessage";
import IconClose from "@/assets/icons/close.svg";
import IconSurprise from "@/assets/icons/emoji.surprise.svg";

type Props = { cid?: number; uid?: number };
const FavList: FC<Props> = ({ cid = null, uid = null }) => {
  const { t } = useTranslation("chat");
  const { favorites, removeFavorite } = useFavMessage({ cid, uid });
  const handleRemove = (evt: FormEvent<HTMLButtonElement>) => {
    const { id = "" } = evt.currentTarget.dataset;
    removeFavorite(id);
  };
  const noFavs = favorites.length == 0;
  return (
    <div className="p-4 drop-shadow-md overflow-y-scroll min-w-[320px] md:min-w-[486px] md:max-h-[90vh] rounded-xl bg-muted/95 dark:bg-card">
      <h4 className=" text-foreground dark:text-muted-foreground mb-4 font-semibold">
        {t("fav_msg")}({favorites.length})
      </h4>
      {noFavs ? (
        <div className="flex flex-col items-center gap-2 w-full p-4">
          <IconSurprise />
          <div className="w-60 font-semibold text-muted-foreground dark:text-muted-foreground text-center">
            {t("fav_empty_tip")}
          </div>
        </div>
      ) : (
        <ul className="flex flex-col gap-2">
          {favorites.map(({ id }) => {
            return (
              <li
                key={id}
                className="group relative border border-solid border-slate-100 dark:border-slate-600 rounded-md "
              >
                <FavoredMessage id={id} />
                <div className="invisible group-hover:visible flex items-center gap-1 absolute top-1 right-1 p-1 border border-solid border-black/10 dark:border-border rounded-md">
                  <button
                    className="flex bg-none border-none"
                    data-id={id}
                    onClick={handleRemove}
                  >
                    <IconClose className="fill-slate-900 dark:fill-slate-300" />
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};
export default FavList;
