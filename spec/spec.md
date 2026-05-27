

## 26 频道设置自动删除消息放到概况里面

频道设置里面，把自动删除消息的内容，放到概况页面 可见性的下面，不需要一个单独的自动删除消息的菜单。



## 25 注释掉整个配置部分

注释掉整个配置部分，目前这些设置内容都没有起作用，机器人webhook方式目前未使用，计划将机器人与成员放在一起管理，新增一个成员管理的页面。



## 25 修复从服务器移除成员没有二次确认的问题

找到结果了。只有 MemberList.tsx 中使用了 RemoveConfirmModal 进行二次确认。以下两个地方直接调用
  removeUser，缺少二次确认：

  ┌─────┬─────────────────────────────────────┬──────┬──────────────────────────────────────┐
  │  #  │                文件                 │ 行号 │                 说明                 │
  ├─────┼─────────────────────────────────────┼──────┼──────────────────────────────────────┤
  │ 1   │ src/components/User/ContextMenu.tsx │ 99   │ 右键菜单点击"从服务器删除"           │
  ├─────┼─────────────────────────────────────┼──────┼──────────────────────────────────────┤
  │ 2   │ src/components/Profile/index.tsx    │ 143  │ 用户资料页更多菜单点击"从服务器删除" │
  └─────┴─────────────────────────────────────┴──────┴──────────────────────────────────────┘

  现在修复这两个地方。



## 24 修复tippyjs迁移到Raddix UI的各种bug



## 23 迁移 @tippyjs/react 到 Radix UI

