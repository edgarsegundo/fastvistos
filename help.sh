#!/bin/bash

while true; do
  echo "==== Main Menu ===="
  echo "1) Publish msitesapp"
  echo "2) Run test-findUnique.js"
  echo "q) Quit"
  read -p "Choose an option: " opt

  case $opt in
    1)
      echo "Publishing msitesapp..."
      git pull
      npm run build:msitesapp
      pm2 restart msitesapp
      pm2 save
      npx prisma generate
      pm2 logs msitesapp
      ;;
    2)
      echo "Running tests..."
      node ./multi-sites/core/lib/test-findUnique.js
      ;;
    q)
      echo "Goodbye!"
      exit 0
      ;;
    *)
      echo "Invalid option."
      ;;
  esac
done