import { FC, ReactElement, useState } from "react";
import { useTranslation } from "react-i18next";

import useUserOperation from "@/hooks/useUserOperation";
import { useAppSelector } from "@/app/store";
import ContextMenu, { ContextMenuPrimitive, Item } from "../ContextMenu";
import NicknameModal from "../NicknameModal";
import RemoveConfirmModal from "../RemoveConfirmModal";

interface Props {
  enable?: boolean;
  uid: number;
  cid?: number;
  children: ReactElement;
}

const UserContextMenu: FC<Props> = ({ enable = false, uid, cid, children }) => {
  const [remarkVisible, setRemarkVisible] = useState(false);
  const [removeTarget, setRemoveTarget] = useState<{
    uid: number;
    name: string;
    type: "server" | "channel";
  } | null>(null);
  const { t } = useTranslation("member");
  const { t: chatTran } = useTranslation("chat");
  const user = useAppSelector((store) => store.users.byId[uid]);
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
    isAdmin,
    canUpdateRole,
    updateRole
  } = useUserOperation({
    uid,
    cid
  });

  if (!enable) return <>{children}</>;

  return (
    <>
      <NicknameModal uid={uid} visible={remarkVisible} updateVisible={setRemarkVisible} />
      <ContextMenuPrimitive.Root>
        <ContextMenuPrimitive.Trigger asChild>{children}</ContextMenuPrimitive.Trigger>
        <ContextMenuPrimitive.Portal>
          <ContextMenuPrimitive.Content className="z-50">
            <ContextMenu
              items={
                [
                  {
                    title: t("send_msg"),
                    handler: startChat
                  },
                  {
                    title: chatTran("remark"),
                    handler: setRemarkVisible.bind(null, true)
                  },
                  canCopyEmail && {
                    title: t("copy_email"),
                    handler: copyEmail
                  },
                  canUpdateRole && {
                    title: t("roles"),
                    handler: updateRole,
                    subs: [
                      {
                        title: t("set_normal"),
                        checked: !isAdmin,
                        handler: updateRole
                      },
                      {
                        title: t("set_admin"),
                        checked: isAdmin,
                        handler: updateRole
                      }
                    ]
                  },
                  canRemoveFromChannel && {
                    danger: true,
                    title: t("remove_from_channel"),
                    handler: () => setRemoveTarget({ uid, name: user?.name || "", type: "channel" })
                  },
                  canRemoveFromContact && {
                    danger: true,
                    title: t("remove_from_contact"),
                    handler: removeFromContact
                  },
                  canBlock && {
                    danger: true,
                    title: chatTran("block"),
                    handler: blockThisContact
                  },
                  canRemove && {
                    danger: true,
                    title: t("remove"),
                    handler: () => setRemoveTarget({ uid, name: user?.name || "", type: "server" })
                  }
                ].filter(Boolean) as Item[]
              }
            />
          </ContextMenuPrimitive.Content>
        </ContextMenuPrimitive.Portal>
      </ContextMenuPrimitive.Root>
      {removeTarget && (
        <RemoveConfirmModal
          uid={removeTarget.uid}
          name={removeTarget.name}
          type={removeTarget.type}
          cid={cid}
          closeModal={() => setRemoveTarget(null)}
        />
      )}
    </>
  );
};

export default UserContextMenu;
