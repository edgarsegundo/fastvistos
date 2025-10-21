# !/bin/bash

# ## Run these commands locally to generate blog content and download images
# node generate-blog-content.js fastvistos
# npm run download-images:fastvistos
# ~/Repos/pu.sh

## now I need to run the following sripts on the VPS from my local machine
ssh edgar@72.60.57.150 'export PATH=$PATH:/home/edgar/.nvm/versions/node/v22.0.0/bin && cd /home/edgar/Repos/fastvistos && npm run build:fastvistos'


