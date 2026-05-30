import { FC, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { ViewportList } from "react-viewport-list";
import Search from "@/routes/users/Search";

import { useAppSelector } from "@/app/store";
import useFilteredUsers from "@/hooks/useFilteredUsers";
import IconDelete from "@/assets/icons/delete.svg";
import IconOwner from "@/assets/icons/owner.svg";
import User from "../User";
import RemoveConfirmModal from "../RemoveConfirmModal";
import NameWithRemark from "../NameWithRemark";
import { shallowEqual } from "react-redux";

type RemoveTarget = {
  uid: number;
  name: string;
  type: "channel";
};

interface Props {
  cid?: number;
}
const MemberList: FC<Props> = ({ cid }) => {
  const ref = useRef<HTMLUListElement | null>(null);
  const { t } = useTranslation("member");
  const [removeTarget, setRemoveTarget] = useState<RemoveTarget | null>(null);
  const loginUser = useAppSelector((store) => store.authData.user, shallowEqual);
  const userMap = useAppSelector((store) => store.users.byId, shallowEqual);
  const channels = useAppSelector((store) => store.channels, shallowEqual);
  const { uids, input, updateInput } = useFilteredUsers();

  const handleRemoveConfirm = (uid: number, name: string) => {
    setRemoveTarget({ uid, name, type: "channel" });
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
            const { name, email } = currUser;
            const owner = channel && channel.owner == uid;
            const canRemoveFromChannel =
              !!channel &&
              !channel.is_public &&
              (loginUser?.is_admin || channel.owner == loginUser?.uid) &&
              uid != channel.owner;
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
                    {email && (
                      <span className="hidden md:block text-xs text-gray-500 dark:text-slate-50">
                        {email}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-right text-gray-500 dark:text-slate-100 flex items-center gap-1">
                    {owner ? t("channel_owner") : ""}
                  </span>
                  {canRemoveFromChannel && (
                    <button
                      onClick={() => handleRemoveConfirm(uid, name)}
                      className="flex items-center justify-center rounded md:hover:bg-red-50 md:dark:hover:bg-red-900/20"
                    >
                      <IconDelete className="w-6 h-6 fill-gray-400 dark:fill-gray-400 md:hover:fill-red-500 md:dark:hover:fill-red-400" />
                    </button>
                  )}
                </div>
              </li>
            );
          }}
        </ViewportList>
      </ul>
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