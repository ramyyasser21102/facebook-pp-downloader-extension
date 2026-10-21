import { Download } from 'lucide-react';
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

export default function App() {
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
              Open a Facebook profile to get started.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" disabled>
              <Download /> Download
            </Button>
          </CardContent>
        </Card>
      </main>
    </TooltipProvider>
  );
}
