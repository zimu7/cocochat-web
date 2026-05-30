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
  
  const handleLocate = (mid: number) => {
    feedRef.current?.scrollToMessage(mid);
  };
  
  const { favorites } = useFavMessage({ uid });
  const favCount = favorites.length;

  if (!currUser) return null;
  return (
    <Layout
      to={uid}
      context="dm"
      dropFiles={dropFiles}
      feedRef={feedRef}
      aside={
        <ul className="flex flex-col gap-6">
          <Tooltip tip="Saved Items" placement="left">
            <Popover
              placement="left-start"
              offset={20}
              content={<FavList uid={uid} />}
            >
              <li className={`relative cursor-pointer fav`}>
                {favCount > 0 ? (
                  <span className="absolute -top-2 -right-2 flex-center w-4 h-4 rounded-full bg-primary-400 text-white font-bold text-[10px]">
                    {favCount}
                  </span>
                ) : null}
                <FavIcon className="fill-gray-500" />
              </li>
            </Popover>
          </Tooltip>
        </ul>
      }
      header={
        <header className="box-border px-5 py-1 flex items-center justify-center md:justify-between shadow-[inset_0_-1px_0_rgb(0_0_0_/_10%)]">
          <GoBackNav />
          <User interactive={false} uid={currUser.uid} enableNavToSetting={true} />
          <MessageSearch context="dm" id={uid} onLocate={handleLocate} />
        </header>
      }
    />
  );
};
export default DMChat;
