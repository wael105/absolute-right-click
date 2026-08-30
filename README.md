# Interaction Unlocker

A Manifest V3 extension for Brave and Chrome that restores text selection, copying, right-clicking, and image and link interaction only on sites you enable.

## Install in Brave

1. Open `brave://extensions`.
2. Enable **Developer mode**.
3. Select **Load unpacked** and choose this project folder.
4. Visit a website, open the extension popup, and enable the features you need.

The extension is inactive by default. Settings are saved locally by exact hostname, so `www.example.com` and `app.example.com` can be configured independently.

Setting changes take effect when the page is reloaded. Use the reload button in the popup after changing a setting. When text selection is enabled, the browser injects `selection.css` into all frames at the user stylesheet origin. The stylesheet is not a page-DOM node, so websites cannot remove it by replacing their document head.

Use **Manage saved sites** in the popup, or the extension's **Options** page, to view and remove stored site permissions.

The available per-site features are:

- Text selection
- Copying text
- The right-click context menu
- Image interaction, including right-clicking and dragging
- Link interaction, including right-clicking and dragging

## Limits

Browser-protected pages such as `brave://`, `chrome://`, extension stores, and many built-in viewers cannot be changed. The balanced unlocker intentionally avoids interfering with inputs and editable controls.

Drag unlocking for images and links is less reliable than the other features because websites can implement custom drag behavior in ways the extension cannot consistently override. Results may vary by site.
