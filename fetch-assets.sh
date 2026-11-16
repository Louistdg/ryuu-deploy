#!/usr/bin/env bash
set -euo pipefail
# Récupère les images/emotes/vidéo depuis l'archive publique validée
ZIP_URL="https://2pepites.kimi.page/dl/ryuu-deploy.zip"
DEST="$(cd "$(dirname "$0")" && pwd)/web-assets"
mkdir -p "$DEST"
curl -L "$ZIP_URL" -o /tmp/ryuu-assets.zip
python3 - <<'PY'
import zipfile, os
z = zipfile.ZipFile('/tmp/ryuu-assets.zip')
keep = ('web/art/', 'web/avatar/', 'web/emotes/', 'web/video/', 'web/tuto/Discord_Innovation_eurasia_ryuu.pdf', 'web/tuto/Tuto_Twitch_eurasia_ryuu.pdf')
for name in z.namelist():
    if name.startswith(keep) and not name.endswith('/'):
        target = os.path.join(os.environ['DEST'], name.replace('web/', '', 1))
        os.makedirs(os.path.dirname(target), exist_ok=True)
        with open(target, 'wb') as f:
            f.write(z.read(name))
print('Assets extraits dans', os.environ['DEST'])
PY
