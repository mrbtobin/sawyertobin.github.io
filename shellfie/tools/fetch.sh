#!/usr/bin/env bash
# Fetch Project Gutenberg plain texts from the GITenberg mirror on GitHub into tools/.cache/<id>.txt
set -u
cd "$(dirname "$0")"; mkdir -p .cache
while read -r repo; do
  [ -z "$repo" ] && continue; id="${repo##*_}"; out=".cache/$id.txt"
  [ -s "$out" ] && continue
  for f in "$id-0.txt" "$id.txt" "$id-8.txt"; do
    if curl -sfL --max-time 60 "https://raw.githubusercontent.com/GITenberg/$repo/master/$f" -o "$out.tmp" && [ -s "$out.tmp" ]; then
      if [ "$f" = "$id-8.txt" ]; then iconv -f latin1 -t utf-8 "$out.tmp" > "$out"; rm -f "$out.tmp"; else mv "$out.tmp" "$out"; fi
      echo "ok $id $f"; break
    fi
  done
  [ -s "$out" ] || echo "MISSING $repo"
done < sources.txt
