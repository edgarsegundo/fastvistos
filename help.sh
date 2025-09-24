#!/bin/bash

while true; do
  echo "==== Main Menu ===="
  echo "1) Publish msitesapp"
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
    q)
      echo "Goodbye!"
      exit 0
      ;;
    *)
      echo "Invalid option."
      ;;
  esac
done