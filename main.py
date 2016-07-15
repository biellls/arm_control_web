from bottle import app, route, post, request, run, abort, template, static_file, url, auth_basic
import sqlite3

@route('/static/:path#.+#', name='static')
def static(path):
    return static_file(path, root='static')

def check_login(user, passw):
    conn = sqlite3.connect('arm_control_web.db')
    c = conn.cursor()
    c.execute("SELECT pass FROM users WHERE username = '{}'".format(user))
    x = c.fetchone()
    return x is not None and x[0] == passw is not None

@route('/logout')
def logout():
    abort(401, "You are no longer logged in")

@route('/')
@auth_basic(check_login)
def home():
    return template('static/resources/tpl/home.tpl', get_url=url)

run(host='localhost', port=8080, debug=True)
