import { useState, useMemo } from "react";
import { useAppSelector } from "@/app/store";
import { shallowEqual } from "react-redux";
import { useTranslation } from "react-i18next";
import { ChatContext } from "@/types/common";
import dayjs from "dayjs";
import Avatar from "@/components/Avatar";
import IconSearch from "@/assets/icons/search.svg";
import IconClose from "@/assets/icons/close.circle.svg";

interface Props {
  context: ChatContext;
  id: number;
  onLocate: (mid: number) => void;
}

export default function MessageSearch({ context, id, onLocate }: Props) {
  const { t } = useTranslation("chat");
  const [query, setQuery] = useState("");
  const [visible, setVisible] = useState(false);
  
  const mids = useAppSelector(
    (store) => (context === "channel" ? store.channelMessage[id] : store.userMessage.byId[id]) || [],
    shallowEqual
  );
  const messageData = useAppSelector((store) => store.message, shallowEqual);
  const usersData = useAppSelector((store) => store.users.byId, shallowEqual);

  const searchResults = useMemo(() => {
    if (!query.trim()) return [];
    
    const lowerQuery = query.toLowerCase();
    return mids
      .map((mid) => messageData[mid])
      .filter((msg) => {
        if (!msg || !msg.content) return false;
        if (msg.content_type === "text/plain" || msg.content_type === "text/markdown") {
          const content = typeof msg.content === "string" ? msg.content : "";
          return content.toLowerCase().includes(lowerQuery);
        }
        return false;
      })
      .sort((a, b) => (b.created_at || 0) - (a.created_at || 0))
      .slice(0, 50);
  }, [query, mids, messageData]);

  const handleLocate = (mid: number) => {
    onLocate(mid);
    setVisible(false);
    setQuery("");
  };

  return (
    <div className="relative">
      <button
        onClick={() => setVisible(!visible)}
        className="p-1.5 hover:bg-muted dark:hover:bg-secondary rounded"
      >
        <IconSearch className="w-5 h-5 fill-muted-foreground" />
      </button>

      {visible && (
        <div className="absolute top-full right-0 mt-2 w-80 bg-white dark:bg-card rounded-lg shadow-lg border border-border dark:border-gray-700 z-50">
          <div className="p-3 border-b border-border dark:border-gray-700">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t("search_placeholder")}
                className="flex-1 px-3 py-2 bg-muted/50 dark:bg-card rounded outline-none text-sm"
                autoFocus
              />
              <button onClick={() => setVisible(false)} className="p-1">
                <IconClose className="w-5 h-5 fill-muted-foreground" />
              </button>
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {query && searchResults.length === 0 && (
              <div className="p-4 text-center text-muted-foreground text-sm">{t("search_not_found")}</div>
            )}
            {searchResults.map((msg) => {
              const user = usersData[msg.from_uid || 0];
              return (
                <div
                  key={msg.mid}
                  onClick={() => handleLocate(msg.mid)}
                  className="p-3 flex items-start gap-2 hover:bg-muted/50 dark:hover:bg-card cursor-pointer border-b border-gray-100 dark:border-gray-700"
                >
                  <Avatar width={32} height={32} src={user?.avatar} name={user?.name} className="rounded-full shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="text-sm font-medium text-foreground dark:text-muted-foreground truncate">
                        {user?.name}
                      </span>
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {dayjs(msg.created_at).isSame(dayjs(), 'day') 
                          ? dayjs(msg.created_at).format("HH:mm")
                          : dayjs(msg.created_at).format("MM-DD HH:mm")}
                      </span>
                    </div>
                    <div className="text-sm text-foreground dark:text-muted-foreground line-clamp-2">
                      {typeof msg.content === "string" ? msg.content : ""}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

