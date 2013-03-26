import bottle
from beaker.middleware import SessionMiddleware
from cork import Cork
from cork.backends import MongoDBBackend
import logging
import auth_settings
import os
import auth
import downloader

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
