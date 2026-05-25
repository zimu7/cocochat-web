import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";

import {
  useGetThirdPartySecretQuery,
  useUpdateThirdPartySecretMutation
} from "@/app/services/server";
import { LoginConfig } from "@/types/server";
import Button from "@/components/styled/Button";
import Input from "@/components/styled/Input";
import Toggle from "@/components/styled/Toggle";
import Popover from "@/components/Popover";
import useConfig from "@/hooks/useConfig";

export default function APIConfig() {
  const { t } = useTranslation("setting");
  const { t: ct } = useTranslation();
  const { updateConfig, values } = useConfig("login");
  const { data } = useGetThirdPartySecretQuery();
  const [updateSecret, { data: updatedSecret, isSuccess, isLoading }] =
    useUpdateThirdPartySecretMutation();
  const [confirmOpen, setConfirmOpen] = useState(false);

  useEffect(() => {
    if (isSuccess) {
      setConfirmOpen(false);
      toast.success(ct("tip.update"));
    }
  }, [isSuccess]);
  const handleToggle = (val: { third_party: boolean }) => {
    updateConfig({ ...values, ...val });
  };
  const thirdParty = (values as LoginConfig)?.third_party;

  return (
    <div className="max-w-[500px] flex flex-col gap-4 items-start">
      <Toggle
        onClick={handleToggle.bind(null, { third_party: !thirdParty })}
        checked={thirdParty}
      />
      <div className="w-full flex flex-col items-start gap-2">
        <label htmlFor="secret" className="text-sm text-gray-500 dark:text-gray-100">
          {" "}
          {t("third_app.key")}:
        </label>
        <Input disabled={!thirdParty} type="password" id="secret" value={updatedSecret || data} />
      </div>
      <Popover
        disabled={!thirdParty}
        placement="right-start"
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        content={
          <div className="p-3 rounded-lg border border-orange-400 border-solid flex flex-col gap-3 w-[250px] bg-white">
            <div className="text-orange-500 text-xs">{t("third_app.update_tip")}</div>
            <div className="flex justify-end gap-3 w-full">
              <Button onClick={() => setConfirmOpen(false)} className="cancel mini">
                {ct("action.cancel")}
              </Button>
              <Button disabled={isLoading} className="mini danger" onClick={() => updateSecret()}>
                {ct("action.yes")}
              </Button>
            </div>
          </div>
        }
      >
        <Button disabled={!thirdParty}> {t("third_app.update")}</Button>
      </Popover>
      <div className="text-xs text-orange-400">
        {t("third_app.key_tip")}
        <a
          className="text-primary-500 font-bold"
          href="https://doc.voce.chat/login-with-other-account"
          target="_blank"
          rel="noopener noreferrer"
        >
          🔗 {t("third_app.how_to")}
        </a>
      </div>
    </div>
  );
}
