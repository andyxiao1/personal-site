const layer = document.getElementById('potato-layer');
const variants = [];
const seenVariants = new Set();

function pickDifferent(pool, current) {
  const choices = pool.filter((item) => item !== current);
  const options = choices.length ? choices : pool;
  return options[Math.floor(Math.random() * options.length)];
}

function shuffled(items) {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function setStickerImage(button, image) {
  button.dataset.image = image;
  button.querySelector('img').src = image;
}

function initSticker(button, image, pool) {
  button.querySelector('img').alt = 'Potato, Andy’s French bulldog';
  button.setAttribute('aria-label', 'Show another photo of Potato');
  setStickerImage(button, image);
  button.addEventListener('click', () => {
    const next = pickDifferent(pool, button.dataset.image);
    button.classList.remove('is-changing');
    // Restart the small animation without changing the sticker's placement.
    void button.offsetWidth;
    button.classList.add('is-changing');
    setStickerImage(button, next);
  });
}

function render() {
  layer.replaceChildren();
  if (!variants.length) {
    layer.hidden = true;
    return;
  }

  layer.hidden = false;
  const desiredCount = 3 + Math.floor(Math.random() * 2);
  const count = Math.min(desiredCount, variants.length);
  const choices = shuffled(variants).slice(0, count);
  choices.forEach((image) => {
    const button = document.createElement('button');
    button.className = 'potato-sticker';
    button.type = 'button';
    button.style.setProperty('--sticker-rotation', `${Math.round(Math.random() * 22 - 11)}deg`);
    const variation = 0.9 + Math.random() * 0.22;
    button.style.setProperty('--sticker-scale', variation.toFixed(2));
    const img = document.createElement('img');
    img.decoding = 'async';
    img.loading = 'lazy';
    button.append(img);
    initSticker(button, image, variants);
    layer.append(button);
  });
}

async function loadPotatoImages() {
  try {
    const response = await fetch('./potatoes/manifest.json', { cache: 'no-cache' });
    if (!response.ok) return;
    const manifest = await response.json();
    const files = Array.isArray(manifest) ? manifest : manifest.images;
    if (!Array.isArray(files)) return;
    for (const file of files) {
      if (
        typeof file !== 'string' ||
        !/^.+\.webp$/i.test(file) ||
        file.includes('/') ||
        file.includes('\\')
      ) {
        continue;
      }
      const url = `./potatoes/${encodeURIComponent(file)}`;
      if (seenVariants.has(url)) continue;
      seenVariants.add(url);
      variants.push(url);
    }
    render();
  } catch {
    // Missing manifest or offline fetch leaves the original page untouched.
  }
}

loadPotatoImages();
