# keyboard-matrix-helper

键盘设计辅助工具 (Keyboard Design Assistant Tool) - 一个帮助机械键盘设计师将键盘布局转换为扫描矩阵的工具。

[English Version](readme-en.md) | [中文版本](README.md)

## 功能特性

- **键盘布局导入**：导入来自 [keyboard-layout-editor.com](https://www.keyboard-layout-editor.com/) 的键盘布局JSON文件
- **扫描矩阵设计**：将键盘按键映射到扫描矩阵的X/Y网络
- **多语言支持**：支持简体中文和English
- **深色/浅色主题**：支持主题切换
- **数据导出/导入**：支持导出和导入矩阵设计数据（JSON格式）
- **部署到Cloudflare**：使用Cloudflare Workers部署

## 技术栈

- **前端框架**: Vue 3
- **构建工具**: Vite
- **UI组件库**: Naive UI
- **国际化**: Vue I18n
- **路由**: Vue Router
- **部署**: Cloudflare Workers
- **TypeScript**: 类型安全开发

## 项目结构

```
src/
├── App.vue                    # 主应用组件
├── main.ts                    # 应用入口
├── router/
│   └── index.ts               # 路由配置
├── views/
│   ├── HomeView.vue           # 首页
│   └── MatrixLayoutView.vue   # 矩阵布局设计页面
├── components/
│   └── Keyboad.vue            # 键盘显示组件
├── type/
│   └── keyboard.ts            # 类型定义
├── utils/
│   └── txtUtils.ts            # 工具函数
└── i18n/
    ├── zh.json                # 中文国际化文件
    └── en.json                # 英文国际化文件
```

## 使用方法

### 1. 导入键盘布局

1. 访问 [keyboard-layout-editor.com](https://www.keyboard-layout-editor.com/)
2. 设计您的键盘布局
3. 导出为JSON格式
4. 在本工具中导入该JSON文件

### 2. 设计扫描矩阵

1. 设置矩阵尺寸（X轴和Y轴的数量）
2. 点击键盘上的按键进行选择
3. 选择X轴和Y轴的网络名称
4. 按键会自动映射到矩阵的对应位置
5. 导出矩阵设计数据

### 3. 数据管理

- **导出矩阵设计**：将当前矩阵设计导出为JSON文件
- **导入矩阵设计**：从JSON文件导入矩阵设计
- **复制到剪贴板**：将数据复制到剪贴板

## 开发指南

### 推荐的IDE设置

[VS Code](https://code.visualstudio.com/) + [Vue (Official)](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (并禁用Vetur).

### 推荐的浏览器设置

- Chromium-based browsers (Chrome, Edge, Brave, etc.):
  - [Vue.js devtools](https://chromewebstore.google.com/detail/vuejs-devtools/nhdogjmejiglipccpnnnanhbledajbpd)
  - [Turn on Custom Object Formatter in Chrome DevTools](http://bit.ly/object-formatters)
- Firefox:
  - [Vue.js devtools](https://addons.mozilla.org/en-US/firefox/addon/vue-js-devtools/)
  - [Turn on Custom Object Formatter in Firefox DevTools](https://fxdx.dev/firefox-devtools-custom-object-formatters/)

### TypeScript支持

TypeScript默认无法处理`.vue`文件的类型信息，因此我们使用`vue-tsc`代替`tsc`进行类型检查。在编辑器中，我们需要[Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar)来使TypeScript语言服务能够识别`.vue`类型。

### 配置自定义

参考 [Vite Configuration Reference](https://vite.dev/config/).

### 项目依赖安装

```sh
npm install
```

### 开发模式（热重载）

```sh
npm run dev
```

### 类型检查、编译和生产构建

```sh
npm run build
```

### 预览生产构建

```sh
npm run preview
```

### 部署到Cloudflare Workers

```sh
npm run deploy
```

### 生成Cloudflare Workers的TypeScript类型

```sh
npm run cf-typegen
```

## 贡献

欢迎贡献！请遵循以下步骤：

1. Fork 本仓库
2. 创建您的特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交您的更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开一个 Pull Request

### 贡献语言本地化翻译

本项目支持多语言，目前包含以下语言：
- **简体中文** (`zh`) - `src/i18n/zh.json`
- **English** (`en`) - `src/i18n/en.json`

如果您想添加新的语言支持或改进现有翻译，请按照以下步骤操作：

#### 1. 添加新语言

1. 在 `src/i18n/` 目录下创建新的语言文件，例如 `src/i18n/ja.json`（日语）
2. 复制现有语言文件（如 `en.json`）的内容作为模板
3. 将所有文本翻译成目标语言
4. 在 `src/main.ts` 中导入新的语言文件：
   ```typescript
   // @ts-ignore
   import ja from "./i18n/ja.json"
   ```
5. 在 `src/App.vue` 中添加新的语言选项：
   ```typescript
   const i18nOption = [
     {
       label: '简体中文',
       value: 'zh',
     },
     {
       label: "English",
       value: 'en',
     },
     {
       label: "日本語",  // 添加新语言
       value: 'ja',
     }
   ]
   ```

#### 2. 翻译规范

- **保持键名不变**：只翻译值，不要修改JSON键名
- **保持结构一致**：确保JSON结构与现有文件完全相同
- **使用占位符**：如果文本包含变量（如 `{name}`），请保持占位符不变
- **检查完整性**：确保所有文本都被翻译，没有遗漏

#### 3. 翻译文件示例

```json
{
  "l_error": "错误",
  "l_success": "成功",
  "global": {
    "l_title": "键盘设计辅助工具",
    "l_light": "浅色",
    "l_dark": "深色"
  }
}
```

#### 4. 提交翻译

1. 创建新的分支，例如 `feature/add-japanese-translation`
2. 添加翻译文件
3. 更新代码以支持新语言
4. 提交并创建 Pull Request
5. 在 PR 描述中说明添加的语言和翻译质量

#### 5. 翻译质量检查

- 确保翻译准确传达原意
- 保持术语一致性
- 检查UI显示效果（某些语言可能需要调整UI布局）
- 测试所有功能是否正常工作

#### 6. 现有语言改进

如果您发现现有翻译有错误或可以改进：
1. 直接修改对应的JSON文件
2. 在提交信息中说明修改内容
3. 创建 Pull Request

**注意**：请确保您的翻译符合目标语言的文化习惯和表达方式。

## 许可证

本项目采用 [MIT 许可证](LICENSE) - 详见 LICENSE 文件了解详情。

## 作者

- **HynemanKan** - 初始开发

## 致谢

- [Vue.js](https://vuejs.org/) - 前端框架
- [Vite](https://vitejs.dev/) - 构建工具
- [Naive UI](https://www.naiveui.com/) - UI组件库
- [keyboard-layout-editor.com](https://www.keyboard-layout-editor.com/) - 键盘布局编辑器
- [Cloudflare Workers](https://workers.cloudflare.com/) - 部署平台
