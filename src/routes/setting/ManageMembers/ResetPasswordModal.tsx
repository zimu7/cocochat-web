import { ChangeEvent, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";

import { useUpdateUserMutation } from "@/app/services/user";
import Modal from "@/components/Modal";
import Button from "@/components/styled/Button";
import Input from "@/components/styled/Input";
import StyledModal from "@/components/styled/Modal";

type Props = {
  uid: number;
  name: string;
  closeModal: () => void;
};

const ResetPasswordModal = ({ uid, name, closeModal }: Props) => {
  const { t } = useTranslation("member");
  const { t: ct } = useTranslation();
  const [updateUser, { isSuccess, isLoading }] = useUpdateUserMutation();
  const [newPassword, setNewPassword] = useState("");

  const handleChange = (evt: ChangeEvent<HTMLInputElement>) => {
    setNewPassword(evt.target.value);
  };

  const handleReset = () => {
    if (!newPassword.trim()) {
      toast.error(`${t("password")} required`);
      return;
    }
    updateUser({ id: uid, password: newPassword });
  };

  useEffect(() => {
    if (isSuccess) {
      toast.success(ct("tip.update"));
      closeModal();
    }
  }, [isSuccess]);

  const inputClass = "my-2 w-full flex flex-col items-start gap-1";
  const labelClass = "text-muted-foreground font-semibold text-xs";

  return (
    <Modal id="modal-modal">
      <StyledModal
        title={`${t("reset_password")} - ${name}`}
        description={t("reset_password_desc")}
        buttons={
          <>
            <Button className="cancel" onClick={closeModal}>
              {ct("action.cancel")}
            </Button>
            <Button disabled={!newPassword.trim() || isLoading} onClick={handleReset}>
              {isLoading ? "..." : ct("action.done")}
            </Button>
          </>
        }
      >
        <div className={inputClass}>
          <label className={labelClass}>{t("new_pwd")}</label>
          <Input
            type="password"
            value={newPassword}
            onChange={handleChange}
            placeholder={t("new_password_placeholder")}
            autoComplete="new-password"
          />
        </div>
      </StyledModal>
    </Modal>
  );
};

export default ResetPasswordModal;
