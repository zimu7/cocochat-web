import { useEffect } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";

import { useLazyDeleteUserQuery } from "@/app/services/user";
import { useAppDispatch } from "@/app/store";
import { removeUser } from "@/app/slices/users";
import Modal from "@/components/Modal";
import Button from "@/components/styled/Button";
import StyledModal from "@/components/styled/Modal";

type Props = {
  uid: number;
  name: string;
  closeModal: () => void;
};

const DeleteUserModal = ({ uid, name, closeModal }: Props) => {
  const { t } = useTranslation("member");
  const { t: ct } = useTranslation();
  const dispatch = useAppDispatch();
  const [deleteUser, { isSuccess, isLoading }] = useLazyDeleteUserQuery();

  const handleDelete = () => {
    deleteUser(uid);
  };

  useEffect(() => {
    if (isSuccess) {
      dispatch(removeUser(uid));
      toast.success(ct("tip.delete"));
      closeModal();
    }
  }, [isSuccess]);

  return (
    <Modal id="modal-modal">
      <StyledModal
        title={`${t("remove")} ${name}`}
        description={t("remove_desc")}
        buttons={
          <>
            <Button className="cancel" onClick={closeModal}>
              {ct("action.cancel")}
            </Button>
            <Button className="danger" onClick={handleDelete}>
              {isLoading ? "..." : ct("action.done")}
            </Button>
          </>
        }
      />
    </Modal>
  );
};

export default DeleteUserModal;
