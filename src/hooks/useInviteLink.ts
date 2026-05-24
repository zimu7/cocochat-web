import { useEffect, useState } from "react";

import { getInviteLinkExpireList, getInviteLinkTimesList } from "@/app/config";
import { useLazyCreateInviteLinkQuery } from "@/app/services/channel";
import { useAppSelector } from "@/app/store";
import useCopy from "./useCopy";
import { shallowEqual } from "react-redux";

const defaultExpire = getInviteLinkExpireList()[4].value;
const defaultTimes = getInviteLinkTimesList()[0].value;
type ParamsProps = { expire: number; times: number };
const defaultParams: ParamsProps = { expire: defaultExpire, times: defaultTimes };
export default function useInviteLink(cid?: number) {
  const [finalLink, setFinalLink] = useState("");
  const channel = useAppSelector((store) => store.channels.byId[cid ?? 0], shallowEqual);
  const [generateInviteLink, { data: channelInviteLink, isLoading: generatingChannelLink }] =
    useLazyCreateInviteLinkQuery();

  const { copied, copy } = useCopy({ enableToast: false });
  const copyLink = () => {
    copy(finalLink);
  };
  useEffect(() => {
    generateInviteLink({ expire: defaultExpire, times: defaultTimes });
  }, [cid, channel]);

  useEffect(() => {
    if (channelInviteLink) {
      setFinalLink(channelInviteLink);
    }
  }, [channelInviteLink]);
  const generateNewLink = (params = defaultParams) => {
    const { expire, times } = params;
    generateInviteLink({ expire, times });
  };
  const generating = generatingChannelLink;
  return {
    generating,
    generateNewLink,
    link: finalLink,
    linkCopied: copied,
    copyLink
  };
}
