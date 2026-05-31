import React from "react";
import { NavLink, useLocation, useMatch } from "react-router-dom";
import clsx from "clsx";

import ChatIcon from "@/assets/icons/chat.svg";
import SettingIcon from "@/assets/icons/setting.svg";
import UserIcon from "@/assets/icons/user.svg";
import { useAppSelector } from "../../app/store";
import { shallowEqual } from "react-redux";

// type Props = {}

const MobileNavs = () => {
  const isHomePath = useMatch(`/`);
  const { pathname } = useLocation();
  const isChatHomePath = useMatch(`/chat`);
  const isDMChat = useMatch(`/chat/dm/:user_id`);
  // const isSettingPage = useMatch(`/setting`);
  const isChannelChat = useMatch(`/chat/channel/:channel_id`);
  const { chat: chatPath, user: userPath } = useAppSelector(
    (store) => store.ui.rememberedNavs,
    shallowEqual
  );

  const linkClass = `flex`;
  const isChatPage = isHomePath || pathname.startsWith("/chat");
  const isChattingPage = !!isDMChat || !!isChannelChat;
  // console.log("rrr", isDMChat, isChannelChat);

  // 有点绕
  const chatNav = isChatHomePath ? "/chat" : chatPath || "/chat";
  const userNav = userPath || "/users";
  return (
    <ul
      className={clsx(
        "flex justify-around p-3 fixed bottom-0 left-0 w-full bg-muted dark:bg-card md:hidden transition-transform duration-300 ease-in-out pb-[env(safe-area-inset-bottom)]",
        isChattingPage ? "translate-y-full" : "translate-y-0"
      )}
    >
      <li>
        <NavLink className={() => `${linkClass}`} to={chatNav}>
          {({ isActive }) => {
            const active = isActive || isChatPage;
            return (
              <div className="flex flex-col gap-1 items-center">
                <ChatIcon className={!active ? "fill-muted-foreground" : "fill-primary-500"} />
                <span className={clsx("text-xs", !active ? "text-muted-foreground" : "text-primary-500")}>
                  Chats
                </span>
              </div>
            );
          }}
        </NavLink>
      </li>
      <li>
        <NavLink className={() => `${linkClass}`} to={userNav}>
          {({ isActive: active }) => {
            return (
              <div className="flex flex-col gap-1 items-center">
                <UserIcon className={!active ? "fill-muted-foreground" : "fill-primary-500"} />
                <span className={clsx("text-xs", !active ? "text-muted-foreground" : "text-primary-500")}>
                  Contacts
                </span>
              </div>
            );
          }}
        </NavLink>
      </li>
      <li>
        <NavLink className={() => `${linkClass}`} to={"/setting"}>
          {({ isActive: active }) => {
            return (
              <div className="flex flex-col gap-1 items-center">
                <SettingIcon
                  className={clsx("w-6 h-6", !active ? "fill-muted-foreground" : "fill-primary-500")}
                />
                <span className={clsx("text-xs", !active ? "text-muted-foreground" : "text-primary-500")}>
                  Settings
                </span>
              </div>
            );
          }}
        </NavLink>
      </li>
    </ul>
  );
};

export default MobileNavs;