迁移 @tippyjs/react 到 Radix UI

 Context

 @tippyjs/react v4.2.6 内部使用 React.cloneElement 和 children.ref，与 React 19 不兼容，导致控制台报错："Accessing element.ref was removed in React 19"。该库已停止维护，需替换为 React 19 兼容方案。

 安装包

 pnpm add @radix-ui/react-tooltip @radix-ui/react-context-menu

 已有: @radix-ui/react-popover

 迁移分 7 个阶段

 阶段 1: Tooltip 组件 (改 1 个文件，自动修复 8 处用法)

 重写 src/components/Tooltip.tsx，使用 @radix-ui/react-tooltip：

 - 保持外部 API 不变: <Tooltip tip="" placement="top" delay={200}>child</Tooltip>
 - 使用 <Tooltip.Root> / <Tooltip.Trigger asChild> / <Tooltip.Content> / <Tooltip.Arrow>
 - asChild 不使用 cloneElement，直接传递 props 给子元素
 - disabled={isMobile()} 时只渲染 children
 - placement 映射到 Radix side
 - delay 映射到 delayDuration
 - 在 src/index.tsx 添加 <Tooltip.Provider delayDuration={150}> 包裹根组件
 - Triangle 箭头用 <Tooltip.Arrow> 替代，CSS 复用现有样式

 消费者文件无需修改: home/index.tsx, Server.tsx, Menu.tsx, Commands.tsx, Message/index.tsx, Reaction.tsx, Send/Toolbar.tsx

 阶段 2: 新建 Popover 组件

 创建 src/components/Popover.tsx，使用 @radix-ui/react-popover：

 type Props = {
   placement?: string;        // 映射到 side + align
   offset?: number;
   open?: boolean;            // 受控模式
   onOpenChange?: (open: boolean) => void;
   disabled?: boolean;
   content: React.ReactNode;
   children: React.ReactNode;
   className?: string;
 };

 - 受控模式: open + onOpenChange 替代 Tippy 的 visible + onClickOutside
 - 非受控模式: Radix 自动管理打开/关闭
 - asChild 避免 cloneElement
 - Portal 渲染 (等同于 Tippy 的 appendTo + strategy:fixed)

 阶段 3: 替换 hideAll()

 hideAll() 是 tippy.js 全局函数，需逐个替换为局部关闭回调：

 ┌─────────────────────┬─────────────────────────────────────┬────────────────────────────────┐
 │        文件         │              当前用法               │            替换方式            │
 ├─────────────────────┼─────────────────────────────────────┼────────────────────────────────┤
 │ useContextMenu.tsx  │ hideAll() + hideContextMenu()       │ 只保留 hideContextMenu()       │
 ├─────────────────────┼─────────────────────────────────────┼────────────────────────────────┤
 │ useUserOperation.ts │ hideAll() x3                        │ 改为接收 closeMenu 回调参数    │
 ├─────────────────────┼─────────────────────────────────────┼────────────────────────────────┤
 │ AddEntriesMenu.tsx  │ hideAll() x4                        │ 改为接收 close prop            │
 ├─────────────────────┼─────────────────────────────────────┼────────────────────────────────┤
 │ MemberList.tsx      │ hideAll() x1                        │ 改为接收 close prop            │
 ├─────────────────────┼─────────────────────────────────────┼────────────────────────────────┤
 │ Commands.tsx        │ hideAll() x4 + hidePicker={hideAll} │ 改为 hidePicker={closePopover} │
 ├─────────────────────┼─────────────────────────────────────┼────────────────────────────────┤
 │ Reaction.tsx        │ hidePicker={hideAll}                │ 改为 hidePicker={closePopover} │
 ├─────────────────────┼─────────────────────────────────────┼────────────────────────────────┤
 │ APIConfig.tsx       │ hideAll() x2                        │ 改为 setOpen(false)            │
 └─────────────────────┴─────────────────────────────────────┴────────────────────────────────┘

 阶段 4: 转换交互式 Tippy (click 触发) → Popover

 按复杂度从低到高：

 1. Language.tsx - 语言选择下拉，trigger="click" + interactive
 2. Mention.tsx - @用户资料卡，trigger="click"
 3. Search.tsx (users) - 嵌套 Tooltip + Popover
 4. Server.tsx - 嵌套 Tooltip + Popover
 5. DMChat/index.tsx - 收藏面板
 6. ChannelChat/index.tsx - 置顶/收藏面板 x2
 7. User/index.tsx - 用户资料 popover
 8. Profile/index.tsx - 更多选项菜单
 9. MemberList.tsx - 角色切换 + 更多菜单 x2
 10. Commands.tsx - 表情选择器 + 更多菜单 x2 (最复杂)
 11. Reaction.tsx - 添加表情 (click) + 表情详情 (hover-interactive)

 阶段 5: 转换受控 Tippy → 受控 Popover

 1. styled/Select.tsx - 自定义下拉选择，visible + onClickOutside
 2. files/Filter/index.tsx - 筛选下拉 x3
 3. resources/Filter/index.tsx - 筛选下拉 x4

 阶段 6: 转换右键菜单 → Radix ContextMenu

 1. useContextMenu.tsx - 简化 hook，移除 offset 计算，移除 ContextMenu 渲染组件
 2. ContextMenu.tsx - 用 Radix <ContextMenu.Sub> 替代 WrapWithSubmenu
 3. Message/ContextMenu.tsx - 使用 <ContextMenu.Root> + <ContextMenu.Trigger asChild>
 4. User/ContextMenu.tsx - 同上
 5. SessionList/ContextMenu.tsx - 同上

 阶段 7: 清理

 1. 删除 src/libs/TippySetting.ts
 2. 从 src/index.tsx 移除 import "./libs/TippySetting"
 3. 从 package.json 移除 @tippyjs/react 和 tippy.js
 4. 运行 pnpm install
 5. 全局搜索确认无残留 @tippyjs 或 tippy.js 引用

 关键文件清单

 ┌───────────────────────────────────┬─────────────────────────────────────────┐
 │               文件                │                  操作                   │
 ├───────────────────────────────────┼─────────────────────────────────────────┤
 │ src/components/Tooltip.tsx        │ 重写 (Radix Tooltip)                    │
 ├───────────────────────────────────┼─────────────────────────────────────────┤
 │ src/components/Popover.tsx        │ 新建 (Radix Popover)                    │
 ├───────────────────────────────────┼─────────────────────────────────────────┤
 │ src/components/ContextMenu.tsx    │ 重写 (Radix ContextMenu.Sub)            │
 ├───────────────────────────────────┼─────────────────────────────────────────┤
 │ src/hooks/useContextMenu.tsx      │ 重写 (简化)                             │
 ├───────────────────────────────────┼─────────────────────────────────────────┤
 │ src/hooks/useUserOperation.ts     │ 修改 (移除 hideAll)                     │
 ├───────────────────────────────────┼─────────────────────────────────────────┤
 │ src/components/AddEntriesMenu.tsx │ 修改 (hideAll → close prop)             │
 ├───────────────────────────────────┼─────────────────────────────────────────┤
 │ src/index.tsx                     │ 修改 (添加 Provider，移除 TippySetting) │
 ├───────────────────────────────────┼─────────────────────────────────────────┤
 │ 22 个消费者文件                   │ 修改 (Tippy → Popover/ContextMenu)      │
 ├───────────────────────────────────┼─────────────────────────────────────────┤
 │ src/libs/TippySetting.ts          │ 删除                                    │
 └───────────────────────────────────┴─────────────────────────────────────────┘

 验证

  1. 启动开发服务器，确认控制台无 React 19 ref 警告
  2. 测试悬停提示 (导航栏图标、消息操作按钮)
  3. 测试点击弹出 (语言选择、用户资料卡、添加成员菜单)
  4. 测试右键菜单 (消息右键、用户右键、会话右键)
  5. 测试子菜单 (Profile 更多选项、ContextMenu 子菜单)
  6. 测试受控弹出 (筛选下拉、自定义选择)
  7. 测试移动端 (Tooltip 应被禁用)



