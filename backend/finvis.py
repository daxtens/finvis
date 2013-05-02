import os
# web framework
import bottle
# AAA
from beaker.middleware import SessionMiddleware
from cork import Cork
from cork.backends import MongoDBBackend
import settings
import auth
# Various bits of the app
from mongo import *
import downloader
import crud

rootdir = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')

aaa = Cork(backend=MongoDBBackend(db_name='finvis-auth'),
           email_sender='vis@dja.id.au',
           smtp_url=settings.smtp_url)

app = bottle.app()
session_opts = {
    'session.type': 'cookie',
    'session.validate_key': True,
    'session.cookie_expires': True,
    'session.timeout': 3600 * 24,  # 1 day
    'session.encrypt_key': settings.session_encrypt_key
}
app = SessionMiddleware(app, session_opts)


@bottle.route('/')
def redir():
    bottle.redirect('index.html')


@bottle.route('/index.html')
@bottle.route('/index.html/:entity_id')
@bottle.view('vis')
def vis(entity_id=None):
    if aaa.user_is_anonymous:
        username = None
        admin = False
    else:
        username = aaa.current_user.username
        admin = (aaa.current_user.role == 'admin')

    public_entities = Entity.objects(public=True).only("name")

    if username:
        user_entities = Entity.objects(username=username,
                                       public=False).only('name')
    else:
        user_entities = []

    if entity_id is None:
        entity_id = settings.default_initial_id

    result = {'username': username,
              'admin': admin,
              'public_entities': public_entities,
              'user_entities': user_entities,
              'initial_id': entity_id
              }
    #print(result)
    return result


# Static files
@bottle.route('/static/<filename:path>')
@bottle.route('/js/<filename:path>')
@bottle.route('/css/<filename:path>')
def static(filename):
    # todo move static assets to static.finvis or somesuch
    # served directly out of nginx for speed
    return bottle.static_file(filename, root=rootdir)


@bottle.route('/images/<filename:path>')
def images(filename):
    return bottle.static_file(filename, root=os.path.join(rootdir, 'images'))


# #  Web application main  # #

def main():

    # Start the Bottle webapp
    #bottle.debug(True)
    bottle.run(app=app, server=bottle.CherryPyServer, reloader=True)

if __name__ == "__main__":
    main()
