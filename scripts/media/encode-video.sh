#!/usr/bin/env bash
# Re-encode the two foundation videos for the web (run once by a developer; outputs are committed).
#
#   scripts/media/encode-video.sh <hero-source.mp4> <film-master.mp4> [out-dir]
#
# hero-source : the library clip (Wix id 3f8517_7af606ad…, 886x646, 1.9 s; 480p is the best Wix has)
# film-master : the 3:22 film (Wix id 3f8517_aaa04b65…). Use the 1080p master:
#               https://video.wixstatic.com/video/3f8517_aaa04b6517db4ced8e6d40a2c849fcac/1080p/mp4/file.mp4
# out-dir     : default src/assets/video
#
# Outputs
#   hero-loop.mp4    seamless forward loop: the ~60 fps clip played at 30 fps (real-frame half speed, 3.75 s), its
#                    last 0.68 s cross-faded into its first 0.68 s → 3.07 s, light denoise, H.264, no audio, faststart
#                    (≈ 250–280 KB; the committed file, 246 KB, was cut the same way in the design phase)
#   hero-poster.webp first frame of the loop (the <video> poster; WebP via sharp, see below)
#   film-720p.mp4    H.264 High 1280x720 + AAC 80k stereo, two-pass to ~24 MB, faststart
#   film-poster.webp a subtitle-free frame of Niko on stage (FILM_POSTER_AT, default 86.5 s)
# WebP posters are written with sharp (Node, already installed for the build) because Homebrew ffmpeg has no libwebp.
# Requires ffmpeg >= 6 with libx264, libvpx-vp9 and the native aac encoder.
set -euo pipefail

HERO_SRC=${1:?hero source missing}
FILM_SRC=${2:?film master missing}
OUT=${3:-src/assets/video}
mkdir -p "$OUT"
TMP=$(mktemp -d)
trap 'rm -rf "$TMP"' EXIT

echo "== hero loop (forward, half speed, tail cross-faded into head)"
XF=0.6833   # cross-fade length in seconds (20.5 frames at 30 fps)
HALF=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$HERO_SRC" | awk '{printf "%.4f", $1 * 2}')
BODY=$(awk -v h="$HALF" -v x="$XF" 'BEGIN { printf "%.4f", h - x }')
OFFSET=$(awk -v b="$BODY" -v x="$XF" 'BEGIN { printf "%.4f", b - x }')
ffmpeg -hide_banner -loglevel error -y -i "$HERO_SRC" -an -filter_complex "\
  [0:v]setpts=2*PTS,fps=30,scale=trunc(iw/2)*2:trunc(ih/2)*2,hqdn3d=1.5:1.5:4:4,format=yuv420p,split=2[a][b];\
  [a]trim=start=$XF,setpts=PTS-STARTPTS[body];\
  [b]trim=end=$XF,setpts=PTS-STARTPTS[head];\
  [body][head]xfade=transition=fade:duration=$XF:offset=$OFFSET,format=yuv420p[v]" \
  -map "[v]" -c:v libx264 -preset veryslow -crf 30 -profile:v high -tune film \
  -movflags +faststart "$OUT/hero-loop.mp4"
ffmpeg -hide_banner -loglevel error -y -i "$OUT/hero-loop.mp4" -frames:v 1 "$TMP/hero-poster.png"

echo "== film (two-pass, 720p)"
# 202.6 s * (880k video + 80k audio) / 8 =~ 24.3 MB  (repo rule: no file over 25 MB)
VBR=880k
ffmpeg -hide_banner -loglevel error -y -i "$FILM_SRC" \
  -vf "scale=-2:720:flags=lanczos,format=yuv420p" \
  -c:v libx264 -preset slow -profile:v high -b:v "$VBR" -pass 1 -passlogfile "$TMP/x264" \
  -an -f mp4 /dev/null
ffmpeg -hide_banner -loglevel error -y -i "$FILM_SRC" \
  -vf "scale=-2:720:flags=lanczos,format=yuv420p" \
  -c:v libx264 -preset slow -profile:v high -b:v "$VBR" -maxrate 2000k -bufsize 4000k \
  -pass 2 -passlogfile "$TMP/x264" \
  -c:a aac -b:a 80k -ac 2 -movflags +faststart "$OUT/film-720p.mp4"

# Poster: Niko on stage, a frame without burned-in subtitles (owner review: no frame of family members or children).
ffmpeg -hide_banner -loglevel error -y -ss "${FILM_POSTER_AT:-86.5}" -i "$FILM_SRC" -frames:v 1 \
  -vf "scale=1280:-2:flags=lanczos" "$TMP/film-poster.png"

echo "== WebP posters (sharp)"
node --input-type=module -e "
  import sharp from 'sharp';
  const [tmp, out] = process.argv.slice(1);
  await sharp(tmp + '/hero-poster.png').webp({ quality: 46 }).toFile(out + '/hero-poster.webp');
  await sharp(tmp + '/film-poster.png').webp({ quality: 68 }).toFile(out + '/film-poster.webp');
" "$TMP" "$OUT"

ls -la "$OUT"
