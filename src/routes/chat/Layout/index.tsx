import { FC, ReactElement, useEffect, useRef, useState, useCallback } from "react";
import { toast } from "react-hot-toast";
import clsx from "clsx";

import { useAppSelector } from "@/app/store";
import { ChatContext } from "@/types/common";
import ImagePreview from "@/components/ImagePreview";
import Send from "@/components/Send";
import useLicense from "@/hooks/useLicense";
import useUploadFile from "@/hooks/useUploadFile";
import IconWarning from "@/assets/icons/warning.svg";
import AddContactTip from "./AddContactTip";
import DnDTip from "./DnDTip";
import LicenseUpgradeTip from "./LicenseOutdatedTip";
import LoginTip from "./LoginTip";
import Operations from "./Operations";
import VirtualMessageFeed, { VirtualMessageFeedHandle } from "./VirtualMessageFeed";
import { shallowEqual } from "react-redux";

interface Props {
  readonly?: boolean;
  header: ReactElement;
  users?: ReactElement | null;
  dropFiles?: File[];
  context: ChatContext;
  to: number;
  feedRef?: React.RefObject<VirtualMessageFeedHandle>;
}

const Layout: FC<Props> = ({
  readonly = false,
  header,
  feedRef,
  users = null,
  dropFiles = [],
  context = "channel",
  to
}) => {
  // const { t } = useTranslation('chat');
  const { reachLimit } = useLicense();
  const { addStageFile } = useUploadFile({ context, id: to });
  const inputMode = useAppSelector((store) => store.ui.inputMode, shallowEqual);
  const selects = useAppSelector(
    (store) => store.ui.selectMessages[`${context}_${to}`],
    shallowEqual
  );
  const channelsData = useAppSelector((store) => store.channels.byId, shallowEqual);
  const usersData = useAppSelector((store) => store.users.byId, shallowEqual);

  const [isActive, setIsActive] = useState(false);
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);
  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsActive(true);
  }, []);
  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsActive(false);
  }, []);
  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsActive(false);
      if (inputMode !== "text") {
        toast("DnD not allowed in this input mode", {
          icon: <IconWarning className="w-5 h-5" />
        });
        return;
      }
      const files = Array.from(e.dataTransfer.files);
      if (files.length) {
        const filesData = files.map((file) => {
          const { size, type, name } = file;
          const url = URL.createObjectURL(file);
          return { size, type, name, url };
        });
        addStageFile(filesData);
      }
    },
    [inputMode, addStageFile]
  );

  useEffect(() => {
    if (dropFiles?.length) {
      const filesData = dropFiles.map((file) => {
        const { size, type, name } = file;
        const url = URL.createObjectURL(file);
        return { size, type, name, url };
      });
      addStageFile(filesData);
    }
  }, [dropFiles]);
  const name = context == "channel" ? channelsData[to]?.name : usersData[to]?.name;
  return (
    <>
      <ImagePreview />
      <section id="CHAT_WRAPPER" onDragOver={handleDragOver} onDragEnter={handleDragEnter} onDragLeave={handleDragLeave} onDrop={handleDrop} className={`relative h-full w-full rounded-r-2xl flex`}>
        <main className="flex flex-col flex-1">
          {header}
          <div className="w-full h-full flex items-start justify-between relative">
            <div className="rounded-br-2xl flex flex-col absolute bottom-0 w-full h-full">
              {context == "dm" && <AddContactTip uid={to} />}
              {/* 消息流 */}
              <VirtualMessageFeed ref={feedRef} context={context} id={to} />
              {/* 发送框 */}
              <div className={`px-2 py-0 md:p-4 ${selects ? "selecting" : ""}`}>
                {readonly ? (
                  <LoginTip />
                ) : reachLimit ? (
                  <LicenseUpgradeTip />
                ) : (
                  <div className={clsx(`flex justify-center`, selects && "hidden")}>
                    <Send id={to} context={context} />
                  </div>
                )}
                {selects && <Operations context={context} id={to} />}
              </div>
            </div>
          </div>
        </main>
        {users}
        {!readonly && inputMode == "text" && isActive && <DnDTip context={context} name={name} />}
      </section>
    </>
  );
};

export default Layout;
