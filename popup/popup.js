const DEFAULTS = { enabled: true, logo: true, text: true, colors: true, font: true };
const boxes = document.querySelectorAll('input[data-key]');
const features = document.getElementById('features');

chrome.storage.local.get(DEFAULTS, (settings) => {
  for (const box of boxes) box.checked = settings[box.dataset.key];
  features.classList.toggle('disabled', !settings.enabled);
});

for (const box of boxes) {
  box.addEventListener('change', () => {
    chrome.storage.local.set({ [box.dataset.key]: box.checked });
    if (box.dataset.key === 'enabled') features.classList.toggle('disabled', !box.checked);
  });
}
