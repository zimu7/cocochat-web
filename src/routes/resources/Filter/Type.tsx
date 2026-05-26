import { FC } from "react";
import { useTranslation } from "react-i18next";

import CheckSign from "@/assets/icons/check.sign.svg";
import IconAudio from "@/assets/icons/file.audio.svg";
import IconCode from "@/assets/icons/file.code.svg";
import IconDoc from "@/assets/icons/file.doc.svg";
import IconImage from "@/assets/icons/file.image.svg";
import IconPdf from "@/assets/icons/file.pdf.svg";
import IconUnknown from "@/assets/icons/file.unknown.svg";
import IconVideo from "@/assets/icons/file.video.svg";

export const FileTypeIcons = {
  doc: <IconDoc className="w-4 h-auto" />,
  pdf: <IconPdf className="w-4 h-auto" />,
  image: <IconImage className="w-4 h-auto" />,
  audio: <IconAudio className="w-4 h-auto" />,
  video: <IconVideo className="w-4 h-auto" />,
  code: <IconCode className="w-4 h-auto" />,
  unknown: <IconUnknown className="w-4 h-auto" />,
};

export const FileTypeKeys: Record<string, string> = {
  doc: "doc",
  pdf: "pdf",
  image: "image",
  audio: "audio",
  video: "video",
  code: "code",
  unknown: "unknown",
};

type Props = {
  select: number;
  updateFilter: (param: { type?: string }) => void;
};
const Type: FC<Props> = ({ select = "", updateFilter }) => {
  const { t } = useTranslation("file");
  const handleClick = (type?: string) => {
    updateFilter({ type });
  };

  return (
    <div className="p-3 bg-white dark:bg-gray-800 min-w-[180px] overflow-auto shadow-md rounded-lg flex flex-col items-start relative">
      <ul className="w-full flex flex-col gap-4">
        <li
          className="relative cursor-pointer flex items-center gap-4 text-gray-500 dark:text-gray-300 font-semibold text-sm"
          onClick={handleClick.bind(null, undefined)}
        >
          {t("any_type")}
          {!select && <CheckSign className="absolute right-0 top-1/2 -translate-y-1/2" />}
        </li>
        {Object.entries(FileTypeKeys).map(([type, tKey]) => {
          return (
            <li
              key={type}
              className="relative cursor-pointer flex items-center gap-2 text-sm text-gray-500 dark:text-gray-300 font-semibold"
              onClick={handleClick.bind(null, type)}
            >
              {FileTypeIcons[type]} {t(tKey)}
              {select == type && (
                <CheckSign className="absolute right-0 top-1/2 -translate-y-1/2" />
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
};
export default Type;
