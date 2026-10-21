import { MousePointerClick } from 'lucide-react';
import { useEffect, useState } from 'react';
import logo from '@/assets/branding/icon.svg';
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
import { isContentScriptReady, startPicking } from '@/messaging/active-tab';

type Page = 'checking' | 'ready' | 'unavailable';

const STEPS = [
  'Click Pick picture.',
  'Click a profile picture on the page.',
  'It saves automatically. Esc cancels.',
];

export default function App() {
  const [page, setPage] = useState<Page>('checking');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void isContentScriptReady().then((ready) =>
      setPage(ready ? 'ready' : 'unavailable'),
    );
  }, []);

  async function onPick() {
    setBusy(true);
    setError(null);
    const result = await startPicking();
    if (result.ok) window.close();
    else {
      setError(result.error);
      setBusy(false);
    }
  }

  return (
    <TooltipProvider>
      <main className="flex flex-col gap-3 p-3">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src={logo} alt="" className="size-6" />
            <h1 className="text-base font-semibold">PP Downloader</h1>
          </div>
          <ThemeToggle />
        </header>
        <Card>
          <CardHeader>
            <CardTitle>Profile picture</CardTitle>
            <CardDescription>
              {page === 'unavailable'
                ? 'Open a Facebook page to use this. If Facebook is already open, reload that tab.'
                : 'Save a profile picture in the highest resolution available.'}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <Button
              className="w-full"
              disabled={page !== 'ready' || busy}
              onClick={onPick}
            >
              <MousePointerClick /> {busy ? 'Starting…' : 'Pick picture'}
            </Button>
            {error && (
              <p role="alert" className="text-sm text-destructive">
                {error}
              </p>
            )}
            {page === 'ready' && (
              <ol className="list-decimal space-y-1 pl-5 text-sm text-muted-foreground">
                {STEPS.map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ol>
            )}
          </CardContent>
        </Card>
      </main>
    </TooltipProvider>
  );
}
