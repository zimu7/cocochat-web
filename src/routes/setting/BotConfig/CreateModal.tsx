import { ChangeEvent, useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { useTranslation } from "react-i18next";

import { BASE_ORIGIN } from "../../../app/config";
import { useCreateUserMutation } from "../../../app/services/user";
import Modal from "../../../components/Modal";
import Button from "../../../components/styled/Button";
import Input from "../../../components/styled/Input";
import StyledModal from "../../../components/styled/Modal";

type Props = {
  closeModal: () => void;
};
const CreateModal = ({ closeModal }: Props) => {
  const [createUser, { isSuccess, isLoading, error }] = useCreateUserMutation();
  const { t } = useTranslation("setting", { keyPrefix: "bot" });
  const [inputs, setInputs] = useState({
    name: "",
    webhook_url: "",
    password: ""
  });
  const { t: ct } = useTranslation();
  // const [input, setInput] = useState("");
  const handleInputChange = (evt: ChangeEvent<HTMLInputElement>) => {
    const { value } = evt.target;
    const { name = "" } = evt.target.dataset;

    setInputs((prev) => ({ ...prev, [name]: value }));
  };
  const handleCreateBot = () => {
    if (inputs.name.trim() === "") {
      return;
    }
    const { name, webhook_url, password } = inputs;
    const hostname = new URL(BASE_ORIGIN).hostname;
    createUser({
      is_bot: true,
      is_admin: false,
      gender: 1,
      email: `bot_${new Date().getTime()}@${hostname}`,
      password,
      name,
      webhook_url: webhook_url.trim() === "" ? undefined : webhook_url
    });
  };
  useEffect(() => {
    if (error) {
      switch (error.status) {
        case 406:
          toast.error(ct("error.invalid_webhook"));
          break;
        case 409:
          toast.error(ct("error.name_conflict"));
          setInputs((prev) => ({ ...prev, name: `${prev.name}-bot` }));
          break;

        default:
          break;
      }
    }
  }, [error]);
  useEffect(() => {
    if (isSuccess) {
      toast.success(ct("error.create_bot_success"));
      closeModal();
    }
  }, [isSuccess]);
  const { name, webhook_url, password } = inputs;
  return (
    <Modal id="modal-modal">
      <StyledModal
        title={t("create_title")}
        description={t("create_desc")}
        buttons={
          <>
            <Button className="cancel" onClick={closeModal}>
              {ct("action.cancel")}
            </Button>
            <Button disabled={!inputs.name} onClick={handleCreateBot}>
              {isLoading ? t("creating") : ct("action.done")}
            </Button>
          </>
        }
      >
        <div className="w-full flex flex-col gap-2">
          {/* Hidden inputs to prevent browser autofill */}
          <input type="text" name="prevent_autofill_username" style={{ display: 'none' }} tabIndex={-1} autoComplete="off" />
          <input type="password" name="prevent_autofill_password" style={{ display: 'none' }} tabIndex={-1} autoComplete="off" />
          <div className="flex flex-col items-start gap-1 w-full">
            <label htmlFor={"name"} className="text-sm text-gray-500">
              {t("col_name")}
            </label>
            <Input
              onChange={handleInputChange}
              value={name}
              data-name={"name"}
              placeholder={t("name_placeholder")}
              autoComplete="off"
              data-form-type="other"
            ></Input>
          </div>
          <div className="flex flex-col items-start gap-1 w-full">
            <label htmlFor={"password"} className="text-sm text-gray-500">
              {t("password")}
            </label>
            <Input
              onChange={handleInputChange}
              value={password}
              data-name={"password"}
              type="password"
              placeholder={t("password_placeholder")}
              autoComplete="new-password"
              data-form-type="other"
            ></Input>
          </div>
          <div className="flex flex-col items-start gap-1 w-full">
            <label htmlFor={"webhook_url"} className="text-sm text-gray-500">
              {t("webhook_url")}
            </label>
            <Input
              onChange={handleInputChange}
              value={webhook_url}
              data-name={"webhook_url"}
              type="url"
              placeholder={t("webhook_url_placeholder")}
            ></Input>
          </div>
        </div>
      </StyledModal>
    </Modal>
  );
};

export default CreateModal;
