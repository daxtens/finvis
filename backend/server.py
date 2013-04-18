import bottle
from beaker.middleware import SessionMiddleware
from cork import Cork
from cork.backends import MongoDBBackend
import logging
import auth_settings
import os
import auth
import downloader
from mongo import *

rootdir = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')

logging.basicConfig(format='localhost - - [%(asctime)s] %(message)s', level=logging.DEBUG)
log = logging.getLogger(__name__)

aaa = Cork(backend=MongoDBBackend(db_name='finvis-auth'),
           email_sender='vis@dja.id.au',
           smtp_url=auth_settings.smtp_url)

app = bottle.app()
session_opts = {
    'session.type': 'cookie',
    'session.validate_key': True,
    'session.cookie_expires': True,
    'session.timeout': 3600 * 24,  # 1 day
    'session.encrypt_key': auth_settings.session_encrypt_key
}
app = SessionMiddleware(app, session_opts)


@bottle.route('/')
def redir():
    bottle.redirect('index.html')

@bottle.route('/vis.html')
@bottle.view('vis')
def vis():
    if aaa.user_is_anonymous:
        username = None
    else:
        username = aaa.current_user
    
    public_entities = Entity.objects(public=True).only("name")

    if username:
        user_entities = Entity.objects(username=username, public=False).only('name')
    else:
        user_entities = []

    result = {'username': username,
              'public_entities': public_entities,
              'user_entities': user_entities
              }
    print(result)
    return result

# Static files
@bottle.route('/<filename:path>')
def static(filename):
    # todo move static assets to static.finvis or somesuch
    # served directly out of nginx for speed
    return bottle.static_file(filename, root=rootdir)


# #  Web application main  # #

def main():

    # Start the Bottle webapp
    bottle.debug(True)
    bottle.run(app=app, quiet=False, reloader=True)

if __name__ == "__main__":
    main()
