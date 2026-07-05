import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";

// ---------------------------------------------------------------------------
// Embeddable widget entry point
// ---------------------------------------------------------------------------
// This file defines a framework-agnostic public API that host pages drive with
// plain JS, regardless of the fact that the widget is built with React under
// the hood:
//
//   ShadowKit.widget.setConfig({ ... });
//   ShadowKit.widget.init();
//
// The React app itself is mounted into a plain <div> appended to the host's
// `placement` element. The Shadow DOM boundary is created *inside* App.jsx
// (via react-shadow) so that all styling is isolated from the host page.
// ---------------------------------------------------------------------------

const DEFAULT_OPTIONS = {
  placement: "#root",   // CSS selector for where to mount
  title: "Feedback",    // dialog title
  triggerText: "Feedback", // floating trigger button label
  primaryColor: null,   // optional accent color override (hex)
  apiUrl: null,         // optional: POST submissions here
  onSubmit: null,       // optional: callback(data) invoked on submit
  autoOpen: false,      // open the dialog immediately on init
  _openId: null,        // internal: bump to force-open via open()
};

class Widget {
  constructor() {
    this.root = null;
    this.options = { ...DEFAULT_OPTIONS };
  }

  setConfig(args = {}) {
    this.options = Object.assign(this.options, args);
    return this;
  }

  init() {
    if (this.root) return; // mount once

    const placementNode = document.querySelector(this.options.placement);
    if (!placementNode) {
      console.warn(
        `[ShadowKit] placement "${this.options.placement}" not found in DOM.`
      );
      return;
    }

    const mountNode = document.createElement("div");
    placementNode.appendChild(mountNode);

    this.root = createRoot(mountNode);
    this.root.render(<App {...this.options} />);
  }

  // Re-render with the current options (call after setConfig).
  update() {
    if (!this.root) return;
    this.root.render(<App {...this.options} />);
  }

  // Programmatically open the dialog. `_openId` changes on every call so the
  // App can distinguish repeated open() requests.
  open(config = {}) {
    this.setConfig({ ...config, autoOpen: true, _openId: Date.now() });
    this.update();
  }

  destroy() {
    if (this.root) {
      this.root.unmount();
      this.root = null;
    }
    const placementNode = document.querySelector(this.options.placement);
    if (placementNode) placementNode.innerHTML = "";
  }
}

const widget = new Widget();

// Expose on a namespaced global for UMD/script-tag consumers.
window.ShadowKit = window.ShadowKit || {};
window.ShadowKit.widget = widget;

export { widget, Widget };
