import { FC, useRef, useState } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import i18n from "@/i18n";
import { useDispatch } from "react-redux";
import clsx from "clsx";

import { updateSelectMessages } from "@/app/slices/ui";
import { ChatContext } from "@/types/common";
import useFavMessage from "@/hooks/useFavMessage";
import useSendMessage from "@/hooks/useSendMessage";
import IconBookmark from "@/assets/icons/bookmark.add.svg";
import IconDelete from "@/assets/icons/delete.svg";
import editIcon from "@/assets/icons/edit.svg?url";
import IconForward from "@/assets/icons/forward.svg";
import moreIcon from "@/assets/icons/more.svg?url";
import IconPin from "@/assets/icons/pin.svg";
import reactIcon from "@/assets/icons/reaction.svg?url";
import replyIcon from "@/assets/icons/reply.svg?url";
import IconSelect from "@/assets/icons/select.svg";
import ContextMenu, { Item } from "../ContextMenu";
import Tooltip from "../Tooltip";
import Popover from "../Popover";
import ReactionPicker from "./ReactionPicker";
import useMessageOperation from "./useMessageOperation";

type Props = {
  isSelf: boolean;
  context: ChatContext;
  contextId: number;
  mid: number;
  toggleEditMessage: () => void;
};
const Commands: FC<Props> = ({
  isSelf,
  context = "dm",
  contextId = 0,
  mid = 0,
  toggleEditMessage
}) => {
  const { t } = useTranslation();
  const {
    canDelete,
    canReply,
    canEdit,
    canPin,
    unPin,
    pinned,
    toggleDeleteModal,
    toggleForwardModal,
    togglePinModal,
    PinModal,
    DeleteModal,
    ForwardModal
  } = useMessageOperation({ mid, context, contextId });
  const { setReplying } = useSendMessage({ context, to: contextId });
  const { addFavorite, isFavorited } = useFavMessage({
    cid: context == "channel" ? contextId : null
  });
  const dispatch = useDispatch();
  const [popoverVisible, setPopoverVisible] = useState(false);
  const [reactionOpen, setReactionOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const cmdsRef = useRef(null);
  const handleReply = () => {
    if (contextId) {
      setReplying(mid);
    }
    setMoreOpen(false);
  };

  const handlePopoverVisible = (visible = true) => {
    setPopoverVisible(visible);
  };
  const handleSelect = (mid: number) => {
    dispatch(updateSelectMessages({ context, id: contextId, data: mid }));
    setMoreOpen(false);
  };
  const handleUnpin = () => {
    setMoreOpen(false);
    unPin(mid);
  };
  const handleAddFav = async () => {
    const faved = isFavorited(mid);
    if (faved) {
      toast.success(i18n.t("tip.favorited"));
      return;
    }
    const added = await addFavorite(mid);
    if (added) {
      toast.success(i18n.t("tip.added_favorites"));
    } else {
      toast.error(i18n.t("tip.added_favorites_failed"));
    }
  };
  const cmdClass = `flex cursor-pointer p-1 md:hover:bg-gray-100 md:dark:hover:bg-gray-800`;
  return (
    <>
      <ul
        ref={cmdsRef}
        className={clsx(
          `bg-white dark:bg-gray-900 rounded-md z-[999] absolute top-0 -translate-y-1/2 flex items-center border border-solid border-black/10 invisible group-hover:visible`,
          popoverVisible && "!visible",
          isSelf ? "left-2.5" : "right-2.5"
        )}
      >
        <Popover
          placement="left-start"
          open={reactionOpen}
          onOpenChange={(open) => {
            setReactionOpen(open);
            handlePopoverVisible(open);
          }}
          content={<ReactionPicker mid={mid} hidePicker={() => setReactionOpen(false)} />}
        >
          <li className={cmdClass}>
            <Tooltip placement="top" tip={t("action.add_reaction")}>
              <img src={reactIcon} className="toggler w-6 h-6" alt="icon emoji" />
            </Tooltip>
          </li>
        </Popover>
        {canEdit && (
          <li className={cmdClass} onClick={toggleEditMessage}>
            <Tooltip placement="top" tip={t("action.edit")}>
              <img src={editIcon} className="w-6 h-6" alt="icon edit" />
            </Tooltip>
          </li>
        )}
        {canReply && (
          <li className={cmdClass} onClick={handleReply}>
            <Tooltip placement="top" tip={t("action.reply")}>
              <img src={replyIcon} className="w-6 h-6" alt="icon reply" />
            </Tooltip>
          </li>
        )}
        <li className={cmdClass} onClick={handleAddFav}>
          <Tooltip placement="top" tip={t("action.add_to_fav")}>
            <IconBookmark className="fill-slate-500 w-6 h-6" />
          </Tooltip>
        </li>
        <Popover
          placement="left-start"
          open={moreOpen}
          onOpenChange={(open) => {
            setMoreOpen(open);
            handlePopoverVisible(open);
          }}
          content={
            <ContextMenu
              hideMenu={() => setMoreOpen(false)}
              items={
                [
                  canPin && {
                    title: pinned ? t("action.unpin") : t("action.pin"),
                    icon: <IconPin className="icon" />,
                    handler: pinned ? handleUnpin : togglePinModal
                  },
                  {
                    title: t("action.forward"),
                    icon: <IconForward className="icon" />,
                    handler: toggleForwardModal
                  },
                  {
                    title: t("action.select"),
                    icon: <IconSelect className="icon" />,
                    handler: handleSelect.bind(null, mid)
                  },
                  canDelete && {
                    title: t("action.remove"),
                    danger: true,
                    icon: <IconDelete className="icon" />,
                    handler: toggleDeleteModal
                  }
                ].filter(Boolean) as Item[]
              }
            />
          }
        >
          <li className="flex cursor-pointer p-1 md:hover:bg-gray-100 md:dark:hover:bg-gray-800">
            <Tooltip placement="top" tip={t("more")}>
              <img src={moreIcon} alt="icon more" />
            </Tooltip>
          </li>
        </Popover>
      </ul>
      {PinModal}
      {ForwardModal}
      {DeleteModal}
    </>
  );
};
export default Commands;