已完成的迁移：

  1. 安装 @radix-ui/react-tooltip + @radix-ui/react-context-menu
  2. 重写 Tooltip.tsx — 使用 Radix Tooltip + asChild 避免 cloneElement
  3. 新建 Popover.tsx — 基于 Radix Popover 的通用弹出组件
  4. 重写 ContextMenu.tsx — 使用 Radix ContextMenu.Sub 替代 Tippy 子菜单
  5. 简化 useContextMenu.tsx — 移除 Tippy 的 offset/hideAll/渲染组件
  6. 转换 22 个消费者文件：

    - 简单 Tooltip 消费者自动生效（无需改动）
    - 交互式 Tippy → Popover（Language, Mention, Server, Search, DMChat, ChannelChat, User, Profile, MemberList, Commands, Reaction, APIConfig, Message/index）
    - 受控 Tippy → 受控 Popover（Select, files/Filter, resources/Filter）
    - 右键 Tippy → Radix ContextMenu（Message/ContextMenu, User/ContextMenu, SessionList/ContextMenu, Session）
  7. 替换 hideAll() — 改为局部 close 回调（AddEntriesMenu, useUserOperation, Commands, Reaction, MemberList, APIConfig）
  8. 清理 — 删除 TippySetting.ts，移除 @tippyjs/react + tippy.js 依赖

  请重启开发服务器验证控制台不再出现 "Accessing element.ref was removed" 警告。



## 22. 优化时间格式，中文环境更符合大陆习惯

已进行的修改：

  1. public/locales/zh/chat.json - 更新中文日期格式：

    - datetime_format: YYYY年M月D日 HH:mm (历史消息，无秒)
    - datetime_format_current_year: M月D日 HH:mm (本年消息，无年份)
    - divider_date_format: M月D日 (本年日期分割线)
    - divider_date_format_with_year: YYYY年M月D日 (非本年日期分割线)
  2. public/locales/en/chat.json - 对应英文格式更新
  3. src/routes/chat/utils.tsx - 日期分割线根据是否本年选择不同格式：

    - 本年：显示 "4月20日"
    - 非本年：显示 "2025年3月30日"
  4. src/components/Message/index.tsx - 消息时间戳：

    - 本年消息：显示 "4月20日 17:23" (无年份、无秒)
    - 非本年消息：显示 "2025年4月20日 17:23" (有年份、无秒)
    - tooltip 始终显示完整日期（含年份），方便悬停查看

## 21. 优化聊天界面的显示风格

现在 text/plain 和 text/markdown 都会包裹成气泡：

自己的消息：绿色 #91ed6c，右侧尖角。
别人的消息：灰色 #EEEEF0，左侧尖角。
文件、图片、附件、语音、转发等类型仍不加气泡样式。


## 20. 修复聊天消息没有自动到底部的问题

