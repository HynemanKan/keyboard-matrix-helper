# keyboard-matrix-helper

Keyboard Design Assistant Tool - A tool to help mechanical keyboard designers convert keyboard layouts to scan matrices.

[English Version](readme-en.md) | [中文版本](README.md)

## Features

- **Keyboard Layout Import**: Import keyboard layout JSON files from [keyboard-layout-editor.com](https://www.keyboard-layout-editor.com/)
- **Scan Matrix Design**: Map keyboard keys to X/Y networks of scan matrix
- **Multi-language Support**: Supports Simplified Chinese and English
- **Dark/Light Theme**: Supports theme switching
- **Data Export/Import**: Supports exporting and importing matrix design data (JSON format)
- **Deploy to Cloudflare**: Deploy using Cloudflare Workers

## Technology Stack

- **Frontend Framework**: Vue 3
- **Build Tool**: Vite
- **UI Component Library**: Naive UI
- **Internationalization**: Vue I18n
- **Routing**: Vue Router
- **Deployment**: Cloudflare Workers
- **TypeScript**: Type-safe development

## Project Structure

```
src/
├── App.vue                    # Main application component
├── main.ts                    # Application entry
├── router/
│   └── index.ts               # Router configuration
├── views/
│   ├── HomeView.vue           # Home page
│   └── MatrixLayoutView.vue   # Matrix layout design page
├── components/
│   └── Keyboad.vue            # Keyboard display component
├── type/
│   └── keyboard.ts            # Type definitions
├── utils/
│   └── txtUtils.ts            # Utility functions
└── i18n/
    ├── zh.json                # Chinese internationalization file
    └── en.json                # English internationalization file
```

## Usage

### 1. Import Keyboard Layout

1. Visit [keyboard-layout-editor.com](https://www.keyboard-layout-editor.com/)
2. Design your keyboard layout
3. Export as JSON format
4. Import the JSON file in this tool

### 2. Design Scan Matrix

1. Set matrix size (number of X-axis and Y-axis)
2. Click keys on the keyboard to select them
3. Select X-axis and Y-axis network names
4. Keys will automatically map to corresponding positions in the matrix
5. Export matrix design data

### 3. Data Management

- **Export Matrix Design**: Export current matrix design as JSON file
- **Import Matrix Design**: Import matrix design from JSON file
- **Copy to Clipboard**: Copy data to clipboard

## Development Guide

### Recommended IDE Setup

[VS Code](https://code.visualstudio.com/) + [Vue (Official)](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur).

### Recommended Browser Setup

- Chromium-based browsers (Chrome, Edge, Brave, etc.):
  - [Vue.js devtools](https://chromewebstore.google.com/detail/vuejs-devtools/nhdogjmejiglipccpnnnanhbledajbpd)
  - [Turn on Custom Object Formatter in Chrome DevTools](http://bit.ly/object-formatters)
- Firefox:
  - [Vue.js devtools](https://addons.mozilla.org/en-US/firefox/addon/vue-js-devtools/)
  - [Turn on Custom Object Formatter in Firefox DevTools](https://fxdx.dev/firefox-devtools-custom-object-formatters/)

### TypeScript Support

TypeScript cannot handle type information for `.vue` files by default, so we use `vue-tsc` instead of `tsc` for type checking. In editors, we need [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) to make the TypeScript language service aware of `.vue` types.

### Configuration Customization

See [Vite Configuration Reference](https://vite.dev/config/).

### Project Dependencies Installation

```sh
npm install
```

### Development Mode (Hot Reload)

```sh
npm run dev
```

### Type Checking, Compilation and Production Build

```sh
npm run build
```

### Preview Production Build

```sh
npm run preview
```

### Deploy to Cloudflare Workers

```sh
npm run deploy
```

### Generate TypeScript Types for Cloudflare Workers

```sh
npm run cf-typegen
```

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork this repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Contributing Language Localization Translations

This project supports multiple languages. Currently includes:
- **Simplified Chinese** (`zh`) - `src/i18n/zh.json`
- **English** (`en`) - `src/i18n/en.json`

If you want to add support for a new language or improve existing translations, please follow these steps:

#### 1. Adding a New Language

1. Create a new language file in the `src/i18n/` directory, e.g., `src/i18n/ja.json` (Japanese)
2. Copy the content of an existing language file (e.g., `en.json`) as a template
3. Translate all text into the target language
4. Import the new language file in `src/main.ts`:
   ```typescript
   // @ts-ignore
   import ja from "./i18n/ja.json"
   ```
5. Add the new language option in `src/App.vue`:
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
       label: "日本語",  // Add new language
       value: 'ja',
     }
   ]
   ```

#### 2. Translation Guidelines

- **Keep key names unchanged**: Only translate values, do not modify JSON keys
- **Maintain consistent structure**: Ensure JSON structure is identical to existing files
- **Use placeholders**: If text contains variables (e.g., `{name}`), keep placeholders unchanged
- **Check completeness**: Ensure all text is translated, no omissions

#### 3. Translation File Example

```json
{
  "l_error": "Error",
  "l_success": "Success",
  "global": {
    "l_title": "Keyboard Design Assistant Tool",
    "l_light": "Light",
    "l_dark": "Dark"
  }
}
```

#### 4. Submitting Translations

1. Create a new branch, e.g., `feature/add-japanese-translation`
2. Add translation file
3. Update code to support the new language
4. Commit and create Pull Request
5. Describe the added language and translation quality in PR description

#### 5. Translation Quality Check

- Ensure translations accurately convey the original meaning
- Maintain terminology consistency
- Check UI display effects (some languages may require UI layout adjustments)
- Test all functions work properly

#### 6. Improving Existing Translations

If you find errors in existing translations or can improve them:
1. Directly modify the corresponding JSON file
2. Explain the changes in the commit message
3. Create Pull Request

**Note**: Please ensure your translations conform to the cultural habits and expressions of the target language.

## License

This project is licensed under the [MIT License](LICENSE) - see the LICENSE file for details.

## Author

- **HynemanKan** - Initial development

## Acknowledgments

- [Vue.js](https://vuejs.org/) - Frontend framework
- [Vite](https://vitejs.dev/) - Build tool
- [Naive UI](https://www.naiveui.com/) - UI component library
- [keyboard-layout-editor.com](https://www.keyboard-layout-editor.com/) - Keyboard layout editor
- [Cloudflare Workers](https://workers.cloudflare.com/) - Deployment platform