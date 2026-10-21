import { downloadProfilePicture } from '@/features/profile-picture/download';
import { createOverlay } from '@/features/profile-picture/overlay';
import { pickProfileImageUrl } from '@/features/profile-picture/picker';
import { isContentRequest } from '@/messaging';

let picking = false;

async function pickAndDownload(): Promise<void> {
  if (picking) return;
  picking = true;
  const overlay = createOverlay();
  try {
    const src = await pickProfileImageUrl(overlay);
    if (!src) {
      overlay.dispose();
      return;
    }
    const saved = await downloadProfilePicture(src);
    if (saved) {
      const size =
        saved.width && saved.height ? ` (${saved.width}×${saved.height})` : '';
      overlay.showToast(`Saved ${saved.fileName}${size}`, 'success');
    } else {
      overlay.showToast("Couldn't download the picture. Try again.", 'error');
    }
    setTimeout(() => overlay.dispose(), 4000);
  } catch {
    overlay.showToast('Something went wrong.', 'error');
    setTimeout(() => overlay.dispose(), 4000);
  } finally {
    picking = false;
  }
}

export default defineContentScript({
  matches: ['*://*.facebook.com/*'],
  main() {
    browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
      // Only accept messages from our own extension's pages.
      if (sender.id !== browser.runtime.id || !isContentRequest(message))
        return;
      // Pick mode outlives the popup, so acknowledge now and run in the page.
      if (message.kind === 'start-picking') void pickAndDownload();
      sendResponse({ ok: true });
    });
  },
});
