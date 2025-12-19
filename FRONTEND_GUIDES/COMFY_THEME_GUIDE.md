Roo said
To understand how to add custom themes, I need to investigate how ComfyUI handles frontend code and theming. The file you provided, app/frontend_management.py, manages different frontend versions, which is a great starting point. It seems a "theme" might be treated as a custom frontend.

I'll start by examining the main application entry point, main.py, to see how the frontend is initialized and if there are any command-line arguments that control which frontend (or theme) is loaded. This should give us a clear picture of the mechanism for customization.


Roo said
After reviewing main.py, I see that it imports and uses server.py to handle the web server and comfy.options for argument parsing. The key to understanding how themes are loaded lies in how the server is configured and what command-line arguments are available.

I'll now read server.py to see how it serves the frontend files and comfy/options.py to identify any arguments related to custom frontends or themes. This should reveal the mechanism for loading a custom theme.


Roo said
I've analyzed server.py and comfy/options.py. Here's what I've found:

In server.py, the web_root is set by FrontendManager.init_frontend(args.front_end_version) unless --front-end-root is specified. This confirms that a custom frontend can be loaded.
server.py imports FrontendManager from app/frontend_management.py, which you initially provided.
The command-line arguments (args) are imported from comfy.cli_args.
It appears that a "theme" is essentially a custom frontend. The next step is to understand how to use the --front-end-version and --front-end-root arguments.

I will now examine comfy/cli_args.py to see how these arguments are defined and simultaneously re-examine app/frontend_management.py, focusing on the init_frontend method, to understand how a custom frontend is loaded.


Roo said
I've analyzed the relevant files and determined how to add custom themes to ComfyUI. Here's a breakdown of the process:

There are two primary methods for loading a custom theme, which is treated as a custom frontend:

1. Local Development using --front-end-root
This method is ideal for developing and testing a theme locally.

Create a Theme Directory: Create a folder that will serve as the root for your custom theme. This folder should contain all the necessary frontend files (e.g., index.html, CSS, JavaScript).

Launch ComfyUI with the --front-end-root argument: Start ComfyUI and point it to your theme directory.

For example, if your theme is in a directory named my-theme, you would run:

python main.py --front-end-root /path/to/my-theme

This is defined in comfy/cli_args.py.

2. GitHub Release using --front-end-version
This method is suitable for distributing your theme.

Host on GitHub: Your theme's source code should be in a public GitHub repository.

Create a Release: Package your theme's built frontend files into a dist.zip file and attach it to a new release in your repository.

Launch ComfyUI with the --front-end-version argument: Start ComfyUI with the argument pointing to your repository and the desired version.

The format is [repoOwner]/[repoName]@[version]. For example:

python main.py --front-end-version your-username/your-theme-repo@latest

This process is managed by the init_frontend function in app/frontend_management.py, which downloads and extracts the dist.zip file into the web_custom_versions directory. The --front-end-version argument is defined in comfy/cli_args.py.

By using one of these two methods, you can successfully load a custom theme in ComfyUI.

I have investigated the ComfyUI source code and determined two methods for adding custom themes. You can either load a theme from a local directory using the --front-end-root command-line argument, which is ideal for development, or you can load it from a GitHub repository release using the --front-end-version argument, which is better for distribution. The choice of method depends on whether you are developing a theme or distributing a finished one.

---

To create a custom theme in ComfyUI, you need to create a JSON palette file with the appropriate color structure and add it through the color palette system.

## Theme Structure

Custom themes are JSON files that define colors for different UI components. Each theme has three main color categories:

