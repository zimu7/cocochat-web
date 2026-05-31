import { useTranslation } from "react-i18next";

export default function ExpiredTip() {
  const { t } = useTranslation("auth", { keyPrefix: "magic_link_expire" });
  return (
    <div className="flex flex-col items-center">
      <div className="font-bold text-3xl text-foreground dark:text-white mt-3">{t("title")}</div>
      <p className="text-center text-muted-foreground mb-6">{t("desc")}</p>
      <p className="text-center text-muted-foreground">{t("desc_close")}</p>
    </div>
  );
}
