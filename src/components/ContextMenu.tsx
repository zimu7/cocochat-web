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
  variant?: "context" | "plain";
}

// Radix ContextMenu 的点击事件处理使用 flushSync，与同一事件循环中的
// React Router navigate / Redux dispatch 等状态更新冲突。
// 将 handler 推迟到下一个事件循环执行，避开冲突。
const deferHandler = (handler: (param: any) => void, evt: any) => {
  setTimeout(() => handler(evt), 0);
};

const ContextMenu: FC<Props> = ({ items = [], hideMenu, variant = "context" }) => {
  const isPlain = variant === "plain";
  const invokeHandler = isPlain
    ? (handler: (param: any) => void, evt: any) => handler(evt)
    : deferHandler;

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
          return isPlain ? (
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
                        invokeHandler(subHandler, evt);
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
          ) : (
            <ContextMenuPrimitive.Item
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
                    <ContextMenuPrimitive.Item
                      className={`item group ${subUnderline ? "bottom_line" : ""} ${subDanger ? "danger" : ""}`}
                      key={subTitle}
                      onClick={(evt) => {
                        if (subChecked) return;
                        invokeHandler(subHandler, evt);
                        hideMenu?.();
                      }}
                    >
                      {subIcon}
                      {subTitle}
                      {subChecked && (
                        <IconChecked className="group-hover:fill-white dark:fill-muted-foreground absolute right-2 top-2" />
                      )}
                    </ContextMenuPrimitive.Item>
                  );
                })}
              </ul>
            </ContextMenuPrimitive.Item>
          );

        return isPlain ? (
          <li
            className={`item ${underline ? "bottom_line" : ""} ${danger ? "danger" : ""}`}
            key={title}
            onClick={(evt) => {
              invokeHandler(handler, evt);
              hideMenu?.();
            }}
          >
            {icon}
            {title}
          </li>
        ) : (
          <ContextMenuPrimitive.Item
            className={`item ${underline ? "bottom_line" : ""} ${danger ? "danger" : ""}`}
            key={title}
            onClick={(evt) => {
              invokeHandler(handler, evt);
              hideMenu?.();
            }}
          >
            {icon}
            {title}
          </ContextMenuPrimitive.Item>
        );
      })}
    </ul>
  );
};

export { ContextMenuPrimitive };
export default ContextMenu;