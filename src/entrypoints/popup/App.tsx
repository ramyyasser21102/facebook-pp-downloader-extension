import { MousePointerClick } from 'lucide-react';
import { useState } from 'react';
import { ThemeToggle } from '@/components/theme-toggle';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { TooltipProvider } from '@/components/ui/tooltip';
import type { ContentRequest, ContentResponse } from '@/messaging';

type Status =
  | { kind: 'idle' }
  | { kind: 'busy' }
  | { kind: 'error'; text: string };

async function requestPicking(): Promise<ContentResponse> {
  const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
  if (tab?.id === undefined) return { ok: false, error: 'No active tab.' };
  const request: ContentRequest = { kind: 'start-picking' };
  try {
    return (await browser.tabs.sendMessage(tab.id, request)) as ContentResponse;
  } catch {
    return { ok: false, error: 'Open a Facebook profile page first.' };
  }
}

export default function App() {
  const [status, setStatus] = useState<Status>({ kind: 'idle' });

  async function onPick() {
    setStatus({ kind: 'busy' });
    const result = await requestPicking();
    setStatus(
      result.ok ? { kind: 'idle' } : { kind: 'error', text: result.error },
    );
  }

  return (
    <TooltipProvider>
      <main className="flex flex-col gap-3 p-3">
        <header className="flex items-center justify-between">
          <h1 className="text-base font-semibold">PP Downloader</h1>
          <ThemeToggle />
        </header>
        <Card>
          <CardHeader>
            <CardTitle>Profile picture</CardTitle>
            <CardDescription>
              Click Pick, then click the picture on the Facebook page. Esc
              cancels.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            <Button
              className="w-full"
              disabled={status.kind === 'busy'}
              onClick={onPick}
            >
              <MousePointerClick />{' '}
              {status.kind === 'busy' ? 'Starting…' : 'Pick picture'}
            </Button>
            {status.kind === 'error' && (
              <p role="alert" className="text-sm text-destructive">
                {status.text}
              </p>
            )}
          </CardContent>
        </Card>
      </main>
    </TooltipProvider>
  );
}
