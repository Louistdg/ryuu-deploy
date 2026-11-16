#!/usr/bin/env bash
set -euo pipefail
ZIP_URL="https://2pepites.kimi.page/dl/ryuu-deploy.zip"
export DEST="$(cd "$(dirname "$0")" && pwd)/web"
mkdir -p "$DEST"
curl -L "$ZIP_URL" -o /tmp/ryuu-assets.zip
python3 - <<'PY'
import zipfile, os
z = zipfile.ZipFile('/tmp/ryuu-assets.zip')
keep = ('web/art/', 'web/avatar/', 'web/emotes/', 'web/video/', 'web/tuto/')
for name in z.namelist():
    if name.startswith(keep) and not name.endswith('/'):
        target = os.path.join(os.environ['DEST'], name)
        os.makedirs(os.path.dirname(target), exist_ok=True)
        with open(target, 'wb') as f:
            f.write(z.read(name))
print('Assets extraits dans', os.environ['DEST'])
PY
mkdir -p "$DEST/vendor"
curl -sL "https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js" -o "$DEST/vendor/html2canvas.min.js"
curl -sL "https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js" -o "$DEST/vendor/jszip.min.js"