Here's a summary of the change:

  Root Cause: When allMids.length > visibleCount (e.g. 200 messages but only 50 visible), adding a new message causes stableMids to shift (first item dropped, new item appended) — the array length stays the
  same. Virtuoso's followOutput callback only fires when items are appended (length increases). Since followOutput never fires, handleFollowOutput never runs, and the isSentByMyself check never triggers the
  auto-scroll.

  Fix at VirtualMessageFeed/index.tsx:265-283: Added a useEffect that watches the last message ID in stableMids. When it detects a new last message (mid changed) that was sent by the current user, it explicitly
   calls vList.current.scrollToIndex() to scroll to the bottom. The prevLastMidRef.current !== null guard prevents scrolling on initial mount (which is already handled by initialTopMostItemIndex).

  This coexists with the existing handleFollowOutput — that function still handles the case where visibleCount >= allMids.length (where followOutput fires normally). The useEffect covers the case it misses.



## 19. 聊天消息列表国际化时间显示

以下是所有修改的总结：

  问题：中文环境下的时间显示混合了英文，例如：“Today 9:40 晚上”，而不是“今天 21:40”。

  修改：

  1. src/components/Message/index.tsx - 主要修复：

    - 添加了 useTranslation hook
    - 将硬编码的“Today”/“Yesterday”替换为 t("today")/t("yesterday")
    - 将硬编码的 h:mm A / YYYY-MM-DD h:mm:ss A 格式替换为来自 i18n 的 timeFormat/datetimeFormat
  2. public/locales/zh/chat.json - 添加了中文翻译：

    - today: "今天"
    - yesterday: "昨天"
    - time_format: "HH:mm" (24小时制，无 AM/PM)
    - datetime_format: "YYYY-MM-DD HH:mm:ss"
    - day: "天"
  3. public/locales/en/chat.json - 添加了英文格式键：

    - today: "Today"
    - yesterday: "Yesterday"
    - time_format: "h:mm A"
    - datetime_format: "YYYY-MM-DD h:mm:ss A"
    - day: "day"
  4. src/components/Message/renderContent.tsx - 使用 i18n.t("datetime_format") 来显示编辑时间戳的工具提示。
  5. src/components/PinnedMessage.tsx - 使用 i18n.t("datetime_format") 来显示固定消息时间。
  6. src/components/AnnouncementModal.tsx - 使用 t("datetime_format") 来显示创建/更新时间。
  7. src/components/Message/ExpireTimer.tsx - 使用 t("day") 代替硬编码的“day”。

  中文用户现在将看到“今天 21:40”、“昨天 18:32”，而不是“Today 9:40 晚上”、“Yesterday 6:32 下午”。



## 18. onboard国际化语言异步加载问题

有的时候刷新页面，上面的步骤条国际化内容并未加载成功，而有的时候又是可以的，请检查一下是否存在异步加载的问题。

问题找到了。steps.ts 中使用 t() 是在模块加载时同步调用的，但 i18n 的初始化是异步的（需要通过 HTTP Backend 加载翻译文件）。当页面刷新时，如果 steps.ts 在 i18n 初始化完成前被 import，t() 就会返回原始 key
  而不是翻译文本，且 steps 数组创建后不会再更新。

  修复方案：将 steps.ts 中的 label 改为翻译 key，在组件内通过 useTranslation 动态翻译。

## 17. 修复onboarding过程的问题

onboarding过程开始前，需要先清楚本地缓存，不然当进行管理员账号设置的时候，会直接用之前已经设置过的账号，导致管理员账
  号无法配置。

 现在我完全理解这个 bug 了。问题是：

  1. 当之前设置过服务器时，auth 数据会存储在 localStorage 中
  2. Redux authDataSlice 在模块加载时从 localStorage 初始化其状态（在任何组件渲染之前）
  3. onboarding 页面运行 clearLocalCache()，它会清除 localStorage，但 Redux store 仍然保留了旧的 auth 数据
  4. 在 AdminAccount 中，loggedIn = !!store.authData.token 仍然是 true，因为 Redux 中有旧 token
  5. 检查 loggedIn 的 useEffect 会立即触发 → 跳到下一步，跳过了管理员账号设置

  修复方法是：在清除 localStorage 的同时，也通过 dispatch resetAuthData() 来重置 Redux auth 状态。

## 16. 缺失的国际化内容

