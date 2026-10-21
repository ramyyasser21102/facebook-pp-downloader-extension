import { downloadProfilePicture } from '@/features/profile-picture/download';
import { profileLinkFor } from '@/features/profile-picture/find-image';
import {
  createOverlay,
  type Overlay,
} from '@/features/profile-picture/overlay';
import { pickProfileImage } from '@/features/profile-picture/picker';
import { hasMaxSize } from '@/features/profile-picture/url';
import { isContentRequest } from '@/messaging';

let picking = false;

async function save(src: string, overlay: Overlay): Promise<void> {
  const saved = await downloadProfilePicture(src);
  if (saved) {
    const size =
      saved.width && saved.height ? ` (${saved.width}×${saved.height})` : '';
    overlay.showToast(`Saved ${saved.fileName}${size}`, 'success');
  } else {
    overlay.showToast("Couldn't download the picture. Try again.", 'error');
  }
}

/** Feed and suggestion thumbnails carry no maximum size, so only a low-res copy exists here. */
function offerProfile(
  src: string,
  element: Element,
  overlay: Overlay,
): Promise<void> {
  return new Promise((resolve) => {
    const profile = profileLinkFor(element);
    const done = (action: () => void | Promise<void>) => async () => {
      await action();
      resolve();
    };
    overlay.showPrompt(
      profile
        ? 'Only a low-resolution copy is available here. Open the profile and pick the picture there for full size.'
        : 'Only a low-resolution copy is available here. Open the profile page and pick the picture there for full size.',
      [
        ...(profile
          ? [
              {
                label: 'Open profile',
                onClick: done(
                  () => void window.open(profile, '_blank', 'noopener'),
                ),
              },
            ]
          : []),
        {
          label: 'Save low-res anyway',
          secondary: true,
          onClick: done(() => save(src, overlay)),
        },
        { label: 'Cancel', secondary: true, onClick: done(() => {}) },
      ],
    );
    // The prompt hides itself after a while; do not hold the picker open forever.
    setTimeout(resolve, 12500);
  });
}

async function pickAndDownload(): Promise<void> {
  if (picking) return;
  picking = true;
  const overlay = createOverlay();
  try {
    const picked = await pickProfileImage(overlay);
    if (!picked) return;
    if (hasMaxSize(picked.url)) await save(picked.url, overlay);
    else await offerProfile(picked.url, picked.element, overlay);
    await new Promise((resolve) => setTimeout(resolve, 4000));
  } catch {
    overlay.showToast('Something went wrong.', 'error');
    await new Promise((resolve) => setTimeout(resolve, 4000));
  } finally {
    overlay.dispose();
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
