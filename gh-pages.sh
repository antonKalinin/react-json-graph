#!/bin/bash

set -e

git checkout gh-pages
npm run build
npm run build-example
cp dist/*.* .
git add styles.css index.html bundle.js
git commit -m 'Update gh-pages'
git push origin gh-pages
git checkout master