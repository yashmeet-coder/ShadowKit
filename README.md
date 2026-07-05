# Shadow DOM Widget

A scaffold for building **embeddable widgets** with React, [shadcn/ui](https://ui.shadcn.com), Tailwind CSS, and the **Shadow DOM**. It ships a minimal **feedback widget** as a working demo.

The whole point of this project is the *structure*: how to drop a fully-styled React app onto any third-party page via a single `<script>` tag without your styles leaking out and without the host page's styles leaking in. The feedback form is just there to demonstrate the pattern — swap it for whatever your widget actually does.

## Why Shadow DOM?

Embeddable widgets run on pages you don't control. Those pages have their own CSS — often aggressive, `!important`-laden, global resets. A normal React app mounted into their DOM would be at the mercy of that cascade (and would in turn pollute it).

Mounting inside a **shadow root** gives you a clean, isolated subtree:

- Host page CSS **cannot** reach in (except inherited properties, which we reset with `:host { all: initial }`).
- Your CSS **cannot** leak out onto the host page.

## How it works

```
┌─ Host page ──────────────────────────────────────────────┐
│  <div id="feedback-widget">                               │
│    └─ <div> (React mount, created by main.jsx)            │
│         └─ #shadow-root  ← created by react-shadow        │
│              ├─ <style> …compiled Tailwind CSS…           │
│              ├─ <div class="sdw-portal-root"/>  ← dialog  │
│              │                                    portal  │
│              │                                    target  │
│              └─ <FeedbackWidget/>                         │
└───────────────────────────────────────────────────────────┘
```

Key pieces:

| File | Responsibility |
| --- | --- |
| `src/main.jsx` | Framework-agnostic `Widget` class exposed on `window.ShadowDomWidget`. Public API: `setConfig`, `init`, `update`, `open`, `destroy`. Mounts React into a `<div>` under the configured `placement`. |
| `src/App.jsx` | Creates the shadow root (`react-shadow`), injects the compiled CSS **inside** it, applies per-instance theming via CSS variables on the host, and exposes a portal target inside the shadow root. |
| `src/index.css` | Tailwind source + `:host` reset + design tokens. Compiled to `src/styles.css`. |
| `src/lib/utils.js` | `cn()` helper that understands the `tw-` prefix when merging classes. |
| `src/components/ui/*` | shadcn/ui primitives (`button`, `dialog`, `input`, `label`, `textarea`, `rating`). |
| `src/components/FeedbackWidget.jsx` | The demo widget. Replace this with your own UI. |

### The three details that make Shadow DOM work

1. **CSS is injected as an inline `<style>` inside the shadow root.** Tailwind can't reach into a shadow root from a global stylesheet, so `App.jsx` imports the compiled CSS with `?inline` and renders it as a `<style>` element within `root.div`.

2. **Tailwind is prefixed (`tw-`) and `important`.** The prefix avoids collisions with the host's own utility classes; `important` helps our rules win. See `tailwind.config.js`.

3. **Radix portals target a node inside the shadow root.** Components like Dialog portal to `document.body` by default — which is *outside* the shadow root, where our styles don't exist. `App.jsx` captures a `portalContainer` inside the shadow root and passes it to `DialogContent`'s `container` prop.

## Usage

### Development

```bash
npm install
npm run dev
```

Open the printed URL. `index.html` mounts the widget on a page with deliberately hostile global styles to prove isolation.

> `App.jsx` imports `./styles.css?inline`, which is generated from `index.css`.
> Run `npm run dev:css` in a second terminal (or `npm run build:css` once) so
> that file exists during development.

### Production build

```bash
npm run build
```

Produces a single self-contained UMD bundle at `dist/shadow-dom-widget.js` with **all CSS inlined** — no separate stylesheet to ship.

### Embedding on a page

```html
<div id="my-widget"></div>
<script src="https://your-cdn.com/shadow-dom-widget.js"></script>
<script>
  ShadowDomWidget.widget.setConfig({
    placement: '#my-widget',
    title: 'Send us feedback',
    primaryColor: '#4f46e5',
    apiUrl: 'https://your-api.com/feedback', // optional
    onSubmit: (data) => console.log(data),   // optional
  });
  ShadowDomWidget.widget.init();
</script>
```

## Configuration options

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `placement` | CSS selector | `"#root"` | Element to mount the widget into. |
| `title` | string | `"Feedback"` | Dialog title. |
| `triggerText` | string | `"Feedback"` | Floating trigger button label. |
| `primaryColor` | hex string | `null` | Accent color; applied as a CSS variable on the shadow host. |
| `apiUrl` | string | `null` | If set, submissions are `POST`ed here as JSON. |
| `onSubmit` | function | `null` | Callback invoked with the submission `data` object. |
| `autoOpen` | boolean | `false` | Open the dialog immediately on `init()`. |

### Public API

```js
const w = ShadowDomWidget.widget;
w.setConfig({ ... });  // merge options
w.init();              // mount once
w.open();              // programmatically open the dialog
w.update();            // re-render with current options
w.destroy();           // unmount and clean up
```

### Submission payload

```json
{
  "rating": 4,
  "category": "Feature request",
  "email": "you@example.com",
  "comment": "…",
  "submittedAt": "2026-07-05T10:00:00.000Z"
}
```

## Making it your own

1. Replace `src/components/FeedbackWidget.jsx` with your widget's UI.
2. Add shadcn/ui primitives as needed into `src/components/ui/` (remember the `tw-` prefix and the portal `container` pattern for any component that uses a Radix Portal).
3. Adjust design tokens in `src/index.css` and the theme in `tailwind.config.js`.
