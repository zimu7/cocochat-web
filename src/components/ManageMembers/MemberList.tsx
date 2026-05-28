import { FC, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { ViewportList } from "react-viewport-list";
import Search from "@/routes/users/Search";

import { useUpdateUserMutation } from "@/app/services/user";
import { useAppSelector } from "@/app/store";
import useFilteredUsers from "@/hooks/useFilteredUsers";
import useUserOperation from "@/hooks/useUserOperation";
import IconArrowDown from "@/assets/icons/arrow.down.mini.svg";
import IconCheck from "@/assets/icons/check.sign.svg";
import IconMore from "@/assets/icons/more.svg";
import IconOwner from "@/assets/icons/owner.svg";
import User from "../User";
import Popover from "../Popover";
import { shallowEqual } from "react-redux";
// import ViewPassword from "./ViewPassword";
import UpdatePassword from "./UpdatePassword";
import RemoveConfirmModal from "./RemoveConfirmModal";
import NameWithRemark from "../NameWithRemark";

type RemoveTarget = {
  uid: number;
  name: string;
  type: "server" | "channel";
};

interface Props {
  cid?: number;
}
const MemberList: FC<Props> = ({ cid }) => {
  const ref = useRef<HTMLUListElement | null>(null);
  const { t } = useTranslation("member");
  const { t: ct } = useTranslation();
  const [currentUid, setCurrentUid] = useState<number | undefined>(undefined);
  const [removeTarget, setRemoveTarget] = useState<RemoveTarget | null>(null);
  const loginUser = useAppSelector((store) => store.authData.user, shallowEqual);
  const userMap = useAppSelector((store) => store.users.byId, shallowEqual);
  const channels = useAppSelector((store) => store.channels, shallowEqual);
  const { uids, input, updateInput } = useFilteredUsers();
  const {
    // canViewPassword,
    canUpdatePassword,
    copyEmail,
    canCopyEmail,
    canRemove,
    removeUser,
    removeFromChannel,
    showEmailInChannel,
  } = useUserOperation({
    cid,
  });
  const [updateUser, { isSuccess: updateSuccess }] = useUpdateUserMutation();
  const [rolePopoverUid, setRolePopoverUid] = useState<number | undefined>(undefined);
  const [morePopoverUid, setMorePopoverUid] = useState<number | undefined>(undefined);

  useEffect(() => {
    if (updateSuccess) {
      toast.success(ct("tip.update"));
    }
  }, [updateSuccess]);

  const handleToggleRole = ({
    ignore = false,
    uid,
    isAdmin = true,
  }: {
    ignore: boolean;
    uid: number;
    isAdmin: boolean;
  }) => {
    setRolePopoverUid(undefined);
    if (ignore) return;
    updateUser({ id: uid, is_admin: isAdmin });
  };

  const handleRemoveConfirm = (uid: number, name: string, type: "server" | "channel") => {
    setMorePopoverUid(undefined);
    setRemoveTarget({ uid, name, type });
  };

  const channel = cid ? channels.byId[cid] : null;
  const finalUids = channel ? (channel.is_public ? uids : channel.members) : uids;
  return (
    <>
      <Search input={input} updateInput={updateInput} type="members" />
      <ul
        className="flex flex-col gap-1 w-full md:w-[512px] mb-44 max-h-[800px] overflow-y-scroll"
        ref={ref}
      >
        <ViewportList initialPrerender={15} viewportRef={ref} items={finalUids}>
          {(uid) => {
            const currUser = userMap[uid];
            if (!currUser) return null;
            const { name, email, is_admin } = currUser;
            const owner = channel && channel.owner == uid;
            const switchRoleVisible = loginUser?.is_admin && loginUser.uid !== uid && uid !== 1;
            let dotsVisible = loginUser?.is_admin;
            const canRemoveFromChannel =
              !!channel &&
              !channel.is_public &&
              !currUser.is_bot &&
              (loginUser?.is_admin || channel.owner == loginUser?.uid) &&
              uid != channel.owner &&
              uid != loginUser?.uid;
            dotsVisible = [canCopyEmail, canRemove, canRemoveFromChannel].some((i) => i);
            return (
              <li
                key={uid}
                className="w-full flex items-center justify-between px-3 py-2 rounded-md md:hover:bg-slate-50 md:dark:hover:bg-gray-800"
              >
                <div className="flex gap-4">
                  <User compact uid={uid} interactive={false} />
                  <div className="flex flex-col">
                    <span className="font-bold text-sm text-gray-600 dark:text-white flex items-center gap-1">
                      <NameWithRemark name={name} uid={uid} /> {owner && <IconOwner />}
                    </span>
                    {showEmailInChannel && (
                      <span className="hidden md:block text-xs text-gray-500 dark:textlate-50">
                        {email}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-7">
                  {switchRoleVisible ? (
                    <Popover
                      placement="bottom-end"
                      open={rolePopoverUid === uid}
                      onOpenChange={(open) => setRolePopoverUid(open ? uid : undefined)}
                      content={
                        <ul className="context-menu">
                          <li
                            className="item sb"
                            onClick={handleToggleRole.bind(null, {
                              ignore: is_admin,
                              uid,
                              isAdmin: true,
                            })}
                          >
                            {t("admin")}
                            {is_admin && <IconCheck className="icon dark:fill-white" />}
                          </li>
                          <li
                            className="item sb"
                            onClick={handleToggleRole.bind(null, {
                              ignore: !is_admin,
                              uid,
                              isAdmin: false,
                            })}
                          >
                            {t("user")}
                            {!is_admin && <IconCheck className="icon dark:fill-white" />}
                          </li>
                        </ul>
                      }
                    >
                      <span className="text-xs text-right text-gray-500 dark:text-slate-100 flex items-center gap-1 cursor-pointer">
                        {is_admin ? t("admin") : t("user")}
                        <IconArrowDown className="dark:fill-slate-50" />
                      </span>
                    </Popover>
                  ) : (
                    <span className="text-xs text-right text-gray-500 dark:text-slate-100 flex items-center gap-1">
                      {is_admin ? t("admin") : t("user")}
                    </span>
                  )}

                  {dotsVisible && (
                    <Popover
                      placement="right-start"
                      open={morePopoverUid === uid}
                      onOpenChange={(open) => setMorePopoverUid(open ? uid : undefined)}
                      content={
                        <ul className="min-w-30 context-menu">
                          {canCopyEmail && (
                            <li className="item" onClick={copyEmail.bind(null, email)}>
                              {ct("action.copy_email")}
                            </li>
                          )}
                          {canRemoveFromChannel && (
                            <li className="item danger" onClick={handleRemoveConfirm.bind(null, uid, name, "channel")}>
                              {t("remove_from_channel")}
                            </li>
                          )}
                          {/* {canViewPassword && (
                            <li className="item danger" onClick={setCurrentUid.bind(null, uid)}>
                              {ct("action.view_pwd")}
                            </li>
                          )} */}
                          {canUpdatePassword && (
                            <li className="item danger" onClick={() => { setMorePopoverUid(undefined); setCurrentUid(uid); }}>
                              {ct("action.change_pwd")}
                            </li>
                          )}
                          {canRemove && (
                            <li className="item danger" onClick={handleRemoveConfirm.bind(null, uid, name, "server")}>
                              {ct("action.remove")}
                            </li>
                          )}
                        </ul>
                      }
                    >
                      <div className="relative w-6 h-6">
                        <IconMore role="button" className="dark:fill-gray-400" />
                      </div>
                    </Popover>
                  )}
                </div>
              </li>
            );
          }}
        </ViewportList>
      </ul>
      {/* <ViewPassword uid={currentUid} onClose={setCurrentUid.bind(null, undefined)} /> */}
      <UpdatePassword uid={currentUid} onClose={setCurrentUid.bind(null, undefined)} />
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
export default MemberList;
