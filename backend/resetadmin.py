#!/usr/bin/env python

import bottle
from beaker.middleware import SessionMiddleware
from cork import Cork
from cork.backends import MongoDBBackend
import logging

def populate_mongodb_backend():
    # admin/admin
    mb = MongoDBBackend(db_name='finvis-auth', initialize=True)
    mb.users._coll.insert({
        "login": "admin",
        "email_addr": "admin@localhost.local",
        "desc": "admin test user",
        "role": "admin",
        "hash": "cLzRnzbEwehP6ZzTREh3A4MXJyNo+TV8Hs4//EEbPbiDoo+dmNg22f2RJC282aSwgyWv/O6s3h42qrA6iHx8yfw=",
        "creation_date": "2012-10-28 20:50:26.286723"
    })
    mb.roles._coll.insert({'role': 'admin', 'val': 100})
    mb.roles._coll.insert({'role': 'user', 'val': 50})
    return mb

mb = populate_mongodb_backend()
