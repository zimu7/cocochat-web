import { useState, useMemo, ChangeEvent } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";

import { useUpdateUserMutation } from "@/app/services/user";
import { StoredUser, removeUser } from "@/app/slices/users";
import { useAppSelector, useAppDispatch } from "@/app/store";
import Avatar from "@/components/Avatar";
import Button from "@/components/styled/Button";
import Input from "@/components/styled/Input";
import IconAdmin from "@/assets/icons/owner.svg";
import IconBot from "@/assets/icons/bot.svg";
import UserFormModal from "./CreateUserModal";
import ResetPasswordModal from "./ResetPasswordModal";
import ManageAPIKeysModal from "./ManageAPIKeysModal";
import DeleteUserModal from "./DeleteUserModal";

const tdClass =
  "p-6 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100 align-top";

type UserTarget = { uid: number; name: string };

export default function ManageMembers() {
  const { t } = useTranslation("member");
  const { t: ct } = useTranslation();
  const dispatch = useAppDispatch();
  const [searchQuery, setSearchQuery] = useState("");
  const [updateUser] = useUpdateUserMutation();

  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [editTarget, setEditTarget] = useState<StoredUser | null>(null);
  const [resetPwdTarget, setResetPwdTarget] = useState<UserTarget | null>(null);
  const [apiKeysTarget, setApiKeysTarget] = useState<number | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<UserTarget | null>(null);

  const members = useAppSelector((store) =>
    Object.values(store.users.byId)
  );
  const loginUser = useAppSelector((store) => store.authData.user);

  const filteredMembers = useMemo(() => {
    if (!searchQuery.trim()) return members;
    const query = searchQuery.toLowerCase().trim();
    return members.filter(
      (u) =>
        u.name?.toLowerCase().includes(query) ||
        u.email?.toLowerCase().includes(query)
    );
  }, [members, searchQuery]);

  const handleAdminToggle = async (uid: number, isAdmin: boolean, isBot: boolean) => {
    if (uid === 1) return; // super admin must remain admin
    if (uid === loginUser?.uid) return;
    try {
      await updateUser({ id: uid, is_admin: !isAdmin, is_bot: false }).unwrap();
      toast.success(ct("tip.update"));
    } catch {
      toast.error(ct("tip.operation_failed"));
    }
  };

  const handleBotToggle = async (uid: number, isBot: boolean, isAdmin: boolean) => {
    if (uid === 1) return; // super admin cannot be bot
    try {
      await updateUser({ id: uid, is_bot: !isBot, is_admin: false }).unwrap();
      toast.success(ct("tip.update"));
    } catch {
      toast.error(ct("tip.operation_failed"));
    }
  };

  const toggleCreateModal = () => setCreateModalVisible((prev) => !prev);
  const toggleEditModal = (user?: StoredUser) => setEditTarget(user || null);
  const toggleResetPwdModal = (target?: UserTarget) => setResetPwdTarget(target || null);
  const toggleApiKeysModal = (uid?: number) => setApiKeysTarget(uid || null);
  const toggleDeleteModal = (target?: UserTarget) => setDeleteTarget(target || null);

  const handleSearchChange = (evt: ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(evt.target.value);
  };

  return (
    <>
      <div className="flex flex-col justify-start items-start gap-4">
        <div className="flex flex-col gap-1">
          <h2 className="font-semibold flex gap-4 items-center dark:text-white">
            {t("manage_members")}
          </h2>
          <p className="text-gray-400 text-xs">{t("manage_tip")}</p>
        </div>

        <div className="flex items-center gap-4 w-full">
          <div className="max-w-sm flex-1">
            <Input
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder={t("search_placeholder")}
            />
          </div>
          <Button onClick={toggleCreateModal} className="small">
            {ct("action.add")}
          </Button>
        </div>

        <div className="w-full overflow-auto">
          <table className="min-w-full table-auto">
            <thead className="border-b dark:border-b-gray-500 bg-gray-50 dark:bg-gray-600">
              <tr>
                {[
                  t("username"),
                  t("email"),
                  t("admin"),
                  t("bot"),
                  t("operations"),
                ].map((title) => (
                  <th
                    key={title}
                    scope="col"
                    className="text-sm font-bold text-gray-900 dark:text-gray-100 px-6 py-4 text-left"
                  >
                    {title}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredMembers.map((user) => {
                const { uid, name, avatar, email, is_admin, is_bot } = user;
                const isSelf = uid === loginUser?.uid;
                const isSuperAdmin = uid === 1;
                return (
                  <tr
                    key={uid}
                    className="bg-white dark:bg-gray-800 border-b dark:border-b-gray-500 transition duration-300 ease-in-out md:hover:bg-gray-100 dark:md:hover:bg-transparent"
                  >
                    <td className={tdClass}>
                      <div className="flex items-center gap-2">
                        <Avatar
                          width={36}
                          height={36}
                          src={avatar}
                          name={name}
                          alt="avatar"
                          className="rounded-full"
                        />
                        <div>
                          <div className="flex items-center gap-1">
                            {name}
                            {is_admin && (
                              <IconAdmin className="w-4 h-4" />
                            )}
                            {is_bot && (
                              <IconBot className="w-4 h-4" />
                            )}
                          </div>
                          <div className="text-xs text-gray-500">#{uid}</div>
                        </div>
                      </div>
                    </td>
                    <td className={tdClass}>{email}</td>
                    <td className={tdClass}>
                      <input
                        type="checkbox"
                        checked={is_admin}
                        disabled={isSelf || isSuperAdmin || is_bot}
                        onChange={() => handleAdminToggle(uid, is_admin, !!is_bot)}
                        className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer disabled:cursor-not-allowed"
                      />
                    </td>
                    <td className={tdClass}>
                      <input
                        type="checkbox"
                        checked={!!is_bot}
                        disabled={isSuperAdmin || is_admin}
                        onChange={() => handleBotToggle(uid, !!is_bot, is_admin)}
                        className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer disabled:cursor-not-allowed"
                      />
                    </td>
                    <td className={tdClass}>
                      <div className="flex items-center gap-2">
                        <Button
                          className="mini ghost"
                          onClick={() => toggleEditModal(user)}
                        >
                          {ct("action.edit")}
                        </Button>
                        <Button
                          className="mini ghost"
                          onClick={() => toggleResetPwdModal({ uid, name })}
                        >
                          {t("reset_password")}
                        </Button>
                        <Button
                          className="mini ghost"
                          onClick={() => toggleApiKeysModal(uid)}
                        >
                          {t("manage_api_keys")}
                        </Button>
                        {!isSelf && (
                          <Button
                            className="mini ghost"
                            onClick={() => toggleDeleteModal({ uid, name })}
                          >
                            {ct("action.remove")}
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filteredMembers.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="text-center text-sm text-gray-400 py-8"
                  >
                    {t("search_empty")}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

      </div>

      {createModalVisible && (
        <UserFormModal closeModal={toggleCreateModal} />
      )}
      {editTarget && (
        <UserFormModal closeModal={() => toggleEditModal()} user={editTarget} />
      )}
      {resetPwdTarget && (
        <ResetPasswordModal
          uid={resetPwdTarget.uid}
          name={resetPwdTarget.name}
          closeModal={() => toggleResetPwdModal()}
        />
      )}
      {apiKeysTarget && (
        <ManageAPIKeysModal
          uid={apiKeysTarget}
          closeModal={() => toggleApiKeysModal()}
        />
      )}
      {deleteTarget && (
        <DeleteUserModal
          uid={deleteTarget.uid}
          name={deleteTarget.name}
          closeModal={() => toggleDeleteModal()}
        />
      )}
    </>
  );
}
