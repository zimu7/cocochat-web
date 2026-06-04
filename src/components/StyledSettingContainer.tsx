import { FC, PropsWithChildren, ReactNode } from "react";
import { NavLink } from "react-router-dom";
import clsx from "clsx";

import IconBack from "@/assets/icons/arrow.left.svg";
import IconCloseCircle from "@/assets/icons/close.circle.svg";
import MobileNavs from "../routes/home/MobileNavs";
import { Nav } from "../routes/settingChannel/navs";
import GoBackNav from "./GoBackNav";

// import ErrorCatcher from "./ErrorCatcher";
export interface Danger {
  title: string;
  handler: () => void;
}

interface Props {
  pathPrefix?: string;
  closeModal: () => void;
  title?: string;
  navs: Nav[];
  dangers: [Danger | boolean] | [];
  nav?: { title: string; name?: string; component?: ReactNode };
}

const StyledSettingContainer: FC<PropsWithChildren<Props>> = ({
  pathPrefix = "/setting",
  closeModal,
  title = "Settings",
  navs = [],
  dangers = [],
  nav,
  children
}) => {
  return (
    <>
      <div className="w-screen h-screen flex">
        <div
          className={clsx(
            "h-full w-full overflow-y-scroll md:max-w-[212px] px-4 py-8 bg-[#f0f0f0] dark:bg-[#1a1a1a] shadow-[inset_-1px_0px_0px_rgba(0,0,0,0.1)]",
            nav && "hidden md:block"
          )}
        >
          <h2
            onClick={closeModal}
            className="hidden md:flex gap-2 items-center text-sm md:text-base cursor-pointer mb-8 font-bold text-foreground dark:text-white"
          >
            <IconBack className="dark:fill-muted-foreground" /> {title}
          </h2>
          {navs.map(({ title, items }) => {
            return (
              <ul
                key={title}
                data-title={title}
                className="flex flex-col gap-y-0.5 mb-5 md:mb-9 before:md:pl-3 before:content-[attr(data-title)] before:font-bold before:text-xs before:text-muted-foreground"
              >
                {items.map(({ name, link, title, icon }) => {
                  if (link)
                    return (
                      <li
                        key={name}
                        className={clsx(
                          `md:text-sm font-semibold text-foreground whitespace-nowrap dark:text-muted-foreground md:rounded md:hover:bg-primary-400 md:dark:hover:bg-primary-400 md:hover:text-white md:dark:hover:text-white`,
                          name == nav?.name && "bg-primary-400 dark:bg-primary-400 text-white dark:text-white"
                        )}
                      >
                        <a
                          href={link}
                          target="_blank"
                          className="flex items-center gap-2 md:px-3 py-2"
                          rel="noreferrer"
                        >
                          {icon}
                          {title} <span className="text-xs mx-1">🔗</span>
                        </a>
                      </li>
                    );
                  return (
                    <li
                      key={name}
                      className={clsx(
                        `md:text-sm font-semibold text-foreground whitespace-nowrap dark:text-muted-foreground md:rounded md:hover:bg-primary-400 md:dark:hover:bg-primary-400 md:hover:text-white md:dark:hover:text-white`,
                        name == nav?.name && "bg-primary-400 dark:bg-primary-400 text-white dark:text-white"
                      )}
                    >
                      <NavLink to={`${pathPrefix}/${name}`} className="flex items-center gap-2 md:px-3 py-2">
                        {icon}
                        {title}
                      </NavLink>
                    </li>
                  );
                })}
              </ul>
            );
          })}
          {dangers.length ? (
            <ul className="flex flex-col gap-2 mb-9 md:text-sm font-semibold text-red-500 dark:text-red-400">
              {dangers.map((d) => {
                if (typeof d === "boolean" || !d) return null;
                const { title, handler } = d;
                return (
                  <li
                    key={title}
                    onClick={handler}
                    className="flex items-center gap-2 rounded cursor-pointer py-1.5 md:px-3"
                  >
                    <IconCloseCircle className="w-5 h-5 shrink-0 text-red-500 dark:text-red-400" />
                    {title}
                  </li>
                );
              })}
            </ul>
          ) : null}
        </div>
        <div
          className={clsx(
            "relative bg-white w-full max-h-full overflow-auto px-4 md:px-8 py-2 md:py-8 dark:bg-card",
            !nav ? "hidden md:block" : "!pb-4"
          )}
        >
          <GoBackNav path={pathPrefix} className="!left-1 top-1.5" />
          {nav && (
            <h4 className="font-bold text-xl text-center md:text-left text-foreground mb-4 md:mb-8 pl-4 md:pl-0 dark:text-foreground">
              {nav.title}
            </h4>
          )}
          {/* <ErrorCatcher> */}
          {children}
          {/* </ErrorCatcher> */}
        </div>
      </div>
      {!nav && <MobileNavs />}
    </>
  );
};

export default StyledSettingContainer;