1. **node_slot** - Colors for different node connection types (CLIP, MODEL, IMAGE, etc.)
2. **litegraph_base** - Core node editor colors (backgrounds, text, borders)
3. **comfy_base** - General UI colors (menus, inputs, content areas) [1](#0-0) </cite>

## Creating a Custom Theme

1. Create a new JSON file in `src/assets/palettes/` with this structure:
```json
{
  "id": "my-custom-theme",
  "name": "My Custom Theme",
  "colors": {
    "node_slot": {
      "CLIP": "#your-color",
      "MODEL": "#your-color",
      // ... other node types
    },
    "litegraph_base": {
      "NODE_DEFAULT_BGCOLOR": "#your-color",
      "NODE_TITLE_COLOR": "#your-color",
      // ... other litegraph colors
    },
    "comfy_base": {
      "bg-color": "#your-color",
      "fg-color": "#your-color",
      // ... other UI colors
    }
  }
}
```

2. Use existing themes as reference:
   - Dark theme: `src/assets/palettes/dark.json` [1](#0-0) </cite>
   - Light theme: `src/assets/palettes/light.json` [2](#0-1) </cite>
   - GitHub theme: `src/assets/palettes/github.json` [3](#0-2) </cite>

## Adding Your Theme

The color palette service handles theme management. You can add custom themes programmatically using `addCustomColorPalette()` [4](#0-3) </cite>, which validates the palette against the schema and persists it to settings.

## Applying Themes

Themes can be selected from the UI menu under the "Theme" submenu [5](#0-4) </cite>. When selected, the theme loads via `colorPaletteService.loadColorPalette()` [6](#0-5) </cite>.

## Notes

- All color values should be valid CSS color codes (hex, rgb, etc.)
- The theme ID must be unique
- Empty strings are allowed for unused node slot colors
- The system supports both light and dark themes - set `"light_theme": true` for light themes [7](#0-6) </cite>
- Themes are validated against a Zod schema before being added [8](#0-7) </cite>

### Citations

**File:** src/assets/palettes/dark.json (L1-72)
```json
{
  "id": "dark",
  "name": "Dark (Default)",
  "colors": {
    "node_slot": {
      "CLIP": "#FFD500",
      "CLIP_VISION": "#A8DADC",
      "CLIP_VISION_OUTPUT": "#ad7452",
      "CONDITIONING": "#FFA931",
      "CONTROL_NET": "#6EE7B7",
      "IMAGE": "#64B5F6",
      "LATENT": "#FF9CF9",
      "MASK": "#81C784",
      "MODEL": "#B39DDB",
      "STYLE_MODEL": "#C2FFAE",
      "VAE": "#FF6E6E",
      "NOISE": "#B0B0B0",
      "GUIDER": "#66FFFF",
      "SAMPLER": "#ECB4B4",
      "SIGMAS": "#CDFFCD",
      "TAESD": "#DCC274"
    },
    "litegraph_base": {
      "BACKGROUND_IMAGE": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAIAAAD/gAIDAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAQBJREFUeNrs1rEKwjAUhlETUkj3vP9rdmr1Ysammk2w5wdxuLgcMHyptfawuZX4pJSWZTnfnu/lnIe/jNNxHHGNn//HNbbv+4dr6V+11uF527arU7+u63qfa/bnmh8sWLBgwYJlqRf8MEptXPBXJXa37BSl3ixYsGDBMliwFLyCV/DeLIMFCxYsWLBMwSt4Be/NggXLYMGCBUvBK3iNruC9WbBgwYJlsGApeAWv4L1ZBgsWLFiwYJmCV/AK3psFC5bBggULloJX8BpdwXuzYMGCBctgwVLwCl7Be7MMFixYsGDBsu8FH1FaSmExVfAxBa/gvVmwYMGCZbBg/W4vAQYA5tRF9QYlv/QAAAAASUVORK5CYII=",
      "CLEAR_BACKGROUND_COLOR": "#141414",
      "NODE_TITLE_COLOR": "#999",
      "NODE_SELECTED_TITLE_COLOR": "#FFF",
      "NODE_TEXT_SIZE": 14,
      "NODE_TEXT_COLOR": "#AAA",
      "NODE_TEXT_HIGHLIGHT_COLOR": "#FFF",
      "NODE_SUBTEXT_SIZE": 12,
      "NODE_DEFAULT_COLOR": "#333",
      "NODE_DEFAULT_BGCOLOR": "#353535",
      "NODE_DEFAULT_BOXCOLOR": "#666",
      "NODE_DEFAULT_SHAPE": 2,
      "NODE_BOX_OUTLINE_COLOR": "#FFF",
      "NODE_BYPASS_BGCOLOR": "#FF00FF",
      "NODE_ERROR_COLOUR": "#E00",
      "DEFAULT_SHADOW_COLOR": "rgba(0,0,0,0.5)",
      "DEFAULT_GROUP_FONT": 24,
      "WIDGET_BGCOLOR": "#222",
      "WIDGET_OUTLINE_COLOR": "#666",
      "WIDGET_TEXT_COLOR": "#DDD",
      "WIDGET_SECONDARY_TEXT_COLOR": "#999",
      "WIDGET_DISABLED_TEXT_COLOR": "#666",
      "LINK_COLOR": "#9A9",
      "EVENT_LINK_COLOR": "#A86",
      "CONNECTING_LINK_COLOR": "#AFA",
      "BADGE_FG_COLOR": "#FFF",
      "BADGE_BG_COLOR": "#0F1F0F"
    },
    "comfy_base": {
      "fg-color": "#fff",
      "bg-color": "#202020",
      "comfy-menu-bg": "#171718",
      "comfy-menu-secondary-bg": "#303030",
      "comfy-input-bg": "#222",
      "input-text": "#ddd",
      "descrip-text": "#999",
      "drag-text": "#ccc",
      "error-text": "#ff4444",
      "border-color": "#4e4e4e",
      "tr-even-bg-color": "#222",
      "tr-odd-bg-color": "#353535",
      "content-bg": "#4e4e4e",
      "content-fg": "#fff",
      "content-hover-bg": "#222",
      "content-hover-fg": "#fff",
      "bar-shadow": "rgba(16, 16, 16, 0.5) 0 0 0.5rem"
    }
  }
```

**File:** src/assets/palettes/light.json (L1-79)
```json
{
  "id": "light",
  "name": "Light",
  "light_theme": true,
  "colors": {
    "node_slot": {
      "CLIP": "#FFA726",
      "CLIP_VISION": "#5C6BC0",
      "CLIP_VISION_OUTPUT": "#8D6E63",
      "CONDITIONING": "#EF5350",
      "CONTROL_NET": "#66BB6A",
      "IMAGE": "#42A5F5",
      "LATENT": "#AB47BC",
      "MASK": "#9CCC65",
      "MODEL": "#7E57C2",
      "STYLE_MODEL": "#D4E157",
      "VAE": "#FF7043",
      "NOISE": "#B0B0B0",
      "GUIDER": "#66FFFF",
      "SAMPLER": "#ECB4B4",
      "SIGMAS": "#CDFFCD",
      "TAESD": "#DCC274"
    },
    "litegraph_base": {
      "BACKGROUND_IMAGE": "data:image/gif;base64,R0lGODlhZABkALMAAAAAAP///+vr6+rq6ujo6Ofn5+bm5uXl5d3d3f///wAAAAAAAAAAAAAAAAAAAAAAACH5BAEAAAkALAAAAABkAGQAAAT/UMhJq7046827HkcoHkYxjgZhnGG6si5LqnIM0/fL4qwwIMAg0CAsEovBIxKhRDaNy2GUOX0KfVFrssrNdpdaqTeKBX+dZ+jYvEaTf+y4W66mC8PUdrE879f9d2mBeoNLfH+IhYBbhIx2jkiHiomQlGKPl4uZe3CaeZifnnijgkESBqipqqusra6vsLGys62SlZO4t7qbuby7CLa+wqGWxL3Gv3jByMOkjc2lw8vOoNSi0czAncXW3Njdx9Pf48/Z4Kbbx+fQ5evZ4u3k1fKR6cn03vHlp7T9/v8A/8Gbp4+gwXoFryXMB2qgwoMMHyKEqA5fxX322FG8tzBcRnMW/zlulPbRncmQGidKjMjyYsOSKEF2FBlJQMCbOHP6c9iSZs+UnGYCdbnSo1CZI5F64kn0p1KnTH02nSoV3dGTV7FFHVqVq1dtWcMmVQZTbNGu72zqXMuW7danVL+6e4t1bEy6MeueBYLXrNO5Ze36jQtWsOG97wIj1vt3St/DjTEORss4nNq2mDP3e7w4r1bFkSET5hy6s2TRlD2/mSxXtSHQhCunXo26NevCpmvD/UU6tuullzULH76q92zdZG/Ltv1a+W+osI/nRmyc+fRi1Xdbh+68+0vv10dH3+77KD/i6Id ... (truncated)
      "CLEAR_BACKGROUND_COLOR": "lightgray",
      "NODE_TITLE_COLOR": "#222",
      "NODE_SELECTED_TITLE_COLOR": "#000",
      "NODE_TEXT_SIZE": 14,
      "NODE_TEXT_COLOR": "#444",
      "NODE_TEXT_HIGHLIGHT_COLOR": "#1e293b",
      "NODE_SUBTEXT_SIZE": 12,
      "NODE_DEFAULT_COLOR": "#F7F7F7",
      "NODE_DEFAULT_BGCOLOR": "#F5F5F5",
      "NODE_DEFAULT_BOXCOLOR": "#CCC",
      "NODE_DEFAULT_SHAPE": 2,
      "NODE_BOX_OUTLINE_COLOR": "#000",
      "NODE_BYPASS_BGCOLOR": "#FF00FF",
      "NODE_ERROR_COLOUR": "#E00",
      "DEFAULT_SHADOW_COLOR": "rgba(0,0,0,0.1)",
      "DEFAULT_GROUP_FONT": 24,
      "WIDGET_BGCOLOR": "#D4D4D4",
      "WIDGET_OUTLINE_COLOR": "#999",
      "WIDGET_TEXT_COLOR": "#222",
      "WIDGET_SECONDARY_TEXT_COLOR": "#555",
      "WIDGET_DISABLED_TEXT_COLOR": "#999",
      "LINK_COLOR": "#4CAF50",
      "EVENT_LINK_COLOR": "#FF9800",
      "CONNECTING_LINK_COLOR": "#2196F3",
      "BADGE_FG_COLOR": "#000",
      "BADGE_BG_COLOR": "#FFF"
    },
    "comfy_base": {
      "fg-color": "#222",
      "bg-color": "#DDD",
      "comfy-menu-bg": "#FFFFFF",
      "comfy-menu-hover-bg": "#ccc",
      "comfy-menu-secondary-bg": "#EEE",
      "comfy-input-bg": "#C9C9C9",
      "input-text": "#222",
      "descrip-text": "#444",
      "drag-text": "#555",
      "error-text": "#F44336",
      "border-color": "#888",
      "tr-even-bg-color": "#f9f9f9",
      "tr-odd-bg-color": "#fff",
      "content-bg": "#e0e0e0",
      "content-fg": "#222",
      "content-hover-bg": "#adadad",
      "content-hover-fg": "#222",
      "bar-shadow": "rgba(16, 16, 16, 0.25) 0 0 0.5rem",
      "interface-panel-box-shadow": "1px 1px 8px 0 rgba(0, 0, 0, 0.2)",
      "interface-panel-drop-shadow": "1px 1px 4px rgba(0, 0, 0, 0.4)",
      "interface-panel-hover-surface": "var(--color-gray-200)",
      "interface-panel-selected-surface": "color-mix(in srgb, var(--interface-panel-surface) 78%, var(--contrast-mix-color))",
      "contrast-mix-color": "#000"
    }
  }
```

**File:** src/assets/palettes/github.json (L1-78)
```json
{
  "id": "github",
  "name": "Github",
  "colors": {
    "node_slot": {
      "BOOLEAN": "",
      "CLIP": "#eacb8b",
      "CLIP_VISION": "#A8DADC",
      "CLIP_VISION_OUTPUT": "#ad7452",
      "CONDITIONING": "#cf876f",
      "CONTROL_NET": "#00d78d",
      "CONTROL_NET_WEIGHTS": "",
      "FLOAT": "",
      "GLIGEN": "",
      "IMAGE": "#80a1c0",
      "IMAGEUPLOAD": "",
      "INT": "",
      "LATENT": "#b38ead",
      "LATENT_KEYFRAME": "",
      "MASK": "#a3bd8d",
      "MODEL": "#8978a7",
      "SAMPLER": "",
      "SIGMAS": "",
      "STRING": "",
      "STYLE_MODEL": "#C2FFAE",
      "T2I_ADAPTER_WEIGHTS": "",
      "TAESD": "#DCC274",
      "TIMESTEP_KEYFRAME": "",
      "UPSCALE_MODEL": "",
      "VAE": "#be616b"
    },
    "litegraph_base": {
      "BACKGROUND_IMAGE": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAIAAAD/gAIDAAAACXBIWXMAAAsTAAALEwEAmpwYAAAGlmlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4gPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iQWRvYmUgWE1QIENvcmUgOS4xLWMwMDEgNzkuMTQ2Mjg5OSwgMjAyMy8wNi8yNS0yMDowMTo1NSAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczpkYz0iaHR0cDovL3B1cmwub3JnL2RjL2VsZW1lbnRzLzEuMS8iIHhtbG5zOnBob3Rvc2hvcD0iaHR0cDovL25zLmFkb2JlLmNvbS9waG90b3Nob3AvMS4wLyIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0RXZ0PSJodHRwOi8vbnMuYWRvYmUuY29tL3h ... (truncated)
      "CLEAR_BACKGROUND_COLOR": "#040506",
      "NODE_TITLE_COLOR": "#999",
      "NODE_SELECTED_TITLE_COLOR": "#e5eaf0",
      "NODE_TEXT_SIZE": 14,
      "NODE_TEXT_COLOR": "#bcc2c8",
      "NODE_SUBTEXT_SIZE": 12,
      "NODE_DEFAULT_COLOR": "#161b22",
      "NODE_DEFAULT_BGCOLOR": "#13171d",
      "NODE_DEFAULT_BOXCOLOR": "#30363d",
      "NODE_DEFAULT_SHAPE": 2,
      "NODE_BOX_OUTLINE_COLOR": "#e5eaf0",
      "NODE_BYPASS_BGCOLOR": "#FF00FF",
      "NODE_ERROR_COLOUR": "#E00",
      "DEFAULT_SHADOW_COLOR": "rgba(0,0,0,0.5)",
      "DEFAULT_GROUP_FONT": 24,
      "WIDGET_BGCOLOR": "#161b22",
      "WIDGET_OUTLINE_COLOR": "#30363d",
      "WIDGET_TEXT_COLOR": "#bcc2c8",
      "WIDGET_SECONDARY_TEXT_COLOR": "#999",
      "WIDGET_DISABLED_TEXT_COLOR": "#30363d",
      "LINK_COLOR": "#9A9",
      "EVENT_LINK_COLOR": "#A86",
      "CONNECTING_LINK_COLOR": "#AFA"
    },
    "comfy_base": {
      "fg-color": "#e5eaf0",
      "bg-color": "#161b22",
      "comfy-menu-bg": "#13171d",
      "comfy-menu-secondary-bg": "#11141A",
      "comfy-input-bg": "#161b22",
      "input-text": "#bcc2c8",
      "descrip-text": "#999",
      "drag-text": "#ccc",
      "error-text": "#ff4444",
      "border-color": "#30363d",
      "tr-even-bg-color": "#161b22",
      "tr-odd-bg-color": "#13171d",
      "content-bg": "#30363d",
      "content-fg": "#e5eaf0",
      "content-hover-bg": "#161b22",
      "content-hover-fg": "#e5eaf0",
      "bar-shadow": "rgba(0, 0, 0, 1) 0 0 0.5rem"
    }
  }
```

**File:** src/services/colorPaletteService.ts (L39-45)
```typescript
  const validateColorPalette = (data: unknown): Palette => {
    const result = paletteSchema.safeParse(data)
    if (result.success) return result.data

    const error = fromZodError(result.error)
    throw new Error(`Invalid color palette against zod schema:\n${error}`)
  }
```

**File:** src/services/colorPaletteService.ts (L69-73)
```typescript
  const addCustomColorPalette = async (colorPalette: Palette) => {
    validateColorPalette(colorPalette)
    colorPaletteStore.addCustomPalette(colorPalette)
    await persistCustomColorPalettes()
  }
```

**File:** src/components/sidebar/ComfyMenuButton.vue (L187-199)
```vue
const themeMenuItems = computed(() => {
  return colorPaletteStore.palettes.map((palette) => ({
    key: `theme-${palette.id}`,
    label: palette.name,
    parentPath: 'theme',
    comfyCommand: {
      active: () => colorPaletteStore.activePaletteId === palette.id
    },
    command: async () => {
      await colorPaletteService.loadColorPalette(palette.id)
    }
  }))
})
```
