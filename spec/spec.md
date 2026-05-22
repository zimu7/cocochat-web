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