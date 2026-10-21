# Potato photos

This folder contains Potato's transparent WebP photos used by the site.

## Adding photos

Create an optimized WebP from each source PNG, keeping the original PNG outside this folder, then add the WebP filename to `manifest.json`:

```sh
cwebp -q 82 -alpha_q 100 -m 6 -resize 240 0 /path/to/potato-25.png -o potatoes/potato-25.webp
```

```json
{
  "images": [
    "potato-01.webp",
    "potato-02.webp",
    "potato-03.webp"
  ]
}
```

The site is static, so browser JavaScript can't reliably list files in a server folder. The manifest is the explicit photo list the sticker script reads; adding an image there makes it available for random selection.

Keep source PNGs cropped close to Potato and around 480 pixels on the long edge. The WebP versions used by the site are resized to 240 pixels wide and retain transparency.
