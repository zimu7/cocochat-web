import { FC, ReactElement, useState } from "react";
import { useTranslation } from "react-i18next";

import useUserOperation from "@/hooks/useUserOperation";
import ContextMenu, { ContextMenuPrimitive, Item } from "../ContextMenu";
import NicknameModal from "../NicknameModal";

interface Props {
  enable?: boolean;
  uid: number;
  cid?: number;
  children: ReactElement;
}

const UserContextMenu: FC<Props> = ({ enable = false, uid, cid, children }) => {
  const [remarkVisible, setRemarkVisible] = useState(false);
  const { t } = useTranslation("member");
  const { t: chatTran } = useTranslation("chat");
  const {
    blockThisContact,
    removeFromContact,
    copyEmail,
    canCopyEmail,
    startChat,
    canRemove,
    canRemoveFromContact,
    canBlock,
    canRemoveFromChannel,
    removeFromChannel,
    removeUser,
    isAdmin,
    canUpdateRole,
    updateRole,
  } = useUserOperation({
    uid,
    cid,
  });

  if (!enable) return <>{children}</>;

  return (
    <>
      <NicknameModal uid={uid} visible={remarkVisible} updateVisible={setRemarkVisible} />
      <ContextMenuPrimitive.Root>
        <ContextMenuPrimitive.Trigger asChild>
          {children}
        </ContextMenuPrimitive.Trigger>
        <ContextMenuPrimitive.Portal>
          <ContextMenuPrimitive.Content className="z-50">
            <ContextMenu
              items={
                [
                  {
                    title: t("send_msg"),
                    handler: startChat,
                  },
                  {
                    title: chatTran("remark"),
                    handler: setRemarkVisible.bind(null, true),
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
                    danger: true,
                    title: t("remove_from_channel"),
                    handler: removeFromChannel,
                  },
                  canRemoveFromContact && {
                    danger: true,
                    title: t("remove_from_contact"),
                    handler: removeFromContact,
                  },
                  canBlock && {
                    danger: true,
                    title: chatTran("block"),
                    handler: blockThisContact,
                  },
                  canRemove && {
                    danger: true,
                    title: t("remove"),
                    handler: removeUser,
                  },
                ].filter(Boolean) as Item[]
              }
            />
          </ContextMenuPrimitive.Content>
        </ContextMenuPrimitive.Portal>
      </ContextMenuPrimitive.Root>
    </>
  );
};

export default UserContextMenu;
