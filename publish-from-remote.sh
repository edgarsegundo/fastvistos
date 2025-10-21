# !/bin/bash

## Run these commands locally to generate blog content and download images
node generate-blog-content.js fastvistos
npm run download-images:fastvistos
pu

## now I need to run the following sripts on the VPS from my local machine
ssh edgar@72.60.57.150 'cd /home/edgar/Repos/fastvistos && npm run build:fastvistos'
#!/bin/bash