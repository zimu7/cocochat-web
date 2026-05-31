// import React from "react";
import { useTranslation } from "react-i18next";
import { shallowEqual } from "react-redux";
import { useNavigate } from "react-router-dom";

import { BASE_ORIGIN } from "@/app/config";
// import { resetAuthData } from "@/app/slices/auth.data";
import { useAppSelector } from "@/app/store";
import QRCode from "@/components/QRCode";
import Button from "@/components/styled/Button";
// import useLogout from "@/hooks/useLogout";

// type Props = {};

const GuestBlankPlaceholder = () => {
  const { t } = useTranslation("auth");
  // const dispatch = useDispatch();
  // const { clearLocalData } = useLogout();
  const navigateTo = useNavigate();
  const serverName = useAppSelector((store) => store.server.name, shallowEqual);
  const handleSignIn = () => {
    // dispatch(resetAuthData());
    // clearLocalData();
    navigateTo("/login");
  };
  const qrUrl = BASE_ORIGIN;
  return (
    <section className="flex flex-col items-center text-center p-8 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary-100/20 via-transparent to-transparent dark:from-primary-900/10">
      <h2 className="text-2xl font-bold text-foreground">
        {t("welcome", { name: serverName })}
      </h2>
      <div className="flex flex-col gap-2">
        <span className="text-muted-foreground my-3 text-sm">
          {t("guest_login_tip")}
        </span>
        <div className="w-44 h-44 self-center mb-4 p-3 rounded-2xl shadow-sm bg-white dark:bg-card">
          <QRCode level="Q" size={1200} link={qrUrl} />
        </div>
        {process.env.NODE_ENV == "development" && <span>{qrUrl}</span>}
        <Button onClick={handleSignIn} className="small">
          {t("sign_in")}
        </Button>
      </div>
    </section>
  );
};

export default GuestBlankPlaceholder;
