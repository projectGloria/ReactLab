const { app, BrowserWindow } = require('electron');
const fs = require('node:fs');
const path = require('node:path');

// Render the app's atom mark at each Windows icon size using Chromium.
app.whenReady().then(async () => {
  const win = new BrowserWindow({ show: false, webPreferences: { sandbox: true } });
  try {
    await win.loadURL('about:blank');
    const sizes = [16, 32, 48, 64, 128, 256];
    const svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256"><rect width="256" height="256" rx="52" fill="#141413"/><g transform="translate(128 128)" fill="none" stroke="#61dafb" stroke-width="9"><ellipse rx="94" ry="36"/><ellipse rx="94" ry="36" transform="rotate(60)"/><ellipse rx="94" ry="36" transform="rotate(120)"/></g><circle cx="128" cy="128" r="14" fill="#61dafb"/></svg>';
    const pngs = await win.webContents.executeJavaScript(`(async () => {
      const img = new Image();
      img.src = ${JSON.stringify(`data:image/svg+xml,${encodeURIComponent(svg)}`)};
      await img.decode();
      return ${JSON.stringify(sizes)}.map(size => {
        const canvas = document.createElement('canvas');
        canvas.width = canvas.height = size;
        canvas.getContext('2d').drawImage(img, 0, 0, size, size);
        return canvas.toDataURL('image/png').split(',')[1];
      });
    })()`);
    const images = pngs.map(data => Buffer.from(data, 'base64'));
    const header = Buffer.alloc(6 + 16 * sizes.length);
    header.writeUInt16LE(1, 2);
    header.writeUInt16LE(sizes.length, 4);
    let offset = header.length;
    images.forEach((data, i) => {
      const entry = 6 + i * 16;
      header[entry] = header[entry + 1] = sizes[i] % 256;
      header.writeUInt16LE(1, entry + 4);
      header.writeUInt16LE(32, entry + 6);
      header.writeUInt32LE(data.length, entry + 8);
      header.writeUInt32LE(offset, entry + 12);
      offset += data.length;
    });
    const output = path.join(__dirname, '..', 'build', 'icon.ico');
    fs.mkdirSync(path.dirname(output), { recursive: true });
    fs.writeFileSync(output, Buffer.concat([header, ...images]));
    console.log(`Generated ${output}`);
  } catch (error) {
    console.error(error);
    process.exitCode = 1;
  } finally {
    win.destroy();
    app.exit(process.exitCode || 0);
  }
});
