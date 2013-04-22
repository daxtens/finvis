import os
# web framework
import bottle
# AAA
from beaker.middleware import SessionMiddleware
from cork import Cork
from cork.backends import MongoDBBackend
import auth_settings
import auth
# Various bits of the app
from mongo import *
import downloader
import crud

rootdir = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')

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


@bottle.route('/index.html')
@bottle.view('vis')
def vis():
    if aaa.user_is_anonymous:
        username = None
    else:
        username = aaa.current_user.username

    public_entities = Entity.objects(public=True).only("name")

    if username:
        user_entities = Entity.objects(username=username,
                                       public=False).only('name')
    else:
        user_entities = []

    result = {'username': username,
              'public_entities': public_entities,
              'user_entities': user_entities
              }
    #print(result)
    return result


# Static files
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
    bottle.debug(True)
    bottle.run(app=app, quiet=False, reloader=True)

if __name__ == "__main__":
    main()
