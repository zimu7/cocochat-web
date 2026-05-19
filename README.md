# Web Client of CocoChat



Install pnpm and build for release.

```bash
pnpm install
pnpm run build:release
```

## 源代码结构

### 顶层入口与配置

| 文件 | 说明 |
|---|---|
| `index.tsx` | 主应用入口，初始化 React 应用 |
| `index-widget.tsx` | 嵌入式聊天小组件入口 |
| `i18n.ts` | 国际化（i18next）配置，管理多语言 |
| `utils.tsx` | 通用工具函数 |
| `passkey.ts` | Passkey（WebAuthn）认证相关逻辑 |
| `service-worker.ts` | Service Worker 实现，处理离线缓存 |
| `serviceWorkerRegistration.ts` | Service Worker 注册入口 |
| `react-app-env.d.ts` | CRA 环境类型声明 |

### `app/` — 应用核心层

| 子目录/文件 | 说明 |
|---|---|
| `store.ts` | Redux Store 创建与中间件配置 |
| `config.ts` | 应用全局配置 |
| `cache/` | 状态持久化与 rehydrate 逻辑 |
| `services/` | RTK Query API 服务封装 |
| `services/auth.ts` | 认证相关 API（登录、注册、Token 刷新等） |
| `services/channel.ts` | 频道 CRUD、成员管理 API |
| `services/message.ts` | 消息发送、查询、撤回等 API |
| `services/user.ts` | 用户信息、搜索、状态 API |
| `services/server.ts` | 服务器配置查询 API |
| `services/notification.ts` | 推送通知相关 API |
| `services/base.query.ts` | RTK Query 公共 baseQuery 配置（含拦截器） |
| `services/handlers.ts` | API 响应统一处理逻辑 |
| `slices/` | Redux 状态切片 |
| `slices/auth.data.ts` | 认证状态（登录态、用户信息） |
| `slices/channels.ts` | 频道列表与状态 |
| `slices/message.ts` | 消息主状态 |
| `slices/message.channel.ts` | 频道消息状态 |
| `slices/message.user.ts` | 私聊消息状态 |
| `slices/message.archive.ts` | 归档消息状态 |
| `slices/message.file.ts` | 文件消息状态 |
| `slices/message.reaction.ts` | 消息 Reaction 状态 |
| `slices/files.ts` | 文件列表与上传状态 |
| `slices/users.ts` | 用户列表与在线状态 |
| `slices/server.ts` | 当前服务器配置状态 |
| `slices/ui.ts` | UI 交互状态（侧边栏、弹窗等） |
| `slices/favorites.ts` | 收藏消息状态 |
| `slices/footprint.ts` | 消息阅读足迹 |
| `slices/voice.ts` | 语音消息状态 |
| `listener.middleware/` | 监听中间件，响应状态变化执行副作用 |
| `listener.middleware/handler.message.ts` | 新消息到达处理 |
| `listener.middleware/handler.channel.msg.ts` | 频道消息处理 |
| `listener.middleware/handler.dm.msg.ts` | 私聊消息处理 |
| `listener.middleware/handler.channels.ts` | 频道变更处理 |
| `listener.middleware/handler.users.ts` | 用户状态变更处理 |
| `listener.middleware/handler.archive.msg.ts` | 消息归档处理 |
| `listener.middleware/handler.reaction.ts` | Reaction 更新处理 |
| `listener.middleware/handler.file.msg.ts` | 文件消息处理 |
| `listener.middleware/handler.footprint.ts` | 阅读足迹更新 |
| `listener.middleware/handler.server.ts` | 服务器配置变更处理 |
| `listener.middleware/handler.ui.ts` | UI 状态联动处理 |
| `listener.middleware/handler.rtkq.ts` | RTK Query 缓存更新联动 |
| `listener.middleware/clear.handler.ts` | 退出登录时状态清理 |
| `selectors/message.ts` | 消息相关 Selector（记忆化查询） |

### `routes/` — 页面路由

