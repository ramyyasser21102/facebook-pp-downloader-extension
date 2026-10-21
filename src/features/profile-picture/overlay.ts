const STYLE = `
  :host { all: initial; }
  .box { position: fixed; pointer-events: none; display: none; z-index: 2147483647;
    outline: 3px solid #2563eb; background: rgba(37, 99, 235, .15); border-radius: 4px; }
  .glow { position: fixed; inset: 0; pointer-events: none; display: none; z-index: 2147483646;
    box-shadow: inset 0 0 40px 8px #187ff2, inset 0 0 120px 10px rgba(24, 127, 242, .45);
    animation: pulse 2s ease-in-out infinite; }
  @keyframes pulse { 50% { opacity: .6; } }
  @media (prefers-reduced-motion: reduce) { .glow { animation: none; } }
  .pill { position: fixed; left: 50%; transform: translateX(-50%); z-index: 2147483647;
    padding: 10px 16px; border-radius: 999px; font: 500 14px/1.2 system-ui, sans-serif;
    color: #f8faff; background: #0b1730; box-shadow: 0 6px 24px rgba(0,0,0,.35);
    pointer-events: none; display: none; }
  .hint { top: 16px; }
  .toast { bottom: 24px; }
  .toast.error { background: #b91c1c; }
  .prompt { bottom: 24px; display: none; max-width: min(92vw, 560px); border-radius: 16px;
    pointer-events: auto; text-align: center; }
  .prompt p { margin: 0 0 10px; }
  .prompt .actions { display: flex; gap: 8px; justify-content: center; }
  .prompt button { all: unset; cursor: pointer; padding: 8px 14px; border-radius: 999px;
    font: 600 13px/1 system-ui, sans-serif; background: #187ff2; color: #fff; }
  .prompt button.secondary { background: rgba(248, 250, 255, .16); }
  .prompt button:focus-visible { outline: 2px solid #f8faff; outline-offset: 2px; }
`;

export type PromptAction = {
  label: string;
  secondary?: boolean;
  onClick: () => void;
};

export type ToastKind = 'success' | 'error';

/**
 * Page-level UI for pick mode, rendered in a shadow root so Facebook's CSS
 * cannot affect it. Colors are fixed (not theme tokens) because it sits on
 * top of a page we do not control.
 */
export function createOverlay() {
  const host = document.createElement('div');
  const root = host.attachShadow({ mode: 'open' });
  root.innerHTML = `<style>${STYLE}</style>
    <div class="glow"></div>
    <div class="box"></div>
    <div class="pill hint" role="status"></div>
    <div class="pill toast" role="status" aria-live="polite"></div>
    <div class="pill prompt" role="alertdialog" aria-label="Low resolution"><p></p><div class="actions"></div></div>`;
  document.documentElement.appendChild(host);

  const glow = root.querySelector<HTMLElement>('.glow');
  const box = root.querySelector<HTMLElement>('.box');
  const hint = root.querySelector<HTMLElement>('.hint');
  const toast = root.querySelector<HTMLElement>('.toast');
  const prompt = root.querySelector<HTMLElement>('.prompt');
  const promptText = root.querySelector<HTMLElement>('.prompt p');
  const promptActions = root.querySelector<HTMLElement>('.prompt .actions');
  if (
    !glow ||
    !box ||
    !hint ||
    !toast ||
    !prompt ||
    !promptText ||
    !promptActions
  )
    throw new Error('Overlay failed to render');
  let toastTimer: number | undefined;
  let promptTimer: number | undefined;

  return {
    highlight(rect: DOMRect | null) {
      if (!rect) {
        box.style.display = 'none';
        return;
      }
      Object.assign(box.style, {
        display: 'block',
        left: `${rect.left}px`,
        top: `${rect.top}px`,
        width: `${rect.width}px`,
        height: `${rect.height}px`,
      });
    },
    showHint(text: string) {
      hint.textContent = text;
      hint.style.display = 'block';
      glow.style.display = 'block';
    },
    hideHint() {
      hint.style.display = 'none';
      glow.style.display = 'none';
      box.style.display = 'none';
    },
    showToast(text: string, kind: ToastKind, ms = 3500) {
      window.clearTimeout(toastTimer);
      toast.textContent = text;
      toast.className = `pill toast ${kind}`;
      toast.style.display = 'block';
      toastTimer = window.setTimeout(() => {
        toast.style.display = 'none';
      }, ms);
    },
    /** A message with buttons; stays until an action is chosen or `ms` passes. */
    showPrompt(text: string, actions: PromptAction[], ms = 12000) {
      window.clearTimeout(promptTimer);
      promptText.textContent = text;
      promptActions.replaceChildren(
        ...actions.map(({ label, secondary, onClick }) => {
          const button = document.createElement('button');
          button.textContent = label;
          if (secondary) button.className = 'secondary';
          button.addEventListener('click', () => {
            prompt.style.display = 'none';
            onClick();
          });
          return button;
        }),
      );
      prompt.style.display = 'block';
      promptTimer = window.setTimeout(() => {
        prompt.style.display = 'none';
      }, ms);
    },
    dispose() {
      window.clearTimeout(promptTimer);
      window.clearTimeout(toastTimer);
      host.remove();
    },
  };
}

export type Overlay = ReturnType<typeof createOverlay>;
