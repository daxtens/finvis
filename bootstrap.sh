#!/usr/bin/env bash

# This next line should be uncommented
#apt-get update
apt-get install -y mongodb
apt-get install -y inkscape
apt-get install -y python-pip
apt-get install -y python-dev
pip install fabric

cd /vagrant
sudo fab setup:dev=True
