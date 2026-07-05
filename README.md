# ShadowKit

A starter kit for building **embeddable widgets** with React, [shadcn/ui](https://ui.shadcn.com), Tailwind CSS, and the **Shadow DOM**. It comes with a small **feedback widget** so you have something that actually works out of the box.

Think of the feedback form as a placeholder. The real value here is the plumbing: everything you need to take a fully-styled React app and drop it onto someone else's website with a single `<script>` tag — without your CSS bleeding onto their page, or their CSS wrecking yours. Rip out the feedback form, put your own thing in, and the hard parts are already solved.

## Why bother with the Shadow DOM?

Embeddable widgets have to survive on pages you don't own. And other people's pages are messy — global resets, `!important` everywhere, styles that assume they're the only thing on the page. Mount a normal React app into that environment and it's at the mercy of whatever CSS happens to be lying around (and yours will mess with theirs right back).

The Shadow DOM draws a hard line around your widget. Inside that boundary:

- The host page's CSS **can't** reach in — except for a handful of inherited properties, which we wipe out with `:host { all: initial }`.
- Your CSS **can't** leak out onto their page.

Two separate worlds, no cross-contamination.

## How it fits together

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

Here's what each piece is doing:

| File | What it's for |
| --- | --- |
| `src/main.jsx` | The public entry point — a plain `Widget` class on `window.ShadowKit` with `setConfig`, `init`, `update`, `open`, and `destroy`. It finds your `placement` element and mounts React into a `<div>` inside it. |
| `src/App.jsx` | Sets up the shadow root (via `react-shadow`), injects the compiled CSS **inside** it, themes the widget through CSS variables on the host, and hands the dialog a portal target that lives in the shadow root. |
| `src/index.css` | The Tailwind source, plus the `:host` reset and design tokens. Gets compiled into `src/styles.css`. |
| `src/lib/utils.js` | The `cn()` helper, taught to play nicely with the `tw-` class prefix when merging. |
| `src/components/ui/*` | The shadcn/ui primitives you'll actually use: `button`, `dialog`, `input`, `label`, `textarea`, `rating`. |
| `src/components/FeedbackWidget.jsx` | The demo widget. This is the part you'll throw away and replace. |

### The three things that make Shadow DOM actually work

These are the gotchas that trip everyone up. Get them right and the rest is easy.

1. **The CSS goes *inside* the shadow root as an inline `<style>`.** A global stylesheet can't reach into a shadow root, so a normal Tailwind setup would render your widget completely unstyled. The trick: `App.jsx` imports the compiled CSS with `?inline` (as a string) and drops it in as a `<style>` tag right inside `root.div`.

2. **Tailwind is prefixed with `tw-` and set to `important`.** The prefix keeps our utility classes from colliding with any the host page already uses; `important` makes sure our styles win the ones that matter. It's all in `tailwind.config.js`.

3. **Radix has to portal *into* the shadow root, not out of it.** Components like Dialog portal to `document.body` by default — which is outside the shadow root, i.e. exactly where none of our styles exist. So `App.jsx` grabs a `portalContainer` from inside the shadow root and passes it to `DialogContent`'s `container` prop. Miss this and your modal shows up as unstyled HTML.

## Getting started

### Running it locally

```bash
npm install
npm run dev
```

Open the URL it prints. The demo page (`index.html`) deliberately loads the widget onto a page with its own styling so you can see the isolation holding up in real time.

> One heads-up: `App.jsx` imports `./styles.css?inline`, and that file is generated from `index.css`. Run `npm run dev:css` in a second terminal (or just `npm run build:css` once) so it exists while you're developing — otherwise you'll get an import error.

### Building for production

```bash
npm run build
```

You get a single self-contained UMD bundle at `dist/shadowkit.js`, with **all the CSS baked right in**. No separate stylesheet to host, no extra request — just one file to serve.

### Dropping it onto a page

```html
<div id="my-widget"></div>
<script src="https://your-cdn.com/shadowkit.js"></script>
<script>
  ShadowKit.widget.setConfig({
    placement: '#my-widget',
    title: 'Send us feedback',
    primaryColor: '#4f46e5',
    apiUrl: 'https://your-api.com/feedback', // optional
    onSubmit: (data) => console.log(data),   // optional
  });
  ShadowKit.widget.init();
</script>
```

## Configuration

| Option | Type | Default | What it does |
| --- | --- | --- | --- |
| `placement` | CSS selector | `"#root"` | Where to mount the widget. |
| `title` | string | `"Feedback"` | The dialog's title. |
| `triggerText` | string | `"Feedback"` | Label on the floating trigger button. |
| `primaryColor` | hex string | `null` | Accent color, applied as a CSS variable on the shadow host. |
| `apiUrl` | string | `null` | If set, submissions get `POST`ed here as JSON. |
| `onSubmit` | function | `null` | Called with the submission `data` object. |
| `autoOpen` | boolean | `false` | Opens the dialog the moment `init()` runs. |

### The API

```js
const w = ShadowKit.widget;
w.setConfig({ ... });  // merge in your options
w.init();              // mount it (safe to call once)
w.open();              // pop the dialog open from your own code
w.update();            // re-render with the current options
w.destroy();           // tear it down and clean up
```

### What a submission looks like

```json
{
  "rating": 4,
  "category": "Feature request",
  "email": "you@example.com",
  "comment": "…",
  "submittedAt": "2026-07-05T10:00:00.000Z"
}
```

## Making it yours

The feedback widget is scaffolding — here's how to build your own thing on top of it:

1. Swap out `src/components/FeedbackWidget.jsx` for your own UI.
2. Pull in more shadcn/ui primitives under `src/components/ui/` as you need them. Just remember the two rules: keep the `tw-` prefix, and for anything that uses a Radix Portal, pass it the shadow-root `container` (see how the Dialog does it).
3. Tweak the design tokens in `src/index.css` and the theme in `tailwind.config.js` to match your brand.
4. Rename the global namespace and bundle name in `src/main.jsx` and `vite.config.js` so they're yours, not `ShadowKit`.

## License

MIT
