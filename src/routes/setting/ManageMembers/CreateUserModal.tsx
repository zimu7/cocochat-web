import { ChangeEvent, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";

import { useCreateUserMutation, useUpdateAvatarByAdminMutation, useUpdateUserMutation } from "@/app/services/user";
import { StoredUser } from "@/app/slices/users";
import AvatarUploader from "@/components/AvatarUploader";
import Modal from "@/components/Modal";
import Button from "@/components/styled/Button";
import Input from "@/components/styled/Input";
import StyledModal from "@/components/styled/Modal";

interface FormState {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  isAdmin: boolean;
  isBot: boolean;
}

type Props = {
  closeModal: () => void;
  user?: StoredUser;
};

const UserFormModal = ({ closeModal, user }: Props) => {
  const { t, i18n } = useTranslation("member");
  const { t: ct } = useTranslation();
  const isEdit = !!user;

  const [createUser, { isSuccess: createSuccess, isLoading: createLoading, error: createError }] = useCreateUserMutation();
  const [updateUser, { isSuccess: updateSuccess, isLoading: updateLoading, error: updateError }] = useUpdateUserMutation();
  const [updateAvatarByAdmin] = useUpdateAvatarByAdminMutation();

  const isSuccess = isEdit ? updateSuccess : createSuccess;
  const isLoading = isEdit ? updateLoading : createLoading;
  const error = isEdit ? updateError : createError;

  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarUrl, setAvatarUrl] = useState(user?.avatar || "");
  const [inputs, setInputs] = useState<FormState>({
    name: user?.name || "",
    email: user?.email || "",
    password: "",
    confirmPassword: "",
    isAdmin: user?.is_admin || false,
    isBot: !!user?.is_bot || false,
  });

  const handleInputChange = (evt: ChangeEvent<HTMLInputElement>) => {
    const { value } = evt.target;
    const { name = "" } = evt.target.dataset;
    setInputs((prev) => ({ ...prev, [name]: value }));
  };

  const handleAdminChange = (evt: ChangeEvent<HTMLInputElement>) => {
    setInputs((prev) => ({ ...prev, isAdmin: evt.target.checked, isBot: evt.target.checked ? false : prev.isBot }));
  };

  const handleBotChange = (evt: ChangeEvent<HTMLInputElement>) => {
    setInputs((prev) => ({ ...prev, isBot: evt.target.checked, isAdmin: evt.target.checked ? false : prev.isAdmin }));
  };

  const handleUploadAvatar = (file: File) => {
    setAvatarFile(file);
    setAvatarUrl(URL.createObjectURL(file));
  };

  const handleCreate = async () => {
    if (!inputs.name.trim() || !inputs.email.trim()) {
      toast.error(`${t("username")} & ${t("email")} required`);
      return;
    }
    if (!inputs.password) {
      toast.error(`${t("password")} required`);
      return;
    }
    if (inputs.password !== inputs.confirmPassword) {
      toast.error(ct("error.not_same_new_password"));
      return;
    }
    const result = await createUser({
      name: inputs.name.trim(),
      email: inputs.email.trim(),
      password: inputs.password,
      gender: 0,
      language: i18n.language,
      is_bot: inputs.isBot,
      is_admin: inputs.isAdmin,
    });
    if ("data" in result && avatarFile) {
      await updateAvatarByAdmin({ uid: result.data.uid, file: avatarFile });
    }
  };

  const handleUpdate = async () => {
    if (!inputs.name.trim() || !inputs.email.trim()) {
      toast.error(`${t("username")} & ${t("email")} required`);
      return;
    }
    if (inputs.password && inputs.password !== inputs.confirmPassword) {
      toast.error(ct("error.not_same_new_password"));
      return;
    }
    const updateData: Record<string, unknown> = {
      id: user!.uid,
      name: inputs.name.trim(),
      email: inputs.email.trim(),
      is_admin: inputs.isAdmin,
      is_bot: inputs.isBot,
    };
    if (inputs.password) {
      updateData.password = inputs.password;
    }
    await updateUser(updateData);
    if (avatarFile) {
      await updateAvatarByAdmin({ uid: user!.uid, file: avatarFile });
    }
  };

  const handleSubmit = isEdit ? handleUpdate : handleCreate;

  useEffect(() => {
    if (error) {
      switch ("status" in error && error.status) {
        case 409:
          toast.error(ct("error.name_conflict"));
          break;
        default:
          toast.error(ct("tip.operation_failed"));
          break;
      }
    }
  }, [error]);

  useEffect(() => {
    if (isSuccess) {
      toast.success(ct("tip.update"));
      closeModal();
    }
  }, [isSuccess]);

  const { name, email, password, confirmPassword, isAdmin, isBot } = inputs;
  const inputClass = "my-2 w-full flex flex-col items-start gap-1";
  const labelClass = "text-gray-400 font-semibold text-xs";

  const isDisabled = isEdit
    ? !name.trim() || !email.trim() || (!!password && password !== confirmPassword)
    : !name.trim() || !email.trim() || !password || password !== confirmPassword;

  return (
    <Modal id="modal-modal">
      <StyledModal
        title={isEdit ? t("edit_user") : t("add_user")}
        description={isEdit ? t("edit_user_desc") : t("add_user_desc")}
        buttons={
          <>
            <Button className="cancel" onClick={closeModal}>
              {ct("action.cancel")}
            </Button>
            <Button
              disabled={isDisabled}
              onClick={handleSubmit}
            >
              {isLoading ? "..." : ct("action.done")}
            </Button>
          </>
        }
      >
        <div className="w-full flex flex-col gap-1">
          <input type="text" name="prevent_autofill_username" style={{ display: "none" }} tabIndex={-1} autoComplete="off" />
          <input type="password" name="prevent_autofill_password" style={{ display: "none" }} tabIndex={-1} autoComplete="off" />

          <div className="flex justify-center mb-2">
            <AvatarUploader
              size={80}
              url={avatarUrl}
              name={name || " "}
              uploadImage={handleUploadAvatar}
            />
          </div>

          <div className={inputClass}>
            <label className={labelClass}>{t("username")}</label>
            <Input
              value={name}
              data-name="name"
              onChange={handleInputChange}
              placeholder={t("username_placeholder")}
              autoComplete="off"
              data-form-type="other"
            />
          </div>

          <div className={inputClass}>
            <label className={labelClass}>{t("email")}</label>
            <Input
              value={email}
              data-name="email"
              onChange={handleInputChange}
              placeholder={t("email_placeholder")}
              type="email"
              autoComplete="off"
              data-form-type="other"
            />
          </div>

          <div className={inputClass}>
            <label className={labelClass}>{t("password")}</label>
            <Input
              value={password}
              data-name="password"
              onChange={handleInputChange}
              placeholder={isEdit ? t("password_placeholder_edit") : t("password_placeholder")}
              type="password"
              autoComplete="new-password"
              data-form-type="other"
            />
          </div>

          <div className={inputClass}>
            <label className={labelClass}>{t("confirm_new_pwd")}</label>
            <Input
              value={confirmPassword}
              data-name="confirmPassword"
              onChange={handleInputChange}
              placeholder={t("confirm_password_placeholder")}
              type="password"
              autoComplete="new-password"
              data-form-type="other"
            />
          </div>

          <div className="flex items-center gap-2 py-1 mt-2">
            <input
              type="checkbox"
              id="new_is_admin"
              checked={isAdmin}
              onChange={handleAdminChange}
              disabled={isBot}
              className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer disabled:cursor-not-allowed"
            />
            <label htmlFor="new_is_admin" className="text-xs font-semibold text-gray-600 dark:text-gray-300 cursor-pointer">
              {t("set_as_admin")}
            </label>
          </div>
          <div className="flex items-center gap-2 py-1">
            <input
              type="checkbox"
              id="new_is_bot"
              checked={isBot}
              onChange={handleBotChange}
              disabled={isAdmin}
              className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer disabled:cursor-not-allowed"
            />
            <label htmlFor="new_is_bot" className="text-xs font-semibold text-gray-600 dark:text-gray-300 cursor-pointer">
              {t("set_as_bot")}
            </label>
          </div>
        </div>
      </StyledModal>
    </Modal>
  );
};

export default UserFormModal;