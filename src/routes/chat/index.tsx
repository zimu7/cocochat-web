import { memo, useState } from "react";
import { useMatch, useParams } from "react-router-dom";
import clsx from "clsx";

import { useAppSelector } from "@/app/store";
import BlankPlaceholder from "@/components/BlankPlaceholder";
import ChannelModal from "@/components/ChannelModal";
import ErrorCatcher from "@/components/ErrorCatcher";
import Server from "@/components/Server";
import UsersModal from "@/components/UsersModal";
import { useSwipeGesture } from "@/hooks/useSwipeGesture";
import ChannelChat from "./ChannelChat";
import DMChat from "./DMChat";
import GuestBlankPlaceholder from "./GuestBlankPlaceholder";
import GuestChannelChat from "./GuestChannelChat";
import GuestSessionList from "./GuestSessionList";
import SessionList from "./SessionList";
import { shallowEqual } from "react-redux";

function ChatPage() {
  const isHomePath = useMatch(`/`);
  const isChatHomePath = useMatch(`/chat`);
  const [sessionListVisible, setSessionListVisible] = useState(false);
  const [channelModalVisible, setChannelModalVisible] = useState(false);
  const [usersModalVisible, setUsersModalVisible] = useState(false);
  const { channel_id = 0, user_id = 0 } = useParams();
  const aside = useAppSelector(
    (store) =>
      channel_id
        ? store.footprint.channelAsides[+channel_id]
        : null,
    shallowEqual
  );
  const isGuest = useAppSelector((store) => store.authData.guest, shallowEqual);
  const sessionUids = useAppSelector((store) => store.userMessage.ids, shallowEqual);
  const toggleUsersModalVisible = () => {
    setUsersModalVisible((prev) => !prev);
  };
  const toggleChannelModalVisible = () => {
    setChannelModalVisible((prev) => !prev);
  };
  const toggleSessionList = () => {
    setSessionListVisible((prev) => !prev);
  };
  const tmpSession =
    user_id == 0
      ? undefined
      : sessionUids.findIndex((i) => i == +user_id) == -1
      ? {
          mid: 0,
          unread: 0,
          id: +user_id,
          type: "dm" as const
        }
      : undefined;
  const placeholderVisible = channel_id == 0 && user_id == 0;
  const channelChatVisible = channel_id != 0;
  const dmChatVisible = user_id != 0;
  const isMainPath = isHomePath || isChatHomePath;

  const { onTouchStart, onTouchEnd } = useSwipeGesture({
    onSwipeRight: () => !sessionListVisible && setSessionListVisible(true),
    onSwipeLeft: () => sessionListVisible && setSessionListVisible(false),
  });

  return (
    <ErrorCatcher>
      {channelModalVisible && (
        <ChannelModal closeModal={toggleChannelModalVisible} personal={true} />
      )}
      {usersModalVisible && <UsersModal closeModal={toggleUsersModalVisible} />}
      <div
        className={clsx(
          `flex h-screen md:h-full md:pr-1`,
          isGuest ? "guest-container md:px-1" : "md:pr-12"
        )}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        <div
          onClick={toggleSessionList}
          className={clsx(
            "z-30 fixed top-0 left-4 w-screen h-screen bg-black/50 backdrop-blur-sm transition-opacity duration-300",
            sessionListVisible ? "opacity-100" : "opacity-0 pointer-events-none"
          )}
        ></div>
        <div
          className={clsx(
            "left-container flex-col md:rounded-l-2xl w-full h-screen md:h-full md:max-w-[250px] md:min-w-[268px] shadow-[rgb(0_0_0_/_25%)_-1px_0px_0px_inset] transition-transform duration-300 ease-in-out",
            isMainPath ? "flex" : "hidden md:flex",
            !isMainPath && !sessionListVisible && "-translate-x-full md:translate-x-0"
          )}
        >
          <Server readonly={isGuest} />
          {isGuest ? <GuestSessionList /> : <SessionList tempSession={tmpSession} />}
        </div>
        <div
          className={clsx(
            `right-container w-full`,
            placeholderVisible && "h-full flex-center",
            isMainPath && "hidden md:flex"
          )}
        >
          {placeholderVisible && (isGuest ? <GuestBlankPlaceholder /> : <BlankPlaceholder />)}
          {channelChatVisible &&
            (isGuest ? <GuestChannelChat cid={+channel_id} /> : <ChannelChat cid={+channel_id} />)}
          {dmChatVisible && <DMChat uid={+user_id} />}
        </div>
      </div>
    </ErrorCatcher>
  );
}
export default memo(ChatPage);