所有剩余的硬编码 toast 消息都已注释掉。我们的更改已完成。

  让我总结一下做了什么：

  国际化完成总结

  翻译文件更新

  - public/locales/en/common.json 和 public/locales/zh/common.json：添加了 error 命名空间（含 40+ 错误提示键）和
  action、tip 命名空间中新增的键（如 forward_one_by_one、send_to_count、copied、cleared 等）
  - public/locales/en/chat.json 和 public/locales/zh/chat.json：添加了 search_placeholder、search_not_found、date_format
  - public/locales/en/setting.json 和 public/locales/zh/setting.json：添加了
  notification.channel_name_required、notification.missing_required_fields、passkey.error_user_not_available
  - public/locales/en/auth.json 和 public/locales/zh/auth.json：添加了 login.passkey_error_user_not_available

  源文件修改（47个文件）

  硬编码中文 UI 文本：
  - ForwardModal/index.tsx："逐条转发" → t("action.forward_one_by_one")
  - MessageSearch/index.tsx："搜索消息..." → t("search_placeholder")，"未找到匹配的消息" → t("search_not_found")
  - Version.tsx：日期格式 YYYY年M月D日 → 根据语言动态切换

  硬编码英文 toast/placeholder/按钮 文本：
  - ForwardModal/index.tsx：5 处硬编码 → i18n t() 调用
  - useCopy.ts："Copied!" → i18n.t("tip.copied")
  - AutoDeleteMessages.tsx："Cleared!" → ct("tip.cleared")
  - ChannelModal/index.tsx：2 处
  - base.query.ts：8 处 HTTP 错误消息
  - handlers.ts：2 处发送消息错误
  - useSendMessage.ts、"Only text..." → i18n.t()
  - useUploadFile.ts：1 处
  - routes/index.tsx："Network Offline!" → i18n.t()
  - routes/login/index.tsx：4 处登录错误消息
  - routes/sendMagicLink/index.tsx：4 处
  - routes/reg/Register.tsx：2 处
  - routes/reg/RegWithUsername.tsx：2 处
  - Operations.tsx：3 处
  - Commands.tsx：3 处收藏消息
  - useMessageOperation.tsx：1 处取消置顶
  - LeaveChannel：2 处离开频道
  - InviteModal：2 处邀请/添加成员
  - ClearConfirmModal、BotConfig 系列：10+ 处
  - UpdatePasswordModal、RemoveAccountConfirmModal、NicknameModal 等
  - Announcement/index.tsx：3 处
  - ServerMsgEmailNotify.tsx、PasskeyManagement.tsx 等

## 15. 修复上传取消后再上传的bug

  1. queue、processing、cancelledUrls 改为模块级共享状态 — 用 sharedQueueMap 按 ${context}_${id} 键共享，无论哪个 useUploadFile 实例操作的都是同一份数据，删除文件时 removeStageFile
     能正确标记取消，上传循环也能正确检测到。
   2. 新增 stageFilesRef — 在每次渲染时同步最新的 Redux stageFiles 到 ref，异步上传代码中通过 isFileCancelled() 同时检查 shared.cancelledUrls 和 stageFilesRef（文件是否还存在于 Redux），双重保障跨实例取消生效。



## 14. 优化附件上传逻辑

@src/components/Send/index.tsx 再优化一下，当完成附件选择之后，就开始上传附件，而不要等到点击发送按钮之后再上传。当
  附件没有完成上传的情况下，不允许发送，除非点击附加上的删除，停止上传附件。



一切看起来都很好。以下是所有修改的总结：

  src/hooks/useUploadFile.ts - 核心改动：
  - UploadFileData 新增 uploading、uploaded、uploadResult 字段，用于跟踪每个文件的上传状态
  - uploadFile 新增 isCancelled 参数，支持按文件取消上传
  - addStageFile 添加文件后自动触发上传（非 HEIC 文件立即入队，HEIC 文件转换完成后入队）
  - processAutoUploadQueue 顺序处理上传队列，每个文件上传前后更新 Redux 状态
  - removeStageFile 删除文件时同时取消该文件的上传（加入 cancelledUrlsRef 并从队列中移除）
  - resetStageFiles 清空队列和取消集合
  - 新增 isAnyFileUploading 返回值

  src/app/slices/ui.ts - Redux：
  - 新增 "update_upload" 操作，通过 blob URL 定位文件并更新上传状态字段

  src/components/Send/index.tsx - 发送组件：
  - handleSendMessage 不再上传文件，直接使用已上传的 uploadResult 发送文件消息
  - 上传中时 isAnyFileUploading 为 true，阻止发送
  - 传递 sendDisabled 给 Toolbar

  src/components/Send/Toolbar.tsx - 工具栏：
  - 新增 sendDisabled 属性，上传中时发送按钮灰显且不可点击，tooltip 显示"上传中"

  src/components/Send/UploadFileList/index.tsx - 文件列表：
  - 上传中的文件显示半透明遮罩 + 加载动画
  - 上传完成的文件右上角显示绿色对勾
  - 删除文件会同时取消上传

  public/locales/{en,zh}/chat.json - 国际化：
  - 新增 "uploading" 翻译键

