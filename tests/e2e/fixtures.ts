import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import {
  type BrowserContext,
  test as base,
  chromium,
  type Page,
} from '@playwright/test';

const EXTENSION = path.resolve('.output/chrome-mv3');

// A 1x1 PNG, served as the "profile picture".
const PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
  'base64',
);

export const cdnUrl = (name: string, params: string) =>
  `https://scontent.test.fbcdn.net/v/t39.30808-1/${name}_n.jpg?${params}&oh=a&oe=b`;

type Fixtures = {
  context: BrowserContext;
  extensionId: string;
  /** Requested CDN URLs, in order. */
  cdnRequests: string[];
  /** Opens a fake facebook.com page containing `body`. */
  openFacebook: (body: string) => Promise<Page>;
  /** Opens the popup page and asks the Facebook tab to start pick mode. */
  startPicking: (popup: Page) => Promise<void>;
  popupPage: () => Promise<Page>;
};

export const test = base.extend<Fixtures>({
  // biome-ignore lint/correctness/noEmptyPattern: Playwright fixture signature
  context: async ({}, use) => {
    const context = await chromium.launchPersistentContext(
      mkdtempSync(path.join(tmpdir(), 'pp-e2e-')),
      {
        channel: 'chromium',
        headless: true,
        acceptDownloads: true,
        args: [
          `--disable-extensions-except=${EXTENSION}`,
          `--load-extension=${EXTENSION}`,
        ],
      },
    );
    await use(context);
    await context.close();
  },

  extensionId: async ({ context }, use) => {
    let [worker] = context.serviceWorkers();
    worker ??= await context.waitForEvent('serviceworker');
    await use(new URL(worker.url()).host);
  },

  cdnRequests: async ({ context }, use) => {
    const requests: string[] = [];
    await context.route('https://scontent.test.fbcdn.net/**', (route) => {
      requests.push(route.request().url());
      return route.fulfill({
        contentType: 'image/png',
        body: PNG,
        headers: { 'access-control-allow-origin': 'https://www.facebook.com' },
      });
    });
    await use(requests);
  },

  openFacebook: async ({ context, cdnRequests }, use) => {
    void cdnRequests; // ensure the CDN route is registered
    await context.route('https://www.facebook.com/profile', (route) =>
      route.fulfill({ contentType: 'text/html', body: '<body>profile</body>' }),
    );
    await use(async (body) => {
      await context.route('https://www.facebook.com/page', (route) =>
        route.fulfill({
          contentType: 'text/html',
          body: `<body style="margin:0">${body}</body>`,
        }),
      );
      for (const page of context.pages()) await page.close();
      const page = await context.newPage();
      await page.goto('https://www.facebook.com/page');
      return page;
    });
  },

  popupPage: async ({ context, extensionId }, use) => {
    await use(async () => {
      const popup = await context.newPage();
      await popup.goto(`chrome-extension://${extensionId}/popup.html`);
      return popup;
    });
  },

  startPicking: async ({ popupPage: _ }, use) => {
    await use(async (popup) => {
      // The popup is itself a tab here, so message the other tab.
      await popup.evaluate(async () => {
        type Tab = { id?: number };
        const { chrome } = globalThis as unknown as {
          chrome: {
            tabs: {
              getCurrent(): Promise<Tab | undefined>;
              query(filter: object): Promise<Tab[]>;
              sendMessage(id: number, message: object): Promise<unknown>;
            };
          };
        };
        const me = await chrome.tabs.getCurrent();
        const tabs = await chrome.tabs.query({});
        const target = tabs.find((tab) => tab.id !== me?.id);
        if (target?.id === undefined) throw new Error('No page tab');
        await chrome.tabs.sendMessage(target.id, { kind: 'start-picking' });
      });
    });
  },
});

export const expect = test.expect;

/** Reads text/display of an element inside the extension's shadow-root overlay. */
export function overlay(page: Page, selector: string) {
  return page.evaluate((sel) => {
    const root = [...document.documentElement.children]
      .map((element) => element.shadowRoot)
      .filter(Boolean)
      .at(-1);
    const element = root?.querySelector<HTMLElement>(sel);
    return element
      ? { text: element.innerText, display: getComputedStyle(element).display }
      : null;
  }, selector);
}

export function clickPromptButton(page: Page, label: string) {
  return page.evaluate((text) => {
    const root = [...document.documentElement.children]
      .map((element) => element.shadowRoot)
      .filter(Boolean)
      .at(-1);
    const buttons = [...(root?.querySelectorAll('.prompt button') ?? [])];
    (buttons.find((b) => b.textContent === text) as HTMLElement).click();
  }, label);
}
