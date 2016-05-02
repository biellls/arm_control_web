from bottle import route, post, request, run, template, static_file, url, auth_basic

@route('/static/:path#.+#', name='static')
def static(path):
    return static_file(path, root='static')

#@route('/login')
#def login():
#    return template('static/resources/tpl/login.tpl', get_url=url)

def check_login(user, passw):
    return user == 'aaa' and passw == 'bbb'

#@post('/login') # or @route('/login', method='POST')
#def do_login():
#    username = request.forms.get('username')
#    password = request.forms.get('password')
#    if check_login(username, password):
#        return "<p>Your login information was correct.</p>"
#    else:
#        return "<p>Login failed.</p>"

@route('/')
@auth_basic(check_login)
def home():
    return template('static/resources/tpl/home.tpl', get_url=url)
    #return "<p>Home screen</p>"

run(host='localhost', port=8080, debug=True)
