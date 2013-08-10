#!/usr/bin/env bash

# we're assuming that everyone is basically in Australia.
sed 's|http://us.archive.ubuntu.com/ubuntu/|http://mirror.aarnet.edu.au/pub/ubuntu/archive/|' < /etc/apt/sources.list > /etc/apt/sources.list.new
mv /etc/apt/sources.list.new /etc/apt/sources.list

apt-get update &&
apt-get install -y mongodb &&
apt-get install -y inkscape &&
apt-get install -y python-pip python-dev fabric


cd /vagrant
sudo fab setup:dev=True &&
cd example-data &&
tar -xzf dump.tar.gz &&
mongorestore dump &&
rm -rf dump &&
cd ..
echo ""
echo "Setup is mostly done."
echo "Follow the instructions in backend/settings.py.example, save it as backend/settings.py."
echo "Run 'vagrant ssh' then 'cd /vagrant/backend; python finvis.py'."
echo "Then visit localhost:8080 in a browser."
