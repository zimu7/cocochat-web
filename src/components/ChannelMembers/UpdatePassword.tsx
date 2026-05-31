// import React from "react";
import Modal from "../Modal";
import Input from "../styled/Input";
import StyledButton from "../styled/Button";
import useUserOperation from "@/hooks/useUserOperation";
import { ChangeEvent, useState } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";

type Props = {
  uid?: number;
  onClose: () => void;
};

const UpdatePassword = ({ uid, onClose }: Props) => {
  const [pwd, setPwd] = useState("");
  const { updatePassword } = useUserOperation({ uid });
  const { t: ct } = useTranslation();
  const { t } = useTranslation("member");
  const handleUpdate = () => {
    if (pwd.length < 6) {
      toast.error(ct("error.min_length_6"));
      return;
    }
    updatePassword(pwd);
    setPwd("");
  };
  const handleChange = (evt: ChangeEvent<HTMLInputElement>) => {
    setPwd(evt.target.value);
  };
  if (!uid) return null;
  return (
    <Modal>
      <div className="flex flex-col gap-3 py-8 px-12 rounded-md bg-muted dark:bg-secondary relative min-w-[400px]">
        <h2 className="text-lg font-bold dark:text-muted-foreground">{t("change_pwd")}</h2>
        <label htmlFor="pwd" className="dark:text-muted-foreground">
          {t("new_pwd")}:
        </label>
        <Input id="pwd" value={pwd} onChange={handleChange} placeholder={t("new_pwd")} />
        <div className="flex items-center gap-2">
          <StyledButton disabled={!pwd} className="small" onClick={handleUpdate}>
            {ct("action.update")}
          </StyledButton>
          <StyledButton className="small cancel" onClick={onClose}>
            {ct("action.close")}
          </StyledButton>
        </div>
      </div>
    </Modal>
  );
};

export default UpdatePassword;
