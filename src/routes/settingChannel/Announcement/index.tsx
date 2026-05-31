import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { useAppSelector } from "@/app/store";
import {
  useGetGroupAnnouncementQuery,
  useCreateOrUpdateGroupAnnouncementMutation,
  useDeleteGroupAnnouncementMutation,
} from "@/app/services/server";
import Label from "@/components/styled/Label";
import Button from "@/components/styled/Button";
import Textarea from "@/components/styled/Textarea";
import MarkdownRender from "@/components/MarkdownRender";
import { shallowEqual } from "react-redux";

export default function Announcement({ id = 0 }) {
  const { t } = useTranslation("setting", { keyPrefix: "channel" });
  const { t: ct } = useTranslation();
  const loginUser = useAppSelector((store) => store.authData.user, shallowEqual);
  const channel = useAppSelector((store) => store.channels.byId[id], shallowEqual);

  const { data: announcementResponse, refetch } = useGetGroupAnnouncementQuery(id, {
    skip: !id
  });
  const [createOrUpdate, { isSuccess: saveSuccess, isLoading: saving }] =
    useCreateOrUpdateGroupAnnouncementMutation();
  const [deleteAnnouncement, { isSuccess: deleteSuccess, isLoading: deleting }] =
    useDeleteGroupAnnouncementMutation();

  const [content, setContent] = useState("");
  const [mode, setMode] = useState<"edit" | "preview">("edit");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const announcement = announcementResponse?.announcement;
  const canManage = loginUser?.is_admin || channel?.owner === loginUser?.uid;

  useEffect(() => {
    if (announcement) {
      setContent(announcement.content);
    }
  }, [announcement]);

  useEffect(() => {
    if (saveSuccess) {
      toast.success(ct("tip.update"));
      refetch();
    }
  }, [saveSuccess]);

  useEffect(() => {
    if (deleteSuccess) {
      toast.success(ct("error.announcement_deleted"));
      setContent("");
      setShowDeleteConfirm(false);
      refetch();
    }
  }, [deleteSuccess]);

  const handleSave = () => {
    if (!content.trim()) {
      toast.error(ct("error.announcement_empty"));
      return;
    }
    if (content.length > 5000) {
      toast.error(ct("error.announcement_too_long"));
      return;
    }
    createOrUpdate({ gid: id, content: content.trim() });
  };

  const handleDelete = () => {
    deleteAnnouncement(id);
  };

  return (
    <>
      {!canManage ? (
        <div className="w-[512px] p-4 text-muted-foreground dark:text-muted-foreground">
          {t("no_permission")}
        </div>
      ) : (
        <div className="w-[512px] flex flex-col gap-6 h-full mb-10">
          <div className="flex flex-col gap-2">
            <Label>{t("announcement_title")}</Label>
            <p className="text-sm text-muted-foreground dark:text-muted-foreground">
              {t("announcement_desc")}
            </p>
          </div>

          {/* Tab Switcher */}
          <div className="flex gap-2 border-b border-border dark:border-gray-700">
            <button
              onClick={() => setMode("edit")}
              className={`px-4 py-2 font-medium transition-colors ${
                mode === "edit"
                  ? "text-primary-500 border-b-2 border-primary-500"
                  : "text-muted-foreground dark:text-muted-foreground hover:text-foreground dark:hover:text-muted-foreground"
              }`}
            >
              {t("announcement_edit")}
            </button>
            <button
              onClick={() => setMode("preview")}
              className={`px-4 py-2 font-medium transition-colors ${
                mode === "preview"
                  ? "text-primary-500 border-b-2 border-primary-500"
                  : "text-muted-foreground dark:text-muted-foreground hover:text-foreground dark:hover:text-muted-foreground"
              }`}
            >
              {t("announcement_preview")}
            </button>
          </div>

          {/* Content Area */}
          {mode === "edit" ? (
            <div className="flex flex-col gap-2">
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={12}
                placeholder={
                  t("announcement_placeholder")
                }
                className="font-mono"
              />
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground dark:text-muted-foreground">
                  {t("announcement_char_count", { count: content.length })}
                </span>
                {content.length > 5000 && (
                  <span className="text-red-500">{t("announcement_char_exceeded")}</span>
                )}
              </div>
            </div>
          ) : (
            <div className="border border-border dark:border-gray-700 rounded p-4 min-h-[300px] bg-muted/50 dark:bg-secondary">
              {content.trim() ? (
                <MarkdownRender content={content} />
              ) : (
                <p className="text-muted-foreground dark:text-muted-foreground italic">
                  {t("no_announcements")}
                </p>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button onClick={handleSave} disabled={saving || !content.trim() || content.length > 5000}>
              {saving ? t("announcement_saving") : announcement ? t("announcement_update") : t("announcement_create")}
            </Button>

            {announcement && (
              <>
                {!showDeleteConfirm ? (
                  <Button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="!bg-red-500 hover:!bg-red-600"
                    disabled={deleting}
                  >
                    {t("announcement_delete")}
                  </Button>
                ) : (
                  <div className="flex gap-2 items-center">
                    <span className="text-sm text-foreground dark:text-muted-foreground">
                      {t("announcement_delete_confirm")}
                    </span>
                    <Button
                      onClick={handleDelete}
                      className="!bg-red-500 hover:!bg-red-600"
                      disabled={deleting}
                    >
                      {deleting ? t("announcement_deleting") : t("announcement_confirm_delete")}
                    </Button>
                    <Button
                      onClick={() => setShowDeleteConfirm(false)}
                      className="!bg-gray-500 hover:!bg-secondary"
                    >
                      {t("announcement_cancel")}
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
