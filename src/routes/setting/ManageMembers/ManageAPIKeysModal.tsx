import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";

import {
  useGetBotAPIKeysQuery,
  useCreateBotAPIKeyMutation,
  useLazyDeleteBotAPIKeyQuery,
} from "@/app/services/user";
import Modal from "@/components/Modal";
import Button from "@/components/styled/Button";
import Input from "@/components/styled/Input";
import StyledModal from "@/components/styled/Modal";
import useCopy from "@/hooks/useCopy";
import IconDelete from "@/assets/icons/delete.svg";

type Props = {
  uid: number;
  closeModal: () => void;
};

const ManageAPIKeysModal = ({ uid, closeModal }: Props) => {
  const { t } = useTranslation("member");
  const { t: ct } = useTranslation();
  const { copy } = useCopy();
  const { data: keys } = useGetBotAPIKeysQuery(uid);
  const [createKey, { isSuccess: createSuccess, isLoading: createLoading, data: createdKey = "", error: createError }] =
    useCreateBotAPIKeyMutation();
  const [deleteKey, { isSuccess: deleteSuccess }] = useLazyDeleteBotAPIKeyQuery();
  const [newKeyName, setNewKeyName] = useState("");
  const [showCreatedKey, setShowCreatedKey] = useState(false);

  const handleCreateKey = () => {
    if (!newKeyName.trim()) return;
    createKey({ uid, name: newKeyName.trim() });
  };

  const handleDeleteKey = (kid: number) => {
    deleteKey({ uid, kid });
  };

  const handleCopyAndClose = () => {
    if (createdKey) {
      copy(createdKey);
    }
    setShowCreatedKey(false);
  };

  useEffect(() => {
    if (createError) {
      switch ("status" in createError && createError.status) {
        case 409:
          toast.error(ct("error.name_already_exists"));
          break;
        default:
          toast.error(ct("tip.operation_failed"));
          break;
      }
    }
  }, [createError]);

  useEffect(() => {
    if (createSuccess) {
      setNewKeyName("");
      setShowCreatedKey(true);
    }
  }, [createSuccess]);

  useEffect(() => {
    if (deleteSuccess) {
      toast.success(ct("tip.delete"));
    }
  }, [deleteSuccess]);

  const tdClass = "p-1 text-xs text-gray-500 dark:text-gray-200 align-top px-1 text-left";

  return (
    <Modal id="modal-modal">
      <StyledModal
        className="md:min-w-[520px]"
        title={t("manage_api_keys")}
        description={t("manage_api_keys_desc")}
        buttons={
          showCreatedKey ? (
            <Button onClick={handleCopyAndClose}>{t("key_copy_and_close")}</Button>
          ) : (
            <>
              <Button className="cancel" onClick={closeModal}>
                {ct("action.cancel")}
              </Button>
              <Button onClick={closeModal}>{ct("action.done")}</Button>
            </>
          )
        }
      >
        {showCreatedKey && createdKey ? (
          <div className="flex flex-col gap-2 text-sm">
            <div className="border-green-600 bg-green-200/50 rounded border border-solid p-2 max-w-md w-full whitespace-pre-wrap break-all font-mono">
              {createdKey}
            </div>
            <div className="text-red-400 text-xs">&#9888;&#65039; {t("create_key_warning")}</div>
          </div>
        ) : (
          <div className="flex flex-col gap-4 w-full">
            {/* Add new key */}
            <div className="flex flex-col gap-1 w-full">
              <label className="text-xs text-gray-700 dark:text-gray-300 font-semibold text-left">{t("key_name")}</label>
              <div className="flex gap-2">
                <Input
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                  placeholder={t("key_name_placeholder")}
                  className="flex-1"
                />
                <Button
                  className="mini !py-2"
                  disabled={!newKeyName.trim() || createLoading}
                  onClick={handleCreateKey}
                >
                  {createLoading ? "..." : t("add_key")}
                </Button>
              </div>
            </div>

            {/* Existing keys list */}
            <div className="flex flex-col gap-2 w-full items-start mt-4">
              <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">{t("existing_keys")}</span>
              <div className="border-t border-solid border-b border-gray-100 dark:border-gray-500 py-2 w-full text-left">
                <table className="w-full font-mono">
                <thead>
                  <tr>
                    {[t("key_name"), t("key_value"), ""].map((title, idx) => (
                      <th
                        key={idx}
                        scope="col"
                        className="text-xs text-gray-900 dark:text-gray-50 px-1 text-left pb-2"
                      >
                        {title}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {keys && keys.length > 0 ? (
                    keys.map((ak) => (
                      <tr key={ak.id} className="group">
                        <td className={tdClass}>{ak.name}</td>
                        <td className={tdClass}>{`${ak.key.slice(0, 4)} ... ... ${ak.key.slice(-6)}`}</td>
                        <td className={`${tdClass} invisible group-hover:visible`}>
                          <button onClick={() => handleDeleteKey(ak.id)}>
                            <IconDelete />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={3} className="text-center text-xs text-gray-400 py-2">
                        {t("no_api_key")}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
              </div>
            </div>
          </div>
        )}
      </StyledModal>
    </Modal>
  );
};

export default ManageAPIKeysModal;
