// @ts-nocheck
import { useEffect, useRef, useState } from "react";
import clsx from "clsx";

import { useAppSelector } from "@/app/store";
import FileBox from "@/components/FileBox";
import useExpiredResMap from "@/hooks/useExpiredResMap";
import Filter from "./Filter";
import Search from "./Search";
import View from "./View";
import { shallowEqual } from "react-redux";
import { getFileTypeCategory } from "@/utils";

const DAY = 86400 * 1000;

const dateDurations: Record<string, number> = {
  today: DAY,
  in7d: 7 * DAY,
  in30d: 30 * DAY,
  in3m: 90 * DAY,
  in12m: 365 * DAY,
};

const checkFilter = (data, filter, channelMessage) => {
  let selected = true;
  const { mid, from_uid, properties, created_at } = data;
  const { name: nameFilter, from: fromFilter, channel: channelFilter, type: typeFilter, date: dateFilter } = filter;
  const name = properties ? properties.name : "";
  const content_type = properties ? properties.content_type : "";
  if (fromFilter && fromFilter != from_uid) {
    selected = false;
  }
  if (channelFilter && channelMessage[channelFilter].findIndex((id) => id == mid) == -1) {
    selected = false;
  }
  if (typeFilter) {
    const category = getFileTypeCategory(content_type, name);
    if (category !== typeFilter && !(typeFilter === "doc" && category === "code")) {
      selected = false;
    }
  }
  if (dateFilter) {
    const duration = dateDurations[dateFilter];
    if (duration && created_at) {
      const now = Date.now();
      if (now - created_at > duration) {
        selected = false;
      }
    }
  }
  if (nameFilter) {
    let str = ["", ...nameFilter.toLowerCase(), ""].join(".*");
    let reg = new RegExp(str);
    if (!reg.test(name)) {
      selected = false;
    }
  }
  return selected;
};

function ResourceManagement() {
  const { isExpired } = useExpiredResMap();
  const [filter, setFilter] = useState({});
  const view = useAppSelector((store) => store.ui.fileListView, shallowEqual);
  const message = useAppSelector((store) => store.message, shallowEqual);
  const fileMsgs = useAppSelector((store) => store.fileMessage, shallowEqual);
  const channelMessage = useAppSelector((store) => store.channelMessage, shallowEqual);

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
    // No masonry JS needed - CSS columns handle the grid layout
  }, [view, filter]);
  // const fileMessages = fileMsgs.filter((id) => {
  //   const data = message[id];
  //   if (!data) return false;
  //   const { content, thumbnail } = data;
  //   let url = thumbnail || content;
  //   console.log("ff fitler", url, isExpired(url));

  //   return !isExpired(url);
  // });

  return (
    <div className="h-screen md:overflow-y-scroll flex flex-col items-start my-2 mr-6 rounded-2xl bg-white dark:bg-gray-700">
      <Search value={filter.name} updateSearchValue={handleUpdateSearch} />
      <div className="flex justify-between w-full px-4 py-5">
        <Filter filter={filter} updateFilter={updateFilter} />
        <View view={view} />
      </div>
      <div
        className={clsx(
          `w-full h-full px-4 overflow-scroll`,
          view == "item" && "flex gap-2 flex-col",
          view == "grid" && "col-count-2 md:col-count-3 lg:col-count-4"
        )}
      >
        {fileMsgs.map((id) => {
          const data = message[id];
          if (!data) return null;
          const isSelected = checkFilter(data, filter, channelMessage);
          // 过滤掉不存在的用户
          // const fromUser = userData[data.from_uid];
          if (!isSelected) return null;
          const { mid, thumbnail, content, created_at, from_uid, properties } = data;
          const { name, content_type, size } = properties ?? {};
          const url = thumbnail || content;
          if (isExpired(url)) return null;
          return (
            <div key={mid} className="grid-box mb-2">
              <FileBox
                preview={view == "grid"}
                flex={view == "item"}
                key={mid}
                file_type={content_type}
                content={thumbnail || content}
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
  );
}

export default ResourceManagement;
