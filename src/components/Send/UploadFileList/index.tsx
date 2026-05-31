import { useState } from "react";
import Spinner from "@/components/Spinner";

import { ChatContext } from "@/types/common";
import useUploadFile from "@/hooks/useUploadFile";
import { formatBytes, getFileIcon, shouldPreviewImage } from "@/utils";
import DeleteIcon from "@/assets/icons/delete.svg";
import EditIcon from "@/assets/icons/edit.svg";
import EditFileDetailsModal from "./EditFileDetails";

type EditProps = {
  index: number;
  name: string;
};
export default function UploadFileList({ context, id }: { context: ChatContext; id: number }) {
  const [editInfo, setEditInfo] = useState<EditProps | null>(null);
  const { stageFiles, updateStageFile, removeStageFile } = useUploadFile({
    context,
    id
  });
  const toggleModalVisible = (info: EditProps) => {
    setEditInfo((prev) => (prev ? null : info));
  };
  const handleOpenEditModal = (idx: number) => {
    const info = stageFiles[`${idx}`];
    if (!info) return;

    toggleModalVisible({ ...info, index: idx });
  };
  const updateFileName = (name: string) => {
    if (!name || !editInfo) return;
    const { index } = editInfo;
    updateStageFile(index, { name });
  };

  if (!context || !id || !stageFiles || stageFiles.length == 0) return null;

  return (
    <>
      {editInfo && (
        <EditFileDetailsModal
          name={editInfo.name}
          updateName={updateFileName}
          closeModal={toggleModalVisible}
        />
      )}

      <ul className="w-full overflow-auto flex gap-2 justify-start p-4 pt-6 bg-muted/30 dark:bg-secondary/50 rounded-t-xl border-b border-border/30">
        {stageFiles.map(({ name, url, size, type, converting, uploading, uploaded, progress }, idx: number) => {
          return (
            <li
              className="group relative flex flex-col bg-muted dark:bg-card rounded p-2"
              key={url}
            >
              {(uploading || converting) && (
                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/30 rounded">
                  <Spinner type="waveform" size={18} lineWeight={3} speed={1} color="#fff" />
                  {uploading && typeof progress === "number" && (
                    <span className="mt-1 text-xs text-white font-medium">{progress}%</span>
                  )}
                </div>
              )}
              {uploaded && (
                <div className="absolute top-1 right-1 z-10 w-5 h-5 flex-center bg-green-500 rounded-full">
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
              <div className="flex-center w-20 h-20 md:w-40 md:h-40">
                {shouldPreviewImage(type) ? (
                  converting ? (
                    <Spinner type="waveform" size={18} lineWeight={3} speed={1} color="#aaa" />
                  ) : (
                    <img className="w-full h-full object-cover" src={url} alt="image" />
                  )
                ) : (
                  getFileIcon(type, name)
                )}
              </div>
              <h4 className="w-20 md:w-40 mt-1 md:mt-4 mb-0.5 md:font-semibold text-xs md:text-sm text-foreground dark:text-foreground truncate">
                {name}
              </h4>
              <span className="text-xs text-muted-foreground">{formatBytes(size)}</span>
              <ul className="invisible group-hover:visible bg-inherit border border-solid border-black/10 box-border rounded-md flex items-center absolute -right-5 -top-2.5">
                <li
                  className="p-1 cursor-pointer edit"
                  onClick={handleOpenEditModal.bind(null, idx)}
                >
                  <EditIcon />
                </li>
                <li
                  className="p-1 cursor-pointer delete"
                  data-index={idx}
                  onClick={removeStageFile.bind(null, idx)}
                >
                  <DeleteIcon />
                </li>
              </ul>
            </li>
          );
        })}
      </ul>
    </>
  );
}
