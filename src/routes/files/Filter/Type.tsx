import { FC } from "react";
import { useTranslation } from "react-i18next";

import CheckSign from "@/assets/icons/check.sign.svg";
import IconAudio from "@/assets/icons/file.audio.svg";
import IconDoc from "@/assets/icons/file.doc.svg";
import IconImage from "@/assets/icons/file.image.svg";
import IconPdf from "@/assets/icons/file.pdf.svg";
import IconVideo from "@/assets/icons/file.video.svg";

export const FileTypeIcons = {
  Doc: <IconDoc className="w-4 h-auto" />,
  PDF: <IconPdf className="w-4 h-auto" />,
  Image: <IconImage className="w-4 h-auto" />,
  Audio: <IconAudio className="w-4 h-auto" />,
  Video: <IconVideo className="w-4 h-auto" />,
};

export const FileTypeKeys: Record<string, string> = {
  Doc: "doc",
  PDF: "pdf",
  Image: "image",
  Audio: "audio",
  Video: "video",
};

type Props = {
  select: string;
  updateFilter: (param: { file_type?: string }) => void;
};
const Type: FC<Props> = ({ select = "", updateFilter }) => {
  const { t } = useTranslation("file");
  const handleClick = (file_type?: string) => {
    updateFilter({ file_type });
  };

  return (
    <div className="p-3 bg-white dark:bg-gray-800 min-w-[180px] overflow-auto shadow-md rounded-lg flex flex-col items-start relative">
      <ul className="w-full flex flex-col gap-4">
        <li
          className="relative cursor-pointer flex items-center gap-4 text-gray-500 dark:text-gray-300 font-semibold text-sm"
          onClick={handleClick.bind(null, "")}
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