| 子目录 | 说明 |
|---|---|
| `index.tsx` | 路由定义入口 |
| `lazy.tsx` | 路由懒加载封装 |
| `guest.tsx` | 游客模式路由守卫 |
| `login/` | 登录页（密码登录、Magic Link、第三方登录） |
| `reg/` | 注册页（用户名注册、邮箱注册、邀请注册） |
| `oauth/` | OAuth 第三方登录回调 |
| `callback/` | 支付成功等回调页 |
| `sendMagicLink/` | Magic Link 发送与确认页 |
| `onboarding/` | 新用户引导流程（分步骤引导） |
| `home/` | 主页（导航菜单、移动端导航、用户信息栏） |
| `chat/` | 聊天主页面 |
| `chat/Layout/` | 聊天布局（消息流、操作按钮、各类提示条） |
| `chat/Layout/VirtualMessageFeed/` | 虚拟滚动消息列表（自定义 Header/List，优化大数据渲染） |
| `chat/SessionList/` | 会话列表（会话项、右键菜单） |
| `chat/GuestSessionList/` | 游客会话列表 |
| `chat/ChannelChat/` | 频道聊天视图（成员列表、置顶消息） |
| `chat/GuestChannelChat/` | 游客频道聊天视图 |
| `chat/DMChat/` | 私聊视图（Header、Footer、消息区、输入框、欢迎页） |
| `chat/FavList.tsx` | 收藏消息列表 |
| `chat/LoadMore.tsx` | 加载更多消息 |
| `setting/` | 设置页面 |
| `setting/MyAccount.tsx` | 我的账户 |
| `setting/PasskeyManagement.tsx` | Passkey 管理 |
| `setting/NotificationSettings.tsx` | 通知设置 |
| `setting/APIConfig.tsx` | API 配置 |
| `setting/APIDocument.tsx` | API 文档 |
| `setting/Overview/` | 系统概览（服务端信息、在线状态、暗黑模式、语言等全局配置） |
| `setting/AdminNotificationChannels/` | 管理员通知频道配置 |
| `setting/BotConfig/` | Bot 管理（创建、编辑、删除、API Key、Webhook 配置） |
| `setting/DataManagement/` | 数据管理（自动删除文件、清空数据） |
| `setting/config/` | 服务器高级配置（聊天布局、访客模式、注册限制、URL 预览等） |
| `settingChannel/` | 单个频道设置（频道信息编辑、删除确认） |
| `settingDM/` | 私聊设置（概览、删除确认） |
| `favs/` | 收藏夹独立页面 |
| `files/` | 文件管理（搜索、筛选、文件查看） |
| `resources/` | 资源管理（搜索、筛选、资源查看） |
| `users/` | 用户列表（搜索、筛选） |
| `invitePrivate/` | 私聊邀请页面 |
| `404/` | 404 页面 |

### `components/` — 可复用 UI 组件

| 子目录/文件 | 说明 |
|---|---|
| `Message/` | 消息气泡组件（内容渲染、回复、转发、Reaction、Mention、编辑、置顶、URL 预览、过期计时、右键菜单、命令） |
| `MessageInput/` | 消息输入框（基于 Plate 富文本编辑器） |
| `MessageInput/plate-ui/` | Plate 编辑器 UI 组件 |
| `MessageInput/plate-ui/emoji-input-picker/` | Emoji 选择器 |
| `MessageInput/plate-ui/mention/` | @提及选择器 |
| `MessageInput/plugins.ts` | Plate 编辑器插件配置 |
| `FileBox/` | 文件预览容器 |
| `FileBox/preview/` | 文件预览器（图片、视频、音频、PDF、代码、文档） |
| `FileMessage/` | 文件消息组件（图片/视频/音频/其他文件消息、下载区、过期提示、上传进度） |
| `ChannelModal/` | 频道创建/编辑弹窗 |
| `ForwardModal/` | 消息转发弹窗 |
| `InviteModal/` | 邀请成员弹窗（添加成员、邮箱邀请） |
| `LeaveChannel/` | 离开频道弹窗（离开确认、转让所有权） |
| `ManageMembers/` | 成员管理（成员列表、修改/查看密码） |
| `MarkdownEditor/` | Markdown 编辑器组件 |
| `MarkdownRender.tsx` | Markdown 渲染组件（含 KaTeX 数学公式支持） |
| `Manifest/` | 应用 Manifest 配置与 Prompt 弹窗 |
| `Avatar.tsx` | 头像组件 |
| `AvatarUploader.tsx` | 头像上传组件 |
| `Channel.tsx` | 频道信息展示 |
| `ChannelIcon.tsx` | 频道类型图标 |
| `ContextMenu.tsx` | 通用右键菜单 |
| `ImagePreview.tsx` / `ImagePreviewModal.tsx` | 图片预览与全屏弹窗 |
| `AnnouncementBanner.tsx` / `AnnouncementModal.tsx` | 公告横幅与详情弹窗 |
| `AutoDeleteMessages.tsx` | 自动删除消息设置 |
| `Downloads.tsx` | 下载管理组件 |
| `InviteLink.tsx` | 邀请链接组件 |
| `ErrorCatcher.tsx` | 全局错误边界 |
| `InactiveScreen.tsx` | 长时间未活跃锁定屏 |
| `Language.tsx` | 语言切换组件 |
| `LinkifyText.tsx` | 文本链接识别 |
| `DeleteMessageConfirm.tsx` | 删除消息确认弹窗 |
| `GoBackNav.tsx` | 返回导航组件 |
| `Loading.tsx` | 加载状态组件 |
| `ConfigTip.tsx` | 配置提示组件 |
| `BlankPlaceholder.tsx` | 空白占位组件 |
| `GuestOnly.tsx` | 仅游客可见包装组件 |
| `Divider.tsx` | 分割线组件 |
| `AddEntriesMenu.tsx` | 添加条目菜单 |

