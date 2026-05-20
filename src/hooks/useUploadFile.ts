import { useRef, useState } from "react";
import toast from "react-hot-toast";

import BASE_URL, { FILE_SLICE_SIZE } from "@/app/config";
import { usePrepareUploadFileMutation, useUploadFileMutation } from "@/app/services/message";
import { updateUploadFiles } from "@/app/slices/ui";
import { useAppDispatch, useAppSelector } from "@/app/store";
import { Message } from "@/types/channel";
import { ChatContext } from "@/types/common";
import { UploadFileResponse } from "@/types/message";
import { shallowEqual } from "react-redux";

export type UploadFileResult = {
  name: string;
  file_type: string;
  path: string;
  size: number;
  hash: string;
  url: string;
  thumbnail: string;
  download: string;
};

export type UploadFileData = {
  name: string;
  type: string;
  size: number;
  url: string;
  converting?: boolean;
  uploading?: boolean;
  uploaded?: boolean;
  uploadResult?: UploadFileResult;
};
interface IProps {
  context: ChatContext;
  id: number;
}
const convertHeic2Jpg = async (file: { name: string; type: string; size: number; url: string }) => {
  const heic2any = await import("heic2any").then((m) => m.default);
  const res = await fetch(file.url);
  const blob = await res.blob();
  const jpgBlob = (await heic2any({
    blob,
    toType: "image/jpeg",
    quality: 0.8
  })) as Blob;
  const newName = file.name.replace(/\.hei\w$/i, ".jpg");
  return { ...file, name: newName, converting: false, url: URL.createObjectURL(jpgBlob) };
};
const useUploadFile = (props?: IProps) => {
  const { context, id } = props ? props : { context: "channel", id: 0 };
  const dispatch = useAppDispatch();
  const stageFiles = useAppSelector(
    (store) => store.ui.uploadFiles[`${context}_${id}`] || [],
    shallowEqual
  );
  const replying = useAppSelector(
    (store) => store.message.replying[`${context}_${id}`],
    shallowEqual
  );
  const [data, setData] = useState<Message | null>(null);
  const canceledRef = useRef(false);
  const sliceUploadedCountRef = useRef(0);
  const totalSliceCountRef = useRef(1);
  const [prepareUploadFile, { isLoading: isPreparing, isError: prepareFileError }] =
    usePrepareUploadFileMutation();
  const [uploadFileFn, { isLoading: isUploading, isError: uploadFileError }] =
    useUploadFileMutation();

  const autoUploadQueueRef = useRef<UploadFileData[]>([]);
  const isProcessingQueueRef = useRef(false);
  const cancelledUrlsRef = useRef<Set<string>>(new Set());

  const uploadChunk = (data: { file_id: string; chunk: Blob; is_last: boolean }) => {
    const { file_id, chunk, is_last } = data;
    const formData = new FormData();
    formData.append("file_id", file_id);
    formData.append("chunk_data", chunk);
    formData.append("chunk_is_last", `${is_last}`);
    return uploadFileFn(formData);
  };

  const uploadFile = async (file?: File, isCancelled?: () => boolean) => {
    if (!file) return;
    const cancelled = isCancelled || (() => false);

    setData(null);
    const {
      name = `-${+new Date()}.${file.type.split("/")[1]}`,
      type: file_type,
      size: file_size
    } = file;
    // 生成 file id
    const resp = await prepareUploadFile({
      content_type: file_type,
      filename: name
    });
    if ("error" in resp || cancelled()) {
      return;
    }
    const file_id = resp.data;

    let uploadResult = null;
    canceledRef.current = false;
    totalSliceCountRef.current = 1;
    sliceUploadedCountRef.current = 0;
    if (file_size <= FILE_SLICE_SIZE) {
      uploadResult = await uploadChunk({ file_id, chunk: file, is_last: true });
      sliceUploadedCountRef.current = 1;
    } else {
      totalSliceCountRef.current = Math.ceil(file_size / FILE_SLICE_SIZE);
      const totalSliceCount = totalSliceCountRef.current;
      const _arr = new Array(totalSliceCount);

      for await (const [idx] of _arr.entries()) {
        if (canceledRef.current || cancelled()) break;
        try {
          const chunk = file.slice(FILE_SLICE_SIZE * idx, FILE_SLICE_SIZE * (idx + 1), file_type);

          uploadResult = await uploadChunk({
            file_id,
            chunk,
            is_last: idx == _arr.length - 1
          });
          sliceUploadedCountRef.current++;
        } catch (error) {
          console.error("upload file error", error);
          canceledRef.current = true;
          return;
        }
      }
    }
    if (cancelled()) return;
    if (!uploadResult || "error" in uploadResult || !uploadResult.data) {
      console.error("upload file error uploadResult:", uploadResult);
      return;
    }
    const { path, size, hash } = uploadResult.data as UploadFileResponse;
    const encodedPath = encodeURIComponent(path);
    const res: UploadFileResult = {
      name,
      file_type,
      path,
      size,
      hash,
      url: `${BASE_URL}/resource/file?file_path=${encodedPath}`,
      thumbnail: file_type.startsWith("image")
        ? `${BASE_URL}/resource/file?file_path=${encodedPath}&thumbnail=true`
        : "",
      download: `${BASE_URL}/resource/file?file_path=${encodedPath}&download=true`
    };
    setData(res);
    return res;
  };

  const processAutoUploadQueue = async () => {
    if (isProcessingQueueRef.current) return;
    isProcessingQueueRef.current = true;

    while (autoUploadQueueRef.current.length > 0) {
      const fileData = autoUploadQueueRef.current.shift()!;

      if (cancelledUrlsRef.current.has(fileData.url)) continue;

      dispatch(
        updateUploadFiles({
          context,
          id,
          operation: "update_upload",
          url: fileData.url,
          uploading: true
        })
      );

      try {
        const { url, name, type } = fileData;
        const blob = await fetch(url).then((r) => r.blob());
        const file = new File([blob], name, { type });
        const result = await uploadFile(file, () => cancelledUrlsRef.current.has(fileData.url));

        if (cancelledUrlsRef.current.has(fileData.url)) continue;

        if (result) {
          dispatch(
            updateUploadFiles({
              context,
              id,
              operation: "update_upload",
              url: fileData.url,
              uploading: false,
              uploaded: true,
              uploadResult: result
            })
          );
        } else {
          dispatch(
            updateUploadFiles({
              context,
              id,
              operation: "update_upload",
              url: fileData.url,
              uploading: false
            })
          );
        }
      } catch (error) {
        console.error("auto upload error", error);
        if (!cancelledUrlsRef.current.has(fileData.url)) {
          dispatch(
            updateUploadFiles({
              context,
              id,
              operation: "update_upload",
              url: fileData.url,
              uploading: false
            })
          );
        }
      }
    }

    isProcessingQueueRef.current = false;
  };

  const stopUploading = () => {
    canceledRef.current = true;
  };

  const removeStageFile = (idx: number) => {
    const file = stageFiles[idx];
    if (file) {
      cancelledUrlsRef.current.add(file.url);
      autoUploadQueueRef.current = autoUploadQueueRef.current.filter(
        (f) => f.url !== file.url
      );
    }
    dispatch(updateUploadFiles({ context, id, operation: "remove", index: idx }));
  };

  const addStageFile = (filesData: UploadFileData[]) => {
    if (replying) {
      toast.error("Only text is supported when replying a message");
      return;
    }

    const heifs: number[] = [];
    filesData.forEach((f, idx) => {
      if (f.type.startsWith("image/hei")) {
        f.converting = true;
        heifs.push(idx);
      }
    });
    dispatch(updateUploadFiles({ context, id, data: filesData }));

    const nonConvertingFiles = filesData.filter((f) => !f.converting);
    autoUploadQueueRef.current.push(...nonConvertingFiles);

    if (heifs.length) {
      heifs.forEach((idx) => {
        convertHeic2Jpg(filesData[idx]).then((convertedData) => {
          dispatch(
            updateUploadFiles({ context, id, data: convertedData, operation: "replace", idx })
          );
          autoUploadQueueRef.current.push(convertedData);
          processAutoUploadQueue();
        });
      });
    }

    processAutoUploadQueue();
  };

  const resetStageFiles = () => {
    autoUploadQueueRef.current = [];
    cancelledUrlsRef.current.clear();
    dispatch(updateUploadFiles({ context, id, operation: "reset" }));
  };

  const updateStageFile = (idx: number, data = {}) => {
    dispatch(
      updateUploadFiles({
        context,
        id,
        operation: "update",
        index: idx,
        ...data
      })
    );
  };

  const isAnyFileUploading = stageFiles.some((f) => f.uploading);

  return {
    stopUploading,
    data,
    isUploading: isPreparing || isUploading,
    progress: +Number((sliceUploadedCountRef.current / totalSliceCountRef.current) * 100).toFixed(
      2
    ),
    uploadFile,
    isError: uploadFileError || prepareFileError,
    isSuccess: !!data,
    stageFiles,
    addStageFile,
    resetStageFiles,
    removeStageFile,
    updateStageFile,
    isAnyFileUploading
  };
};
export default useUploadFile;
