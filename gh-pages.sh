#!/bin/bash

set -e

git checkout gh-pages
git pull origin gh-pages
npm run build
npm run build-example
cp dist/*.* .
git add styles.css index.html index.js
git commit -m 'Update gh-pages'
git push origin gh-pages
git checkout master