### `hooks/` — 自定义 React Hooks

| 文件 | 说明 |
|---|---|
| `useSendMessage.ts` | 发送消息 |
| `useDeleteMessage.ts` | 删除消息 |
| `useForwardMessage.ts` | 转发消息 |
| `useFavMessage.ts` | 收藏/取消收藏消息 |
| `usePinMessage.ts` | 置顶/取消置顶消息 |
| `useNormalizeMessage.ts` | 消息数据标准化处理 |
| `useChatScroll.ts` | 聊天消息自动滚动 |
| `useUploadFile.ts` | 文件上传 |
| `useDownload.ts` | 文件下载 |
| `useDraft.ts` | 消息草稿保存与恢复 |
| `useInviteLink.ts` | 邀请链接生成与管理 |
| `useLeaveChannel.ts` | 离开频道逻辑 |
| `useLogout.ts` | 退出登录逻辑 |
| `useContextMenu.tsx` | 右键菜单状态管理 |
| `useCopy.ts` | 复制文本到剪贴板 |
| `useFilteredChannels.ts` | 频道列表筛选 |
| `useFilteredUsers.ts` | 用户列表筛选 |
| `useConfig.ts` | 服务器配置获取 |
| `useLicense.ts` | 许可证信息获取 |
| `usePrefetchData.ts` | 页面数据预加载 |
| `usePreload.ts` | 资源预加载 |
| `usePWAInstallPrompt.ts` | PWA 安装提示 |
| `useTabBroadcast.ts` | 多标签页广播通信 |
| `useExpiredResMap.ts` | 过期资源映射管理 |
| `useServerExtSetting.ts` | 服务器扩展设置 |
| `useUserOperation.ts` | 用户操作（禁言、踢出等） |
| `useAddLocalFileMessage.ts` | 添加本地文件消息（上传前预览） |
| `useRemoveLocalMessage.ts` | 移除本地消息（上传失败时清理） |
| `useStreaming/` | 流式消息（AI 对话流式输出） |
| `useLightweightHooks.ts` | 轻量级 hooks 集合 |

### `types/` — TypeScript 类型定义

| 文件 | 说明 |
|---|---|
| `auth.ts` | 认证相关类型 |
| `channel.ts` | 频道相关类型 |
| `message.ts` | 消息相关类型 |
| `user.ts` | 用户相关类型 |
| `server.ts` | 服务器配置类型 |
| `notification.ts` | 通知相关类型 |
| `resource.ts` | 资源相关类型 |
| `sse.ts` | Server-Sent Events 类型 |
| `common.ts` | 通用类型（分页、响应结构等） |
| `global.d.ts` | 全局类型声明 |

### `libs/` — 第三方库配置

| 文件 | 说明 |
|---|---|
| `DayjsSetting.ts` | Day.js 日期库配置（插件、本地化） |
| `TippySetting.ts` | Tippy.js Tooltip 库配置 |
| `polyfills.js` | 浏览器兼容性 Polyfill |

### `widget/` — 嵌入式聊天小组件

| 子目录/文件 | 说明 |
|---|---|
| `index.tsx` | 小组件主入口 |
| `WidgetContext.tsx` | 小组件上下文（共享状态） |
| `Popup/` | 弹窗模式小组件 |
| `Icon.tsx` | 小组件图标 |
| `ExtCssCode.tsx` | 外部 CSS 代码注入组件 |
| `useSSE.ts` | 小组件 SSE 连接 Hook |
| `useCache.ts` | 小组件缓存 Hook |

### `assets/` — 静态资源

| 文件 | 说明 |
|---|---|
| `index.css` | 全局样式与 Tailwind 基础样式 |

