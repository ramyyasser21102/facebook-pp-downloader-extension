import { downloadProfilePicture } from '@/features/profile-picture/download';
import { pickProfileImageUrl } from '@/features/profile-picture/picker';
import { isContentRequest } from '@/messaging';

let picking = false;

async function pickAndDownload(): Promise<void> {
  if (picking) return;
  picking = true;
  try {
    const src = await pickProfileImageUrl();
    if (src) await downloadProfilePicture(src);
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
      void pickAndDownload();
      sendResponse({ ok: true });
    });
  },
});
