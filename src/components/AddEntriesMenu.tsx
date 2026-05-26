import { useTranslation } from "react-i18next";

import { useAppSelector } from "@/app/store";
import IconInvite from "@/assets/icons/add.person.svg";
import IconMention from "@/assets/icons/mention.svg";
import IconSearch from "@/assets/icons/search.svg";
import ChannelIcon from "./ChannelIcon";
import { PopoverPrimitive } from "./Popover";
import { shallowEqual } from "react-redux";
import useServerExtSetting from "../hooks/useServerExtSetting";
import { KEY_ADMIN_ONLY_INVITE } from "../app/config";

interface Props {
  onNewChannel: (isPrivate: boolean) => void;
  onNewMessage: () => void;
  onSearchUser: () => void;
}

export default function AddEntriesMenu({ onNewChannel, onNewMessage, onSearchUser }: Props) {
  const { t } = useTranslation();
  const { getExtSetting } = useServerExtSetting();
  const onlyAdminCanInvite = getExtSetting(KEY_ADMIN_ONLY_INVITE);
  const isAdmin = useAppSelector((store) => store.authData.user?.is_admin, shallowEqual);
  const onlyAdminCreateGroup = useAppSelector(
    (store) => store.server.only_admin_can_create_group,
    shallowEqual
  );

  const itemClass =
    "rounded flex items-center gap-2 text-sm font-semibold cursor-pointer px-2 py-2.5 md:hover:bg-gray-800/20 md:dark:hover:bg-gray-200/20";
  const iconClass = "w-5 h-5 dark:fill-gray-300";
  const canPrivateGroup = onlyAdminCreateGroup ? isAdmin : true;
  const showInvite = isAdmin || !onlyAdminCanInvite;
  return (
    <ul className="flex flex-col rounded-xl drop-shadow p-1 select-none text-gray-500 dark:text-gray-300 bg-white dark:bg-black">
      {/* temp remove public channel */}
      {isAdmin && (
        <PopoverPrimitive.Close asChild>
          <li className={itemClass} onClick={() => onNewChannel(false)}>
            <ChannelIcon className={iconClass} />
            {t("action.new_channel")}
          </li>
        </PopoverPrimitive.Close>
      )}
      {canPrivateGroup && (
        <PopoverPrimitive.Close asChild>
          <li className={itemClass} onClick={() => onNewChannel(true)}>
            <ChannelIcon personal={true} className={iconClass} />
            {t("action.new_private_channel")}
          </li>
        </PopoverPrimitive.Close>
      )}
      <PopoverPrimitive.Close asChild>
        <li className={itemClass} onClick={onNewMessage}>
          <IconMention className={iconClass} />
          {t("action.new_msg")}
        </li>
      </PopoverPrimitive.Close>
      {/* {showInvite && (
        <li className={itemClass} onClick={toggleInviteModalVisible}>
          <IconInvite className={iconClass} />
          {t("action.invite_people")}
        </li>
      )} */}
      <PopoverPrimitive.Close asChild>
        <li className={itemClass} onClick={onSearchUser}>
          <IconSearch className={iconClass} />
          {t("action.search_people")}
        </li>
      </PopoverPrimitive.Close>
    </ul>
  );
}
