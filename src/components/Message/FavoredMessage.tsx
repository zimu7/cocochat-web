import { FC, ReactElement, useEffect, useState } from "react";

import useFavMessage from "@/hooks/useFavMessage";
import Avatar from "../Avatar";
import renderContent from "./renderContent";

type Props = {
  id?: string;
};
const FavoredMessage: FC<Props> = ({ id = "" }) => {
  const { favorites } = useFavMessage({});
  const [msgs, setMsgs] = useState<ReactElement | null>(null);

  useEffect(() => {
    const current = favorites.find((f) => f.id == id);
    const { messages } = current || {};
    if (!messages) return;
    const favorite_mids = messages.map(({ from_mid }) => +from_mid) || [];

    setMsgs(
      <div
        data-favorite-mids={favorite_mids.join(",")}
        className="favorite flex flex-col rounded-lg bg-[#f0f1f3] dark:bg-[#1e2028] border border-border shadow-sm p-1"
      >
        <div className="list">
          {messages.map((msg, idx) => {
            const { user = {}, download, content, content_type, properties, thumbnail } = msg;
            return (
              <div
                className="w-full relative flex items-start gap-3 p-2 my-2 rounded-lg"
                key={idx}
              >
                <div className="rounded-full overflow-hidden w-10 h-10 shrink-0">
                  <Avatar
                    width={40}
                    height={40}
                    src={user.avatar}
                    name={user.name}
                  />
                </div>
                <div className="w-full flex flex-col items-start gap-1 text-sm">
                  <div className="flex items-center gap-2 font-semibold">
                    <span className="text-muted-foreground">
                      {user?.name || "Deleted User"}
                    </span>
                  </div>
                  <div className="select-text text-foreground break-all whitespace-pre-wrap dark:text-white">
                    {renderContent({
                      download,
                      content,
                      content_type,
                      properties,
                      thumbnail
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }, [favorites, id]);

  if (!id) return null;

  return msgs;
};

export default FavoredMessage;
