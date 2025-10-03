# Usage: ./help.sh dbshell
# Opens a MySQL shell in the running 'mysql' container using credentials from .env

if [ "$1" = "dbshell" ]; then
  # Load env vars from .env
  export $(grep '^DB_USER=' .env | xargs)
  export $(grep '^DB_PASSWORD=' .env | xargs)
  export $(grep '^DB_NAME=' .env | xargs)

  # Remove quotes if present
  DB_USER=$(echo $DB_USER | tr -d '"')
  DB_PASSWORD=$(echo $DB_PASSWORD | tr -d '"')
  DB_NAME=$(echo $DB_NAME | tr -d '"')

  # Enter MySQL shell inside the container
  docker exec -it mysql bash -c "mysql -u$DB_USER -p$DB_PASSWORD $DB_NAME"
  exit $?
fi
#!/bin/bash

while true; do
  echo "==== Main Menu ===="
  echo "1) Publish msitesapp"
  echo "2) Run test-findUnique.js"
  echo "3) Git commit and push"
  echo "4) Enter MySQL shell (dbshell)"
  echo "5) View msitesapp logs"
  echo "6) Clear msitesapp logs"
  echo "q) Quit"
  read -p "Choose an option: " opt

  case $opt in
    1)
      echo "Publishing msitesapp..."
      git pull
      npm install
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
    3)
      git add .
      git commit -m "Auto-commit"
      git push
      ;;
    4)
      # Enter MySQL shell using env vars from .env
      export $(grep '^DB_USER=' .env | xargs)
      export $(grep '^DB_PASSWORD=' .env | xargs)
      export $(grep '^DB_NAME=' .env | xargs)
      DB_USER=$(echo $DB_USER | tr -d '"')
      DB_PASSWORD=$(echo $DB_PASSWORD | tr -d '"')
      DB_NAME=$(echo $DB_NAME | tr -d '"')
      docker exec -it mysql bash -c "mysql -u$DB_USER -p$DB_PASSWORD $DB_NAME"
      ;;
    5)
      pm2 logs msitesapp
      ;;
    6)
      pm2 flush msitesapp
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