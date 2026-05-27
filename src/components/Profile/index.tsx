import { FC, memo, useState } from "react";
import { useTranslation } from "react-i18next";
import { NavLink } from "react-router-dom";
import clsx from "clsx";

import { useAppSelector } from "@/app/store";
import useUserOperation from "@/hooks/useUserOperation";
import IconMessage from "@/assets/icons/message.svg";
import IconMore from "@/assets/icons/more.svg";
import Avatar from "../Avatar";
import Popover from "../Popover";
import ContextMenu, { Item } from "../ContextMenu";
import { shallowEqual } from "react-redux";
import RemoveConfirmModal from "../ManageMembers/RemoveConfirmModal";
import Remark from "./remark";
import NicknameModal from "../NicknameModal";

interface Props {
  uid: number;
  type?: "embed" | "card";
  cid?: number;
  onClose?: () => void;
  onRemark?: () => void;
}

const Profile: FC<Props> = ({ uid, type = "embed", cid, onClose, onRemark }) => {
  const [remarkVisible, setRemarkVisible] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [removeTarget, setRemoveTarget] = useState<{
    uid: number;
    name: string;
  } | null>(null);
  const { t } = useTranslation("member");
  const { t: chatTrans } = useTranslation("chat");
  const { t: ct } = useTranslation();
  const {
    canDM,
    canCopyEmail,
    copyEmail,
    startCall,
    removeFromChannel,
    canRemoveFromChannel,
    canRemove,
    isAdmin,
    canUpdateRole,
    updateRole,
  } = useUserOperation({ uid, cid });
  const data = useAppSelector((store) => store.users.byId[uid], shallowEqual);
  if (!data) return null;
  // console.log("profile", data);
  const {
    name,
    email,
    avatar,
    // introduction = "This guy has nothing to introduce",
  } = data;
  const isCard = type == "card";
  const canRemoveFromServer = !isCard && canRemove;
  const hasMore = email || canRemoveFromChannel || canRemoveFromServer;
  const iconClass = `cursor-pointer flex flex-col items-center gap-1 rounded-lg w-32 text-primary-400 bg-gray-50 hover:bg-gray-100 dark:bg-gray-800 text-sm pt-3.5 pb-3`;
  const containerClass = clsx(
    `flex-center flex-col gap-1 z-[99] mt-20 select-none`,
    isCard ? "p-4 w-[280px] bg-white dark:bg-gray-800 drop-shadow rounded-md" : "md:w-[432px]"
  );

  return (
    <>
      <NicknameModal uid={uid} visible={remarkVisible} updateVisible={setRemarkVisible} />
      <div className={containerClass}>
        <Avatar
          width={80}
          height={80}
          className="rounded-full w-20 h-20 object-cover"
          src={avatar}
          name={name}
        />
        <Remark uid={uid} />
        <h2 className="text-lg select-text font-bold text-gray-900 dark:text-white">
          {name} {canDM && <span className="font-normal text-gray-500">#{uid}</span>}
        </h2>
        {canCopyEmail && (
          <span className="text-sm text-gray-400 dark:text-gray-200 select-text">{email}</span>
        )}
        {/* <p className="intro">{introduction}</p> */}
        {canDM && (
          <ul
            className={clsx(
              "mt-6 flex flex-col md:flex-row items-center gap-2",
              isCard && "pb-0.5"
            )}
          >
            <NavLink to={`/chat/dm/${uid}`}>
              <li className={`${iconClass} icon chat`}>
                <IconMessage />
                <span>{t("send_msg")}</span>
              </li>
            </NavLink>
            <Popover
              disabled={!hasMore}
              open={moreOpen}
              onOpenChange={setMoreOpen}
              placement="right"
              content={
                <ContextMenu
                  hideMenu={() => setMoreOpen(false)}
                  items={
                    [
                      {
                        title: chatTrans("remark"),
                        handler: () => {
                          setMoreOpen(false);
                          if (onRemark) {
                            onRemark();
                          } else {
                            onClose?.();
                            setRemarkVisible(true);
                          }
                        },
                      },
                      canCopyEmail && {
                        title: t("copy_email"),
                        handler: copyEmail,
                      },
                      canUpdateRole && {
                        title: t("roles"),
                        handler: updateRole,
                        subs: [
                          {
                            title: t("set_normal"),
                            checked: !isAdmin,
                            handler: updateRole,
                          },
                          {
                            title: t("set_admin"),
                            checked: isAdmin,
                            handler: updateRole,
                          },
                        ],
                      },
                      canRemoveFromChannel && {
                        title: t("remove_from_channel"),
                        danger: true,
                        handler: removeFromChannel,
                      },
                      canRemoveFromServer && {
                        title: t("remove"),
                        handler: () => setRemoveTarget({ uid, name }),
                        danger: true,
                      },
                    ].filter(Boolean) as Item[]
                  }
                />
              }
            >
              <li className={`${iconClass} icon ${hasMore ? "" : "text-gray-500"}`}>
                <IconMore className={hasMore ? "fill-primary-500" : ""} />
                <span>{ct("more")}</span>
              </li>
            </Popover>
          </ul>
        )}
      </div>
      {removeTarget && (
        <RemoveConfirmModal
          uid={removeTarget.uid}
          name={removeTarget.name}
          type="server"
          closeModal={() => setRemoveTarget(null)}
        />
      )}
    </>
  );
};

export default memo(Profile);
