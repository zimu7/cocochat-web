import { FC, ReactElement } from "react";
import * as ContextMenuPrimitive from "@radix-ui/react-context-menu";

import IconArrow from "@/assets/icons/arrow.right.svg";
import IconChecked from "@/assets/icons/check.sign.svg";

export interface Item {
  title: string;
  icon?: string | ReactElement;
  handler?: (param: any) => void;
  underline?: boolean;
  danger?: boolean;
  checked?: boolean;
  subs?: Item[];
}

interface Props {
  items: Item[];
  hideMenu?: (() => void);
}

const ContextMenu: FC<Props> = ({ items = [], hideMenu }) => {
  return (
    <ul className="context-menu">
      {items.map((item) => {
        const {
          title,
          icon = null,
          handler = (evt: any) => {
            hideMenu?.();
          },
          underline = false,
          danger = false,
          subs = []
        } = item;
        if (subs.length > 0)
          return (
            <li
              key={title}
              className={`item group ${underline ? "bottom_line" : ""} ${danger ? "danger" : ""} relative`}
            >
              {icon}
              {title}
              <IconArrow className="group-hover:fill-white dark:fill-muted-foreground absolute right-2 top-2" />
              <ul className="context-menu sub-menu">
                {subs.map((sub) => {
                  const {
                    title: subTitle,
                    icon: subIcon = null,
                    handler: subHandler = (evt: any) => {
                      hideMenu?.();
                    },
                    underline: subUnderline = false,
                    danger: subDanger = false,
                    checked: subChecked = false
                  } = sub;
                  return (
                    <li
                      className={`item group ${subUnderline ? "bottom_line" : ""} ${subDanger ? "danger" : ""}`}
                      key={subTitle}
                      onClick={(evt) => {
                        if (subChecked) return;
                        subHandler(evt);
                        hideMenu?.();
                      }}
                    >
                      {subIcon}
                      {subTitle}
                      {subChecked && (
                        <IconChecked className="group-hover:fill-white dark:fill-muted-foreground absolute right-2 top-2" />
                      )}
                    </li>
                  );
                })}
              </ul>
            </li>
          );

        return (
          <li
            className={`item ${underline ? "bottom_line" : ""} ${danger ? "danger" : ""}`}
            key={title}
            onClick={(evt) => {
              handler(evt);
              hideMenu?.();
            }}
          >
            {icon}
            {title}
          </li>
        );
      })}
    </ul>
  );
};

export { ContextMenuPrimitive };
export default ContextMenu;
