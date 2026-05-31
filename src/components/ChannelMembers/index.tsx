import { FC, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useLazyGetChannelQuery } from "@/app/services/channel";
import { useAppDispatch, useAppSelector } from "@/app/store";
import { addChannel } from "@/app/slices/channels";
import InviteLink from "../InviteLink";
import MemberList from "./MemberList";
import { shallowEqual } from "react-redux";

interface Props {
  cid?: number;
}
const ChannelMembers: FC<Props> = ({ cid }) => {
  const { t } = useTranslation("member");
  const isAdmin = useAppSelector((store) => store.authData.user?.is_admin, shallowEqual);
  const dispatch = useAppDispatch();
  const [fetchChannel] = useLazyGetChannelQuery();

  useEffect(() => {
    if (!cid) return;
    fetchChannel(cid).then(({ data }) => {
      if (data) {
        dispatch(addChannel(data));
      }
    });
  }, [cid]);

  return (
    <section className="flex flex-col w-full">
      {/* {isAdmin && <InviteLink />} */}
      <div className="flex flex-col mb-10">
        <h4 className="font-bold text-foreground dark:text-white">{t("manage_members")}</h4>
        <p className="text-muted-foreground dark:text-foreground text-xs">{t("manage_tip")}</p>
      </div>
      <MemberList cid={cid} />
    </section>
  );
};
export default ChannelMembers;
