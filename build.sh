#!/bin/bash
cd /home/claude/moxie
cat head.html src/*.js tail.html > game.html
for f in src/*.js; do node --check "$f" || echo "SYNTAX ERR in $f"; done
wc -c game.html
