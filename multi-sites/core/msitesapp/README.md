# app

## Install nvm

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/master/install.sh | bash
```

## Create nvmrc file

```bash
echo "22.0.0" > .nvmrc
```

## If you want to make it automatic every time you cd into the folder, you can add this to your ~/.bashrc or ~/.zshrc

```bash
cd() {
  builtin cd "$@" || return
  if [ -f .nvmrc ]; then
    nvm use --silent
  fi
}
```

## Install packages

```bash
npm install
```

## Install pm2 and start app

```bash
npm install -g pm2
pm2 -v

pm2 start ./multi-sites/core/msitesapp/server.js --name msitesapp
pm2 list
pm2 save    : This makes sure PM2 remembers your apps
```

## To restart apps on VPS reboot

```bash
pm2 startup

# It will print a command like:
sudo env PATH=$PATH:/home/youruser/.nvm/versions/node/v22.0.0/bin pm2 startup systemd -u youruser --hp /home/youruser
```

## Useful commands

```bash
pm2 restart msitesapp
pm2 stop msitesapp
pm2 delete msitesapp
pm2 logs msitesapp
```
