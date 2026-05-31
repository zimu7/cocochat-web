import { FC, ReactElement, useEffect, useState } from "react";
import clsx from "clsx";

import { useAppSelector } from "@/app/store";
import useExpiredResMap from "@/hooks/useExpiredResMap";
import { formatBytes, fromNowTime, getFileIcon } from "@/utils";
import {
  AudioPreview,
  CodePreview,
  DocPreview,
  ImagePreview,
  PdfPreview,
  VideoPreview,
} from "./preview";
import { shallowEqual } from "react-redux";
import DownloadArea from "../FileMessage/DownloadArea";
import { getFileTypeCategory } from "@/utils";

interface Data {
  file_type: string;
  name: string;
  content: string;
}

const renderPreview = (data: Data) => {
  const { file_type, name = "", content } = data;
  let preview: null | ReactElement = null;

  const _arr = name.split(".");
  const _type = file_type || _arr[_arr.length - 1];
  switch (getFileTypeCategory(_type)) {
    case "image":
      preview = <ImagePreview url={content} />;
      break;
    case "pdf":
      preview = <PdfPreview url={content} />;
      break;
    case "code":
      preview = <CodePreview url={content} />;
      break;
    case "doc":
      preview = <DocPreview url={content} />;
      break;
    case "audio":
      preview = <AudioPreview url={content} />;
      break;
    case "video":
      preview = <VideoPreview url={content} />;
      break;
  }
  return preview;
};

interface Props {
  preview?: boolean;
  flex: boolean;
  file_type: string;
  name: string;
  size: number;
  created_at: number;
  from_uid: number;
  content: string;
}

const FileBox: FC<Props> = ({
  preview,
  flex,
  file_type,
  name,
  size,
  created_at,
  from_uid,
  content,
}) => {
  const [fetchError, setFetchError] = useState(false);
  const { isExpired, setExpired } = useExpiredResMap();
  const fromUser = useAppSelector((store) => store.users.byId[from_uid], shallowEqual);
  const icon = getFileIcon(file_type, name, "icon w-9 h-12");
  const expired = isExpired(content);
  useEffect(() => {
    const tryFetch = async (url: string) => {
      try {
        const resp = await fetch(url, { method: "HEAD" });
        if (resp.status >= 400) {
          setFetchError(true);
        }
      } catch (e) {
        // HEAD may not be supported, skip silently
      }
    };
    if (!expired && content) {
      tryFetch(content);
    }
  }, [content, expired]);
  useEffect(() => {
    if (fetchError) {
      setExpired(content);
    }
  }, [fetchError, content]);

  if (!content || expired || fetchError) return null;

  const previewContent = renderPreview({ file_type, content, name });
  const withPreview = preview && previewContent && !fetchError && !expired;

  return (
    <div
      className={clsx(
        `rounded-md border border-solid border-border dark:border-border bg-muted dark:bg-secondary overflow-hidden`,
        flex ? "w-full max-w-3xl" : "w-full min-w-0",
        withPreview ? "relative h-[281px]" : "h-[66px] ",
        file_type.startsWith("audio") && "h-[125px]"
      )}
    >
      <div className="w-full min-w-0 p-2 flex items-center justify-between gap-2">
        {icon}
        <div className="flex flex-col gap-1 w-full overflow-hidden">
          <span className="font-semibold text-sm text-foreground dark:text-muted-foreground truncate">
            {name}
          </span>
          <em className="text-xs text-muted-foreground flex gap-4 not-italic">
            <span className="size">{formatBytes(size)}</span>
            <span className="hidden md:block time">{fromNowTime(created_at)}</span>
            <span>
              by <strong className="font-bold">{fromUser?.name || "Deleted User"}</strong>
            </span>
          </em>
        </div>
        <DownloadArea copyLink={content} downloadLink={`${content}&download=true`} />
      </div>
      {withPreview && <div className="h-[calc(100%_-_64px)] overflow-hidden">{previewContent}</div>}
    </div>
  );
};

export default FileBox;
