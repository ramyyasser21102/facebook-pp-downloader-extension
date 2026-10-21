import type { ContentRequest, ContentResponse } from './index';

async function send(request: ContentRequest): Promise<ContentResponse | null> {
  const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
  if (tab?.id === undefined) return null;
  try {
    return (await browser.tabs.sendMessage(tab.id, request)) as ContentResponse;
  } catch {
    // No content script answered: not a Facebook page, or the tab predates
    // the extension and needs a reload.
    return null;
  }
}

/** True when the active tab has our content script listening. */
export async function isContentScriptReady(): Promise<boolean> {
  return (await send({ kind: 'ping' }))?.ok === true;
}

export async function startPicking(): Promise<ContentResponse> {
  return (
    (await send({ kind: 'start-picking' })) ?? {
      ok: false,
      error: 'Could not reach the page. Reload the Facebook tab and try again.',
    }
  );
}
