import { useState } from "react";

import { useLazyDeleteMessagesQuery } from "@/app/services/message";
import { useAppSelector } from "@/app/store";
import { shallowEqual } from "react-redux";

export default function useDeleteMessage() {
  const [deleting, setDeleting] = useState(false);
  const loginUser = useAppSelector((store) => store.authData.user, shallowEqual);
  const messageData = useAppSelector((store) => store.message, shallowEqual);
  const [batchRemove] = useLazyDeleteMessagesQuery();
  const deleteMessage = async (mids: number[]) => {
    if (!mids) return;
    const _arr = Array.isArray(mids) ? mids : [mids];
    setDeleting(true);
    await batchRemove(_arr);
    setDeleting(false);
  };
  const canDelete = (mids?: number[]) => {
    if (!mids || mids.length == 0) return false;
    // 管理员
    if (loginUser?.is_admin) return true;
    // 检查是否是自己的消息
    return mids.every((mid) => {
      return messageData[mid]?.from_uid == loginUser?.uid;
    });
  };
  return {
    canDelete,
    isDeleting: deleting,
    deleteMessage
  };
}
