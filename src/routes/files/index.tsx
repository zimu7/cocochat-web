// @ts-nocheck
import { useEffect, useRef, useState } from "react";
import clsx from "clsx";
import BASE_URL from "@/app/config";

import { useAppSelector } from "@/app/store";
import FileBox from "@/components/FileBox";
import Filter from "./Filter";
// import Search from "./Search";
import View from "./View";
import { useLazyGetFilesQuery } from "@/app/services/server";
import { shallowEqual } from "react-redux";
import { getFileTypeCategory } from "@/utils";

const DAY = 86400 * 1000;

const dateDurations: Record<string, number> = {
  Day1: DAY,
  Day7: 7 * DAY,
  Day30: 30 * DAY,
  Day90: 90 * DAY,
  Day180: 180 * DAY,
};

function Files() {
  const [getFiles, { data, isLoading }] = useLazyGetFilesQuery();
  const listContainerRef = useRef<HTMLDivElement>();
  const [filter, setFilter] = useState({});
  const view = useAppSelector((store) => store.ui.fileListView, shallowEqual);

  const updateFilter = (data) => {
    setFilter((prev) => {
      return { ...prev, ...data };
    });
  };

  const handleUpdateSearch = (val) => {
    setFilter((prev) => {
      return { ...prev, name: val };
    });
  };
  useEffect(() => {
    // 过滤掉空值
    const _f = Object.fromEntries(
      Object.entries(filter).filter(([k, v]) => {
        return !!v;
      })
    );
    getFiles({ ..._f, page_size: 1000 });
  }, [filter]);
  if (!data) return null;

  const { file_type: typeFilter, creation_time_type: dateFilter } = filter;
  const nonExpiredFiles = data
    .filter((item) => !item.expired)
    .filter((item) => {
      if (!typeFilter) return true;
      const props = item.properties ? JSON.parse(item.properties) : {};
      const category = getFileTypeCategory(props.content_type, props.name);
      if (category === typeFilter.toLowerCase()) return true;
      if (typeFilter === "Doc" && category === "code") return true;
      return false;
    })
    .filter((item) => {
      if (!dateFilter) return true;
      const duration = dateDurations[dateFilter];
      if (!duration || !item.created_at) return true;
      const now = Date.now();
      return now - item.created_at <= duration;
    })
    .sort((a, b) => b.created_at - a.created_at);
  return (
    <div className="h-screen max-w-full overflow-hidden flex flex-col my-5 mr-6 pb-8 rounded-2xl bg-white dark:bg-card">
      {/* <Search value={filter.name} updateSearchValue={handleUpdateSearch} /> */}
      <div className="flex justify-between w-full px-4 py-5 shrink-0">
        <Filter filter={filter} updateFilter={updateFilter} />
        <View view={view} />
      </div>
      <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden">
        <div
          className={clsx(
            `min-h-0 min-w-0 px-4 gap-4`,
            view == "item" && "flex flex-col",
            view == "grid" && "grid grid-cols-4"
          )}
          ref={listContainerRef}
        >
        {nonExpiredFiles.map((file) => {
          const { mid, thumbnail, content, created_at, from_uid, properties } = file;
          const { name, content_type, size } = properties ? JSON.parse(properties) : {};
          const url = `${BASE_URL}/resource/file?file_path=${encodeURIComponent(
            thumbnail || content
          )}`;
          return (
            <div key={mid} className="min-w-0">
              <FileBox
                preview={view == "grid"}
                flex={view == "item"}
                file_type={content_type}
                content={url}
                created_at={created_at}
                from_uid={from_uid}
                size={size}
                name={name}
              />
            </div>
          );
        })}
        </div>
      </div>
    </div>
  );
}

export default Files;
