import { FC, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

import { useAppSelector } from "@/app/store";
import GoBackNav from "@/components/GoBackNav";
import Tooltip from "@/components/Tooltip";
import Popover from "@/components/Popover";
import User from "@/components/User";
import MessageSearch from "@/components/MessageSearch";
import FavIcon from "@/assets/icons/bookmark.svg";
import useFavMessage from "@/hooks/useFavMessage";
import FavList from "../FavList";
import Layout from "../Layout";
import { VirtualMessageFeedHandle } from "../Layout/VirtualMessageFeed";
import { shallowEqual } from "react-redux";

type Props = {
  uid: number;
  dropFiles?: File[];
};
const DMChat: FC<Props> = ({ uid = 0, dropFiles }) => {
  const navigate = useNavigate();
  const feedRef = useRef<VirtualMessageFeedHandle>(null);
  const currUser = useAppSelector((store) => store.users.byId[uid], shallowEqual);

  useEffect(() => {
    if (!currUser) {
      // user不存在了 回首页
      navigate("/chat");
    }
  }, [currUser]);

  if (!currUser) return null;

  const handleLocate = (mid: number) => {
    feedRef.current?.scrollToMessage(mid);
  };

  const { favorites } = useFavMessage({ uid });
  const favCount = favorites.length;

  return (
    <Layout
      to={uid}
      context="dm"
      dropFiles={dropFiles}
      feedRef={feedRef}
      header={
        <header className="box-border px-5 h-[60px] flex items-center justify-center md:justify-between bg-muted/60 dark:bg-secondary shadow-[inset_0_-1px_0_rgb(0_0_0_/_25%)]">
          <GoBackNav />
          <User interactive={false} uid={currUser.uid} enableNavToSetting={true} />
          <div className="flex items-center gap-1">
            <MessageSearch context="dm" id={uid} onLocate={handleLocate} />
            <Tooltip tip="Saved Items" placement="bottom">
              <Popover
                placement="bottom-end"
                offset={10}
                content={<FavList uid={uid} />}
              >
                <button className="relative p-1.5 hover:bg-muted dark:hover:bg-secondary rounded hidden md:block">
                  {favCount > 0 ? (
                    <span className="absolute -top-1 -right-1 flex-center w-4 h-4 rounded-full bg-primary-400 text-white font-bold text-[10px]">
                      {favCount}
                    </span>
                  ) : null}
                  <FavIcon className="w-5 h-5 fill-muted-foreground" />
                </button>
              </Popover>
            </Tooltip>
          </div>
        </header>
      }
    />
  );
};
export default DMChat;
