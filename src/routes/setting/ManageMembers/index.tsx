import { useTranslation } from "react-i18next";

export default function ManageMembers() {
  const { t } = useTranslation("member");
  return <div className="p-4">{t("members")}</div>;
}
