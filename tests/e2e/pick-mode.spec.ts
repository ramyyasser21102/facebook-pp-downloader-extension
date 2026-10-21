import type { Download } from '@playwright/test';
import { cdnUrl, clickPromptButton, expect, overlay, test } from './fixtures';

const FULL = cdnUrl('full', 'stp=dst-jpg&cstp=mx960x960&ctp=s200x200');
const FEED = cdnUrl('feed', 'stp=dst-jpg_s100x100');

/** Waits for the file to finish saving so the context can close cleanly. */
async function savedName(download: Promise<Download>): Promise<string> {
  const file = await download;
  await file.path();
  return file.suggestedFilename();
}

const image = (src: string, size: number, left = 0) =>
  `<svg width="${size}" height="${size}" style="position:absolute;left:${left}px;top:0">
     <image width="${size}" height="${size}" xlink:href="${src}"/></svg>`;

test('full-size picture: upgrades ctp, saves, and shows a toast', async ({
  openFacebook,
  popupPage,
  startPicking,
  cdnRequests,
}) => {
  const page = await openFacebook(image(FULL, 300));
  const popup = await popupPage();
  await startPicking(popup);
  await page.bringToFront();

  await expect
    .poll(() => overlay(page, '.hint'))
    .toMatchObject({
      text: 'Click a profile picture · Esc to cancel',
      display: 'block',
    });

  const download = page.waitForEvent('download');
  await page.mouse.click(100, 100);
  expect(await savedName(download)).toBe('full_n.jpg');

  const ctps = cdnRequests.map((url) => new URL(url).searchParams.get('ctp'));
  expect(ctps).toContain('s960x960');
  await expect
    .poll(() => overlay(page, '.toast'))
    .toMatchObject({
      display: 'block',
    });
  expect((await overlay(page, '.toast'))?.text).toContain('Saved full_n.jpg');
});

test('picks the clicked image, not the largest one', async ({
  openFacebook,
  popupPage,
  startPicking,
}) => {
  const thumb = cdnUrl('thumb', 'stp=dst-jpg&cstp=mx960x960&ctp=s60x60');
  const page = await openFacebook(image(FULL, 300) + image(thumb, 60, 400));
  await startPicking(await popupPage());
  await page.bringToFront();

  const download = page.waitForEvent('download');
  await page.mouse.click(430, 30);
  expect(await savedName(download)).toBe('thumb_n.jpg');
});

test('low-res picture: prompts, and Save low-res anyway downloads it', async ({
  openFacebook,
  popupPage,
  startPicking,
  cdnRequests,
}) => {
  const page = await openFacebook(
    `<a href="https://www.facebook.com/profile">${image(FEED, 100)}</a>`,
  );
  await startPicking(await popupPage());
  await page.bringToFront();
  const before = cdnRequests.length;

  await page.mouse.click(50, 50);
  await expect
    .poll(() => overlay(page, '.prompt'))
    .toMatchObject({
      display: 'block',
    });
  // Nothing is fetched until the user chooses.
  expect(cdnRequests.length).toBe(before);

  const download = page.waitForEvent('download');
  await clickPromptButton(page, 'Save low-res anyway');
  expect(await savedName(download)).toBe('feed_n.jpg');
});

test('low-res picture: Open profile opens the linked profile in a new tab', async ({
  context,
  openFacebook,
  popupPage,
  startPicking,
}) => {
  const page = await openFacebook(
    `<a href="https://www.facebook.com/profile">${image(FEED, 100)}</a>`,
  );
  await startPicking(await popupPage());
  await page.bringToFront();
  await page.mouse.click(50, 50);
  await expect
    .poll(() => overlay(page, '.prompt'))
    .toMatchObject({
      display: 'block',
    });

  const opened = context.waitForEvent('page');
  await clickPromptButton(page, 'Open profile');
  expect((await opened).url()).toBe('https://www.facebook.com/profile');
});

test('Escape cancels pick mode and removes the overlay', async ({
  openFacebook,
  popupPage,
  startPicking,
}) => {
  const page = await openFacebook(image(FULL, 300));
  await startPicking(await popupPage());
  await page.bringToFront();
  await expect.poll(() => overlay(page, '.hint')).not.toBeNull();

  await page.keyboard.press('Escape');
  await expect
    .poll(() =>
      page.evaluate(
        () =>
          [...document.documentElement.children].filter((e) => e.shadowRoot)
            .length,
      ),
    )
    .toBe(0);
});

test('popup is disabled when no Facebook page answers', async ({
  popupPage,
}) => {
  const popup = await popupPage();
  const button = popup.getByRole('button', { name: 'Pick picture' });
  await expect(button).toBeDisabled();
  await expect(popup.getByText('Open a Facebook page')).toBeVisible();
});
