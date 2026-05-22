import { useEffect } from "react";
import toast from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";
import i18n from "@/i18n";

import { useSendLoginMagicLinkMutation } from "@/app/services/auth";
import SentTip from "./SentTip";
import SelectLanguage from "../../components/Language";

export default function SendMagicLinkPage() {
  const { email = "" } = useParams();
  const [sendMagicLink, { isSuccess, isLoading, error }] = useSendLoginMagicLinkMutation();
  const navigateTo = useNavigate();
  useEffect(() => {
    if (email) {
      sendMagicLink(email);
    }
  }, [email]);

  useEffect(() => {
    if (isSuccess) {
      toast.success(i18n.t("error.send_email_success"));
    }
  }, [isSuccess]);

  useEffect(() => {
    if (error && "status" in error) {
      switch (error.status) {
        case "PARSING_ERROR":
          toast.error(error.data);
          break;
        case 401:
          toast.error(i18n.t("error.username_pwd_incorrect"));
          break;
        case 404:
          toast.error(i18n.t("error.account_not_exist"));
          break;
        default:
          toast.error(i18n.t("error.something_error"));
          break;
      }
      return;
    }
  }, [error]);

  const handlePwdPath = () => {
    navigateTo("/login");
  };

  return (
    <>
      <SelectLanguage />
      <div className="flex-center h-screen dark:bg-gray-800">
        <div className="py-8 px-10 shadow-md rounded-xl bg-white dark:bg-gray-700">
          {isSuccess ? (
            <SentTip email={email} handleBack={handlePwdPath} />
          ) : isLoading ? (
            <div className="">Sending...</div>
          ) : null}
        </div>
      </div>
    </>
  );
}
