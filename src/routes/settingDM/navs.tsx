import { ReactNode } from "react";
import { useTranslation } from "react-i18next";

import AutoDeleteMessages from "../../components/AutoDeleteMessages";
import Overview from "./Overview";

export interface NavItem {
  name: string;
  title: string;
  icon?: ReactNode;
  component: ReactNode;
}

const icon = (cls: string) => <i className={`iconfont ${cls} text-foreground`} />;

export interface Nav {
  name?: string;
  title: string;
  items: NavItem[];
}

const useNavs = (uid: number): Nav[] => {
  const { t } = useTranslation("setting");
  return [
    {
      title: t("nav.general"),
      items: [
        {
          name: "overview",
          title: t("nav.overview"),
          icon: icon("icon-system"),
          component: <Overview id={uid} />
        },
        {
          name: "auto_delete_msg",
          title: t("nav.auto_delete_msg"),
          icon: icon("icon-data"),
          component: <AutoDeleteMessages id={uid} type="dm" />
        }
      ]
    }
  ];
};

export default useNavs;
