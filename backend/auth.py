import bottle
import os
from finvis import aaa


# #  Bottle methods  # #

def postd():
    return bottle.request.forms


def post_get(name, default=''):
    return bottle.request.POST.get(name, default).strip()


@bottle.post('/login')
@bottle.view('login_form')
def login():
    """Authenticate users"""
    username = post_get('username')
    password = post_get('password')
    aaa.login(username, password, success_redirect='/index.html')
    return {'error': 'Authentication failed.'}


@bottle.route('/user_is_anonymous')
def user_is_anonymous():
    if aaa.user_is_anonymous:
        return 'True'
    return 'False'


@bottle.route('/logout')
def logout():
    aaa.logout(success_redirect='/')


@bottle.get('/register')
@bottle.post('/register')
def register():
    """Registration Form and Email"""

    # if the registration fails, return the registration form with the
    # error and existing values
    username = ''
    email_address = ''
    error = None
    if bottle.request.method == "POST":
        try:
            aaa.register(post_get('username'),
                         post_get('password'),
                         post_get('email_address'))
            return bottle.template('views/registration_email_sent')
        except Exception as e:
            # store the form input
            error = e.message
            username = post_get('username')
            email_address = post_get('email_address')

    return bottle.template('registration_form.tpl',
                           {'username': username,
                            'email_address': email_address,
                            'error': error})


@bottle.route('/validate_registration/:registration_code')
def validate_registration(registration_code):
    """Validate registration, create user account"""
    aaa.validate_registration(registration_code)
    return 'Thanks. <a href="/login">Go to login</a>'


@bottle.get('/reset_password')
@bottle.post('/reset_password')
def password_reset():
    """Password reset form and email"""

    error = ''

    if bottle.request.method == "POST":
        try:
            aaa.send_password_reset_email(
                username=post_get('username'),
                email_addr=post_get('email_address'))
            return bottle.template('views/password_reset_email_sent')
        except Exception as e:
            error = e.message

    return bottle.template('views/password_reset_form', {'error': error})


@bottle.route('/change_password/:reset_code')
@bottle.view('password_change_form')
def change_password(reset_code):
    """Show password change form"""
    return dict(reset_code=reset_code)


@bottle.post('/change_password')
def change_password():
    """Change password"""
    aaa.reset_password(post_get('reset_code'), post_get('password'))
    return 'Thanks. <a href="/login">Go to login</a>'


@bottle.route('/my_role')
def show_current_user_role():
    """Show current user role"""
    session = bottle.request.environ.get('beaker.session')
    print "Session from simple_webapp", repr(session)
    aaa.require(fail_redirect='/login')
    return aaa.current_user.role


# Admin-only pages

@bottle.route('/superadmin')
@bottle.view('superadmin_page')
def admin():
    """Super-admin page; allows roles to be changed. Don't advertise.
    Misuse will totally break everything."""
    aaa.require(role='admin', fail_redirect='/sorry_page')
    return dict(
        current_user=aaa.current_user,
        users=aaa.list_users(),
        roles=aaa.list_roles()
    )


@bottle.route('/admin')
@bottle.view('admin_page')
def admin():
    """Regular, more user-friendly admin."""
    aaa.require(role='admin', fail_redirect='/sorry_page')
    return dict(
        current_user=aaa.current_user,
        users=aaa.list_users(),
        roles=aaa.list_roles()
    )


@bottle.post('/create_user')
def create_user():
    try:
        aaa.create_user(postd().username, 'user',
                        postd().password, postd().email)
        return dict(ok=True, msg='')
    except Exception, e:
        return dict(ok=False, msg=e.message)


@bottle.route('/delete_user/:username')
def delete_user(username):
    try:
        aaa.delete_user(username)
    except Exception as e:
        print repr(e)
        return dict(ok=False, msg=e.message)

    bottle.redirect('/admin')


@bottle.post('/create_role')
def create_role():
    try:
        aaa.create_role(post_get('role'), post_get('level'))
        return dict(ok=True, msg='')
    except Exception, e:
        return dict(ok=False, msg=e.message)


@bottle.post('/delete_role')
def delete_role():
    try:
        aaa.delete_role(post_get('role'))
        return dict(ok=True, msg='')
    except Exception, e:
        return dict(ok=False, msg=e.message)


@bottle.route('/toggle_role/:username')
def toggle_role(username):
    aaa.require(role='admin', fail_redirect='/sorry_page')
    user = aaa.user(username)
    role = user.role
    try:
        if role == 'user':
            user.update(role='admin')
        else:
            user.update(role='user')
    except Exception as e:
        return e.message

    bottle.redirect('/admin')


# Static pages
@bottle.route('/login')
@bottle.view('login_form')
def login_form():
    """Serve login form"""
    return {'error': ''}


@bottle.route('/sorry_page')
def sorry_page():
    """Serve sorry page"""
    return '<p>Sorry, you are not authorized to perform this action</p>'
