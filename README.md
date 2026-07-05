````md
# ShadowKit

A starter kit for building **embeddable widgets** with React, [shadcn/ui](https://ui.shadcn.com), Tailwind CSS, and the **Shadow DOM**. It ships with a simple **feedback widget** so you can clone the repo, run it, and immediately see a working example.

The feedback form is only there as a demo. The real value of this project is everything underneath it. It gives you everything you need to take a fully styled React application and embed it on someone else's website with a single `<script>` tag, without your styles affecting the host page or the host page breaking your widget.

Replace the feedback form with your own UI and most of the difficult work is already done.

## Why use the Shadow DOM?

Embeddable widgets have to live on websites you don't control, and those websites can contain all kinds of unexpected CSS. Global resets, aggressive selectors, and `!important` rules can completely change how your widget looks. At the same time, your own styles can accidentally affect the host page.

The Shadow DOM solves both problems by creating an isolated styling boundary.

Inside the shadow root:

- The host page's CSS cannot style your widget, apart from a few inherited properties that are reset using `:host { all: initial }`.
- Your widget's CSS stays completely inside the shadow root and never leaks onto the host page.

The result is a widget that looks exactly the same no matter where it's embedded.

## Project structure

```text
┌─ Host page ──────────────────────────────────────────────┐
│  <div id="feedback-widget">                              │
│    └─ <div> (React mount, created by main.jsx)           │
│         └─ #shadow-root  ← created by react-shadow       │
│              ├─ <style> …compiled Tailwind CSS…          │
│              ├─ <div class="sdw-portal-root"/>           │
│              └─ <FeedbackWidget/>                        │
└──────────────────────────────────────────────────────────┘
```

Here's what each file is responsible for.

| File | Purpose |
|------|---------|
| `src/main.jsx` | Public entry point. Exposes a `Widget` class on `window.ShadowKit` with `setConfig`, `init`, `update`, `open`, and `destroy`. It finds the target element and mounts React into it. |
| `src/App.jsx` | Creates the shadow root with `react-shadow`, injects the compiled CSS into it, applies theming through CSS variables, and provides a portal target for Radix components. |
| `src/index.css` | Tailwind source, design tokens, and the `:host` reset. Compiled into `src/styles.css`. |
| `src/lib/utils.js` | The `cn()` helper configured to work correctly with the `tw-` Tailwind prefix. |
| `src/components/ui/*` | Reusable shadcn/ui components like buttons, dialogs, inputs, labels, textareas, and ratings. |
| `src/components/FeedbackWidget.jsx` | The demo widget. This is the file you'll most likely replace with your own component. |

## Three things that make this work

If you're building a Shadow DOM widget for the first time, these are the parts that usually cause problems.

### 1. Tailwind CSS is injected into the shadow root

A normal stylesheet cannot style elements inside a shadow root.

To solve this, `App.jsx` imports the compiled CSS using `?inline`, which gives us the CSS as a string. That string is injected into a `<style>` tag inside the shadow root, so every Tailwind utility is available where it's needed.

### 2. Tailwind uses a prefix and `important`

Tailwind is configured with:

- a `tw-` prefix to avoid class name collisions with the host page
- `important: true` so important utility classes aren't overridden by the host page's CSS

Both settings live in `tailwind.config.js`.

### 3. Radix portals stay inside the shadow root

Radix components such as Dialog render into `document.body` by default.

That doesn't work here because `document.body` lives outside the shadow root, where none of the widget's styles exist.

Instead, `App.jsx` creates a portal container inside the shadow root and passes it to Radix's `container` prop. This keeps dialogs, popovers, and overlays fully styled and contained.

## Getting started

### Run locally

```bash
npm install
npm run dev
```

Open the URL printed by Vite. The demo page intentionally includes its own styles so you can verify that the widget remains isolated.

One thing to keep in mind is that `App.jsx` imports `styles.css` using `?inline`. That file is generated from `index.css`, so you'll also need to run:

```bash
npm run dev:css
```

or generate it once with:

```bash
npm run build:css
```

Otherwise the import won't exist during development.

## Build for production

```bash
npm run build
```

This produces a single UMD bundle:

```text
dist/shadowkit.js
```

The bundle already contains all of the compiled CSS, so there is no separate stylesheet to host or additional network request.

## Embedding the widget

```html
<div id="my-widget"></div>

<script src="https://your-cdn.com/shadowkit.js"></script>

<script>
  ShadowKit.widget.setConfig({
    placement: "#my-widget",
    title: "Send us feedback",
    primaryColor: "#4f46e5",
    apiUrl: "https://your-api.com/feedback",
    onSubmit: (data) => console.log(data),
  });

  ShadowKit.widget.init();
</script>
```

## Configuration

| Option | Type | Default | Description |
|------|------|---------|-------------|
| `placement` | CSS selector | `"#root"` | Element where the widget is mounted. |
| `title` | string | `"Feedback"` | Dialog title. |
| `triggerText` | string | `"Feedback"` | Text shown on the floating trigger button. |
| `primaryColor` | hex string | `null` | Accent color applied through CSS variables. |
| `apiUrl` | string | `null` | If provided, submissions are sent here using a JSON POST request. |
| `onSubmit` | function | `null` | Callback invoked with the submitted data. |
| `autoOpen` | boolean | `false` | Opens the widget automatically after initialization. |

## Public API

```js
const widget = ShadowKit.widget;

widget.setConfig({ ... });
widget.init();
widget.open();
widget.update();
widget.destroy();
```

## Submission format

```json
{
  "rating": 4,
  "category": "Feature request",
  "email": "you@example.com",
  "comment": "...",
  "submittedAt": "2026-07-05T10:00:00.000Z"
}
```

## Customizing the starter

The feedback widget is simply an example. To build your own widget:

1. Replace `src/components/FeedbackWidget.jsx` with your own UI.
2. Add more shadcn/ui components under `src/components/ui/` as needed. If a component uses a Radix Portal, remember to pass it the shadow root's `container`.
3. Update the design tokens in `src/index.css` and customize the theme in `tailwind.config.js`.
4. Rename the global namespace and bundle name in `src/main.jsx` and `vite.config.js` so they match your project instead of `ShadowKit`.

## License

MIT
````