​    

## 13. 优化与机器人聊天时附件的处理逻辑

@src/routes/chat/DMChat\ @src/routes/chat/ChannelChat\ 在私聊以及频道聊天的页面，当有附件的时候（图片、媒体文件等）、现在的处理逻辑会导致问题先到达机器人，而附件需要上传时间，消息会后到达机器人。这样就会导致机器人由于无法获取到附件信息而无法正确回复问题。因此，需要将逻辑调整为当上传动作完成后，再发送文本消息，并且需要保证图片消息先于文本消息。

 Problem: When sending a message with attachments, the text was sent immediately via sendMessage, while files were only added to the local state for deferred upload. The bot received the text before the
  attachments, making it unable to respond correctly.

  Fix: Reversed the order in handleSendMessage:

  1. Files uploaded first — For each staged file, fetch the blob, create a File object, upload it via uploadFile, then send the file message to the server with sendMessage({ type: "file", content: { path } }).
  Each step is awaited, so file messages arrive on the server before text.
  2. Text sent last — Only after all files are uploaded and their messages sent does the text message get sent.
  3. Cleaned up — Removed the now-unused useAddLocalFileMessage hook call and ContentTypes import.



## 12. 替换已经停止维护的react-dnd

 已完成所有替换：

  1. index.tsx — 移除了 DndProvider 和 HTML5Backend 包裹
  2. Session.tsx — 用原生 onDragOver/onDragEnter/onDragLeave/onDrop 替换 useDrop
  3. Layout/index.tsx — 同样用原生拖放事件替换 useDrop
  4. 卸载了 react-dnd 和 react-dnd-html5-backend

  功能完全一致：文件拖入时高亮，放下时上传。不再有 React 19 的 element.ref 警告。

## 11. 修复聊天页面没有滚动到最新消息的问题

修改总结

  1. 改进 handleFollowOutput 函数（核心修复）

  之前：使用时间戳差值判断是否自己发送的消息
  const ts = new Date().getTime();
  const isSentByMyself = ts - lastMid < 1000;  // 不可靠

  之后：使用消息的 from_uid 字段判断
  const lastMessage = messageDataRef.current[lastMid];
  const isSentByMyself = lastMessage?.from_uid === loginUidRef.current;

  优势：
  - 判断逻辑更可靠，不受网络延迟、服务器时间同步影响
  - 自己发送的消息会强制滚动到底部，无论当前滚动位置

  2. 优化切换聊天时的初始化

  useEffect(() => {
    setVisibleCount(50);
    setAtBottom(true);  // 默认 true，用户期望看到最新消息
    // 强制滚动到底部
    if (vList.current && stableMids.length > 0) {
      setTimeout(() => {
        vList.current?.scrollToIndex(stableMids.length - 1);
      }, 50);
    }
  }, [id]);

  优势：
  - 切换聊天时默认认为在底部，避免初始状态不正确
  - 额外的强制滚动确保消息加载后能正确定位

  这些修改应该能解决滚动条偶尔不滚动到底部的问题，特别是自己发送消息时。



## 10. 先禁用掉更新提醒

已禁用以下弹窗：

  ┌─────────────────────┬───────────────────────────┬─────────────────────────┐
  │        弹窗         │         修改文件          │          状态           │
  ├─────────────────────┼───────────────────────────┼─────────────────────────┤
  │ 新版本更新提示      │ src/index.tsx             │ 已注释 register() 调用  │
  ├─────────────────────┼───────────────────────────┼─────────────────────────┤
  │ 移动端 App 下载提示 │ src/index.tsx             │ 已注释 <MobileAppTip /> │
  ├─────────────────────┼───────────────────────────┼─────────────────────────┤
  │ PWA 安装提示        │ src/routes/home/index.tsx │ 已注释 <Manifest />     │
  └─────────────────────┴───────────────────────────┴─────────────────────────┘



