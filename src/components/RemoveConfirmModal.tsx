import { FC, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";

import { useRemoveMembersMutation } from "@/app/services/channel";
import { useLazyDeleteUserQuery, useUpdateContactStatusMutation } from "@/app/services/user";
import Modal from "@/components/Modal";
import Button from "@/components/styled/Button";
import StyledModal from "@/components/styled/Modal";

type RemoveType = "server" | "channel" | "contact";

interface Props {
  uid: number;
  name: string;
  type: RemoveType;
  cid?: number;
  closeModal: () => void;
}

const RemoveConfirmModal: FC<Props> = ({ uid, name, type, cid, closeModal }) => {
  const { t } = useTranslation("member");
  const { t: ct } = useTranslation();
  const [deleting, setDeleting] = useState(false);

  const [removeUser, { isSuccess: removeUserSuccess }] = useLazyDeleteUserQuery();
  const [removeFromChannel, { isSuccess: removeChannelSuccess }] = useRemoveMembersMutation();
  const [removeFromContact, { isSuccess: removeContactSuccess }] = useUpdateContactStatusMutation();

  const isSuccess = removeUserSuccess || removeChannelSuccess || removeContactSuccess;

  useEffect(() => {
    if (isSuccess) {
      toast.success(ct("tip.delete"));
      closeModal();
    }
  }, [isSuccess]);

  const handleRemove = () => {
    setDeleting(true);
    if (type === "server") {
      removeUser(uid);
    } else if (type === "channel" && cid) {
      removeFromChannel({ id: cid, members: [uid] });
    } else if (type === "contact") {
      removeFromContact({ target_uid: uid, action: "remove" });
    }
  };

  const titleMap = {
    server: t("remove"),
    channel: t("remove_from_channel"),
    contact: t("remove_from_contact"),
  };

  const descMap = {
    server: t("remove_desc"),
    channel: t("remove_from_channel_desc"),
    contact: t("remove_from_contact_desc"),
  };

  const title = `${titleMap[type]} - ${name}`;
  const desc = descMap[type];

  return (
    <Modal id="modal-modal">
      <StyledModal
        title={title}
        description={desc}
        buttons={
          <>
            <Button className="cancel" onClick={closeModal}>
              {ct("action.cancel")}
            </Button>
            <Button className="danger" onClick={handleRemove}>
              {deleting ? ct("status.saving") : ct("action.remove")}
            </Button>
          </>
        }
      />
    </Modal>
  );
};

export default RemoveConfirmModal;
