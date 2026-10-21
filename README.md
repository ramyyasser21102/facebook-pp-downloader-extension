# PP Downloader

<p align="center">
  <img src="docs/assets/logo.png" alt="PP Downloader" width="112" />
</p>

<p align="center">
  Download Facebook profile pictures in the highest available resolution.
  <br />
  Built for Chrome and Firefox.
</p>

## Usage

1. Open Facebook and click the extension icon.
2. Select **Pick picture**.
3. Click a profile picture to save it. Press `Esc` to cancel.

<p align="center">
  <img src="docs/assets/screenshots/01-pick-picture.webp" alt="Extension popup" width="320" />
  &nbsp;&nbsp;
  <img src="docs/assets/screenshots/02-select-profile-picture.webp" alt="Selecting a profile picture" width="560" />
</p>

> **Note:** Feed and suggestion thumbnails may only be available in low resolution. Open the profile and select its full-size picture for the best result.

## Installation

### From source

```bash
pnpm install
pnpm dev
```

Load the extension from the generated `.output/chrome-mv3` directory using `chrome://extensions` with Developer mode enabled.

For Firefox:

```bash
pnpm dev:firefox
```

See the [installation guide](docs/installation.md) for production builds and manual installation.

## Development

| Command | Description |
| --- | --- |
| `pnpm compile` | Type-check |
| `pnpm lint` | Lint and format checks |
| `pnpm test` | Run unit tests |
| `pnpm build` | Build for Chrome |
| `pnpm build:firefox` | Build for Firefox |

See [Architecture](docs/architecture.md) and [Browser Compatibility](docs/browser-compatibility.md) for technical details.

**Tech stack:** WXT · React · TypeScript · Tailwind CSS · shadcn/ui · Vitest · Biome

## Disclaimer

PP Downloader is an independent project and is not affiliated with, endorsed by, or sponsored by Meta Platforms, Inc. Facebook is a trademark of Meta Platforms, Inc. Use the extension only with content you are authorized to access and in accordance with applicable terms.

## License

[MIT](LICENSE)