## 9. 更换图标

@public\cocochat_icon.png, 帮我用这个文件，去替换android-chrome-192x192.png、android-chrome-512x512.png、apple-touch
  -icon.png、favicon-16x16.png、favicon-32x32.png，并缩放到目标文件的尺寸。


## 8. 性能优化

 优化完成总结

  已移除的依赖（不再安装）

  ┌──────────────────────────────┬──────────────────────────────────────────────────────────────┬──────────┐
  │             包名             │                            原体积                            │ 替代方案 │
  ├──────────────────────────────┼──────────────────────────────────────────────────────────────┼──────────┤
  │ lodash (~70KB)               │ 自写 omitByNull/omitByNil/shallowEqualObjects/escapeRegExp   │          │
  ├──────────────────────────────┼──────────────────────────────────────────────────────────────┼──────────┤
  │ rooks (~50KB)                │ 自写 useKey/useOutsideClick/useLocalstorageState/useDebounce │          │
  ├──────────────────────────────┼──────────────────────────────────────────────────────────────┼──────────┤
  │ @uiball/loaders (~15KB)      │ 自写 CSS Spinner 组件                                        │          │
  ├──────────────────────────────┼──────────────────────────────────────────────────────────────┼──────────┤
  │ masonry-layout (~10KB)       │ CSS columns（已有 col-count-2/3/4）                          │          │
  ├──────────────────────────────┼──────────────────────────────────────────────────────────────┼──────────┤
  │ copy-image-clipboard (~10KB) │ 原生 navigator.clipboard.write API                           │          │
  └──────────────────────────────┴──────────────────────────────────────────────────────────────┴──────────┘

  动态 import（按需加载）

  ┌──────────────────────────────┬────────────────────┐
  │              库              │      触发条件      │
  ├──────────────────────────────┼────────────────────┤
  │ heic2any (~150KB)            │ 上传 HEIC 图片时   │
  ├──────────────────────────────┼────────────────────┤
  │ wavesurfer.js (~80KB)        │ 出现语音消息时     │
  ├──────────────────────────────┼────────────────────┤
  │ katex + katexPlugin (~200KB) │ 内容包含数学公式时 │
  └──────────────────────────────┴────────────────────┘

  Webpack 配置优化

  - 添加 splitChunks：node_modules 分离为 vendors chunk（178KB），主入口仅 24KB
  - drop_console: true：移除所有 console 输出
  - prismjs 从 all 版本改为按需加载 16 种常用语言

  yet-another-react-lightbox

  - 移除 Fullscreen 和 Download 插件，保留核心的 Zoom + Captions

  总体效果

  - 直接移除 ~155KB（lodash+rooks+uiball+masonry+copy-image-clipboard）
  - 按需加载 ~430KB（heic2any+wavesurfer+katex 只在特定场景加载）
  - prismjs 按需语言 减少约 ~200KB 全量语言包
  - 首屏主入口从包含所有依赖变为 24KB 业务代码 + vendors 可独立缓存

  运行 pnpm install 后依赖已更新，node scripts/build-dev.js 构建通过。

## 7. 增加机器人是否在线的展示

在线显示绿色图标，离线显示灰色图标。



## 6. 先只保留中文和英文，其他语言先删掉

先只保留中文、英文，其他语言先删掉。



## 5. 构建时间显示好阅读的方式

版本信息页面，构建时间改成标准时间格式，例如：2026年4月28日 21:35:32，而不要使用timestamp。



## 4. 修复onboard语言加载的问题

onboard页面，经常会出现国际化没有加载成功的情况，并且语言切换按钮也无法使用。



## 3. 优化机器人创建的逻辑

1、机器人创建增加password（用于matrix协议连接）

2、apikey创建不需要password，当matrix客户端通过用户名、密码登录时，自动创建一个apikey并返回给客户端。





## 2. 调整创建api_key页面

调整“创建机器人 API Key”页面：

1、变宽一点，name输入框、password输入框不要换行。

2、name输入框、password输入框不要自动填充，这是每次都要重写输入的内容。

## 1. bot_key增加password

在 配置 -> 机器人&Webhook 页面，新增api_key的时候，在“创建机器人 API Key”弹框中，增加password字段，该字段非必填，如果填了，调用后端接口的时候，加上password字段。