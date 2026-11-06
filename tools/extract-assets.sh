#!/usr/bin/env bash
# ------------------------------------------------------------------
# Réexporte les visuels du site à partir du dépôt du jeu.
#
#   ./tools/extract-assets.sh [chemin/vers/A-Single-Piece]
#
# Dépend de ffmpeg (brew install ffmpeg).
# ------------------------------------------------------------------
set -euo pipefail

GAME="${1:-$HOME/Documents/Perso/A-Single-Piece}"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
OUT="$ROOT/assets/img"
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

[ -d "$GAME" ] || { echo "Dépôt du jeu introuvable : $GAME" >&2; exit 1; }

IMG="$GAME/Game/assets/img"
PROFIL="$GAME/devlog/divers/profil"
mkdir -p "$OUT/brand" "$OUT/scene"

# --- Les couches du décor ------------------------------------------
# Le Maître du Temps : la première pose de son atlas d'animation.
ffmpeg -v error -i "$IMG/character/time_master.png" -vf "crop=144:216:0:0" -y "$OUT/scene/master.png"

# Puis on sépare les iris du corps, pour que le regard puisse suivre le
# curseur. L'orbite sombre reste sur le corps : sinon l'iris laisse un trou
# en glissant. Demande Pillow (pip install Pillow).
python3 - "$OUT/scene" <<'EOF'
import sys
from PIL import Image

OUT = sys.argv[1]
SOCKET = (91, 25, 64)
IRIS = {(255, 70, 170), (255, 222, 248)}

src = Image.open(OUT + "/master.png").convert("RGBA")
body = src.copy()
eyes = Image.new("RGBA", src.size, (0, 0, 0, 0))
sp, bp, ep = src.load(), body.load(), eyes.load()

for y in range(src.size[1]):
    for x in range(src.size[0]):
        r, g, b, a = sp[x, y]
        if a > 0 and (r, g, b) in IRIS:
            ep[x, y] = (r, g, b, a)
            bp[x, y] = SOCKET + (255,)

body.save(OUT + "/master-body.png")
eyes.save(OUT + "/master-eyes.png")
EOF


# Nuages et monde lointain : doublés en miroir, pour que la répétition
# horizontale ne laisse pas de couture quand ils défilent.
ffmpeg -v error -i "$IMG/fx/storm_clouds.png" -filter_complex "[0]split[a][b];[b]hflip[f];[a][f]hstack" -y "$OUT/scene/clouds.png"
ffmpeg -v error -i "$IMG/fx/far_world.png"    -filter_complex "[0]split[a][b];[b]hflip[f];[a][f]hstack" -y "$OUT/scene/far-world.png"

# --- Logo et icônes ------------------------------------------------
cp "$PROFIL/logo-horizontal.png" "$OUT/brand/logo-wordmark.png"
ffmpeg -v error -i "$PROFIL/logo-carre.png" -vf "scale=64:64:flags=neighbor"   -y "$OUT/brand/favicon-64.png"
ffmpeg -v error -i "$PROFIL/logo-carre.png" -vf "scale=180:180:flags=neighbor" -y "$OUT/brand/apple-touch-icon.png"

# --- La tour, et l'image de partage, depuis la cinématique d'intro --
# Le plan est letterboxé dans la vidéo (1920x844 à y=118). On en garde la
# moitié basse (y=380) : la plate-forme et le cadran, sans le Maître, qui
# est une couche à part.
MENU="$GAME/devlog/divers/menu-intro/timelord-menu-intro-gameplay-16x9.mp4"
if [ -f "$MENU" ]; then
  ffmpeg -v error -ss 38 -i "$MENU" -frames:v 1 \
    -vf "crop=1920:844:0:118,crop=1920:464:0:380,eq=brightness=0.04:saturation=1.15" \
    -c:v libwebp -quality 92 -y "$OUT/scene/tower.webp"

  ffmpeg -v error -ss 38 -i "$MENU" -frames:v 1 \
    -vf "crop=1920:844:0:118,eq=brightness=0.05:saturation=1.18,scale=1200:528:flags=lanczos,pad=1200:630:0:51:0x0d0712" \
    -q:v 3 -y "$OUT/brand/og-image.jpg"
fi

echo "Visuels réexportés dans $OUT"
