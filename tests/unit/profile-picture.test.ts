import { describe, expect, it } from 'vitest';
import { fetchBestImage } from '@/features/profile-picture/download';
import {
  pickImage,
  profilePhotoUrl,
} from '@/features/profile-picture/find-image';
import {
  fileNameFromUrl,
  isFacebookCdnUrl,
  upgradeProfilePictureUrl,
} from '@/features/profile-picture/url';

const SAMPLE =
  'https://scontent.fcai20-3.fna.fbcdn.net/v/t39.30808-1/752497649_4312578262337617_n.jpg?stp=dst-jpg_tt6&cstp=mx960x960&ctp=s200x200&oh=abc&oe=123';

describe('upgradeProfilePictureUrl', () => {
  it('sets ctp to the cstp maximum and keeps other params', () => {
    const url = new URL(upgradeProfilePictureUrl(SAMPLE) ?? '');
    expect(url.searchParams.get('ctp')).toBe('s960x960');
    expect(url.searchParams.get('cstp')).toBe('mx960x960');
    expect(url.searchParams.get('oh')).toBe('abc');
  });

  it('adds ctp when it is missing', () => {
    const noCtp = SAMPLE.replace('&ctp=s200x200', '');
    expect(upgradeProfilePictureUrl(noCtp)).toContain('ctp=s960x960');
  });

  it('returns null without a usable cstp or for invalid URLs', () => {
    expect(
      upgradeProfilePictureUrl(SAMPLE.replace('mx960x960', 'bad')),
    ).toBeNull();
    expect(upgradeProfilePictureUrl('not a url')).toBeNull();
  });
});

describe('helpers', () => {
  it('accepts only https fbcdn hosts', () => {
    expect(isFacebookCdnUrl(SAMPLE)).toBe(true);
    expect(isFacebookCdnUrl('http://scontent.x.fbcdn.net/a.jpg')).toBe(false);
    expect(isFacebookCdnUrl('https://evil.example/fbcdn.net/a.jpg')).toBe(
      false,
    );
  });

  it('derives a file name', () => {
    expect(fileNameFromUrl(SAMPLE)).toBe('752497649_4312578262337617_n.jpg');
    expect(fileNameFromUrl('https://a.fbcdn.net/v/x')).toBe(
      'profile-picture.jpg',
    );
  });
});

describe('fetchBestImage', () => {
  const ok = () => Promise.resolve(new Response(new Blob(['x'])));
  const refused = () => Promise.resolve(new Response(null, { status: 403 }));

  it('uses the upgraded URL when it succeeds', async () => {
    const urls: string[] = [];
    const result = await fetchBestImage(SAMPLE, (u) => {
      urls.push(u);
      return ok();
    });
    expect(urls).toHaveLength(1);
    expect(result?.url).toContain('ctp=s960x960');
  });

  it('falls back to the displayed URL when refused', async () => {
    const result = await fetchBestImage(SAMPLE, (u) =>
      u.includes('ctp=s960x960') ? refused() : ok(),
    );
    expect(result?.url).toBe(SAMPLE);
  });

  it('returns null when everything fails', async () => {
    expect(await fetchBestImage(SAMPLE, refused)).toBeNull();
  });
});

describe('profilePhotoUrl / pickImage', () => {
  const thumb =
    'https://scontent.fcai20-3.fna.fbcdn.net/v/t39.30808-1/111_n.jpg?cstp=mx960x960&ctp=s60x60';

  it('reads img src and SVG image xlink:href', () => {
    document.body.innerHTML = `
      <img id="a" src="${SAMPLE}">
      <svg><image id="b" xlink:href="${thumb}"></image></svg>`;
    expect(profilePhotoUrl(document.getElementById('a') as Element)).toBe(
      SAMPLE,
    );
    expect(profilePhotoUrl(document.getElementById('b') as Element)).toBe(
      thumb,
    );
  });

  it('rejects other elements, hosts and CDN paths', () => {
    document.body.innerHTML = `
      <div id="d"></div>
      <img id="e" src="https://example.com/t39.30808-1/a.jpg">
      <img id="f" src="https://static.xx.fbcdn.net/rsrc/logo.png">`;
    for (const id of ['d', 'e', 'f']) {
      expect(
        profilePhotoUrl(document.getElementById(id) as Element),
      ).toBeNull();
    }
  });

  it('returns the topmost profile photo in the stack under the pointer', () => {
    document.body.innerHTML = `
      <div id="overlay"></div>
      <svg><image id="top" xlink:href="${SAMPLE}"></image></svg>
      <svg><image id="below" xlink:href="${thumb}"></image></svg>`;
    const el = (id: string) => document.getElementById(id) as Element;
    const hit = pickImage([el('overlay'), el('top'), el('below')]);
    expect(hit?.element.id).toBe('top');
    expect(hit?.url).toBe(SAMPLE);
    expect(pickImage([el('overlay')])).toBeNull();
  });
});
