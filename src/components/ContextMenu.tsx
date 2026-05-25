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

const SubMenu = ({ items, hideMenu }: { items: Item[]; hideMenu?: () => void }) => {
  return (
    <ul className="context-menu">
      {items.map((sub) => {
        const {
          title,
          icon = null,
          handler = (evt) => {
            evt.preventDefault();
            hideMenu?.();
          },
          underline = false,
          danger = false,
          checked = false
        } = sub;
        return (
          <li
            className={`item group ${underline ? "bottom_line" : ""} ${danger ? "danger" : ""}`}
            key={title}
            onClick={(evt) => {
              evt.stopPropagation();
              evt.preventDefault();
              if (checked) return;
              handler(evt);
              hideMenu?.();
            }}
          >
            {icon}
            {title}
            {checked && (
              <IconChecked className="group-hover:fill-white dark:fill-gray-300 absolute right-2 top-2" />
            )}
          </li>
        );
      })}
    </ul>
  );
};

const ContextMenu: FC<Props> = ({ items = [], hideMenu }) => {
  return (
    <ul className="context-menu">
      {items.map((item) => {
        const {
          title,
          icon = null,
          handler = (evt) => {
            evt.preventDefault();
            hideMenu?.();
          },
          underline = false,
          danger = false,
          subs = []
        } = item;
        if (subs.length > 0)
          return (
            <ContextMenuPrimitive.Sub key={title}>
              <ContextMenuPrimitive.SubTrigger className={`item group ${underline ? "bottom_line" : ""} ${danger ? "danger" : ""}`}>
                {icon}
                {title}
                <IconArrow className="group-hover:fill-white dark:fill-gray-300 absolute right-2 top-2" />
              </ContextMenuPrimitive.SubTrigger>
              <ContextMenuPrimitive.Portal>
                <ContextMenuPrimitive.SubContent className="z-50">
                  <SubMenu items={subs} hideMenu={hideMenu} />
                </ContextMenuPrimitive.SubContent>
              </ContextMenuPrimitive.Portal>
            </ContextMenuPrimitive.Sub>
          );

        return (
          <li
            className={`item ${underline ? "bottom_line" : ""} ${danger ? "danger" : ""}`}
            key={title}
            onClick={(evt) => {
              evt.stopPropagation();
              evt.preventDefault();
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
