import { useTranslation } from "react-i18next";

import { useAppSelector } from "@/app/store";
import ManageMembers from "./ManageMembers";
import Version from "@/components/Version";
import DataManagement from "./DataManagement";
import MyAccount from "./MyAccount";
import Overview from "./Overview";
import { shallowEqual } from "react-redux";
import IconInfo from "@/assets/icons/info.filled.svg";
import IconUser from "@/assets/icons/user.svg";
import IconPeople from "@/assets/icons/people.svg";
import IconFolder from "@/assets/icons/folder.svg";
import IconVersion from "@/assets/icons/version.svg";
import IconCloseCircle from "@/assets/icons/close.circle.svg";

const iconClass = "w-5 h-5 shrink-0 text-muted-foreground";

const dataManagementNav = {
  name: "data_management",
  icon: <IconFolder className={iconClass} />,
  component: <DataManagement />,
  admin: true,
};
const navs = [
  {
    name: "general",
    items: [
      {
        name: "overview",
        icon: <IconInfo className={iconClass} />,
        component: <Overview />,
      },
      {
        name: "my_account",
        icon: <IconUser className={iconClass} />,
        component: <MyAccount />,
      },
      {
        name: "member_management",
        icon: <IconPeople className={iconClass} />,
        component: <ManageMembers />,
        admin: true,
      },
    ],
  },
  // {
  //   name: "config",
  //   items: [
  //     {
  //       name: "bot",
  //       component: <BotConfig />,
  //       admin: true,
  //     },
  //     {
  //       name: "login_method",
  //       component: <Logins />,
  //     },
  //   ],
  //   admin: true,
  // },
  {
    name: "about",
    items: [
      {
        name: "version",
        icon: <IconVersion className={iconClass} />,
        component: <Version />,
      },
    ],
  },
];

const useNavs = () => {
  const { t } = useTranslation("setting");
  const loginUser = useAppSelector((store) => store.authData.user, shallowEqual);
  const upgraded = useAppSelector((store) => store.server.upgraded, shallowEqual);
  const filteredNavs = loginUser?.is_admin
    ? navs
    : navs
        .filter((nav) => {
          return !nav.admin;
        })
        .map((nav) => {
          const { name, items, ...rest } = nav;
          return {
            name,
            items: items.filter((item) => {
              return !item.admin;
            }),
            ...rest,
          };
        });
  if (
    loginUser?.uid == 1 &&
    !filteredNavs[0].items.some((item) => item.name == "data_management")
  ) {
    // super admin
    filteredNavs[0].items.push(dataManagementNav);
  }
  const transformedNavs = filteredNavs.map((n) => {
    const { name, items, ...rest } = n;
    return {
      name,
      // @ts-ignore
      title: t(`nav.${name}`),
      items: items.map((item) => {
        const { name, ...rest } = item;
        return {
          name,
          // @ts-ignore
          title: t(`nav.${name}`),
          ...rest,
        };
      }),
      ...rest,
    };
  });
  return transformedNavs.filter((nav) => {
    if (loginUser?.is_admin) {
      return true;
    } else {
      // about 特殊处理下
      // if (nav.name == "about") {
      //   // 有付费，但是普通用户，则不显示 about
      //   return !upgraded;
      // } else {
      return !nav.admin;
      // }
    }
  });
};

export default useNavs;
