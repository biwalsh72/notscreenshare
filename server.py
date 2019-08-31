import sys
import pyautogui
from flask import Flask, render_template, Response, request, redirect, url_for, session
from flask_mysqldb import MySQL
# from flask_socketio import SocketIO
from camera_desktop import Camera
from app import routes
import MySQLdb.cursors
import re
import pymysql
from flask_sqlalchemy import SQLAlchemy

app = Flask(__name__)
app.config['SECRET_KEY'] = 'vnkdjnfjknfl1232#'
# socketio = SocketIO(app)

app.config['MYSQL_HOST'] = 'localhost'
app.config['MYSQL_USER'] = 'root'
app.config['MYSQL_PASSWORD'] = 'Kaseygirl_72'
app.config['MYSQL_DB'] = 'userslogin'

mysql = MySQL(app)


@app.route('/login', methods=['GET', 'POST'])
def login():
    msg = ''

    if request.method == 'POST' and 'username' in request.form and 'password' in request.form:
        username = request.form['username']
        password = request.form['password']

        cursor = mysql.connection.cursor(MySQLdb.cursors.DictCursor)
        cursor.execute(
            'SELECT * FROM accounts WHERE username = %s AND password = %s', (username, password))
        account = cursor.fetchone()

        if account:
            session['loggedin'] = True
            session['id'] = account['id']
            session['username'] = account['username']
            return redirect(url_for('home'))
        else:
            print('Incorrect username/password')
            msg = 'Incorrect username/password!'
    else:
        print('not working. fix now.')

    return render_template('login.html', msg=msg)


@app.route('/login/logout')
def logout():

    session.pop('loggedin', None)
    session.pop('id', None)
    session.pop('username', None)

    return redirect(url_for('login'))


@app.route('/register', methods=['GET', 'POST'])
def register():
    msg = ''

    if request.method == 'POST' and 'username' in request.form and 'password' in request.form and 'email' in request.form:
        username = request.form['username']
        password = request.form['password']
        email = request.form['email']

        cursor = mysql.connection.cursor(MySQLdb.cursors.DictCursor)
        cursor.execute(
            'SELECT * FROM accounts WHERE username = %s', [username])
        account = cursor.fetchone()

        if account:
            msg = 'Account already exists'
        elif not re.match(r'[^@]+@[^@]+\.[^@]+', email):
            msg = 'Invalid email address.'
        elif not re.match(r'[A-Za-z0-9]+', username):
            msg = 'Username must contain only characters and numbers.'
        elif not username or not password or not email:
            msg = 'Please fill out the form.'
        else:
            cursor.execute(
                'INSERT INTO accounts VALUES (NULL, %s, %s, %s)', (username, password, email))
            mysql.connection.commit()
            print('Successfully registered')
            msg = 'Successfully registered.'
            # return redirect(url_for('home'))

    elif request.method == 'POST':
        print('not registering. something is wrong.')
        msg = 'Please fill out the form!'

    return render_template('register.html', msg=msg)


# @app.route('/home/')
# def index():
#     return render_template('home.html')

@app.route('/home')
def home():
    # Check if user is loggedin
    if 'loggedin' in session:
        # User is loggedin show them the home page
        return render_template('home.html', username=session['username'])
    # User is not loggedin redirect to login page
    return redirect(url_for('login'))


def gen(camera):
    while True:
        frame = camera.get_frame()
        yield (b'--frame\r\n' + b'Content-Type: image/jpeg\r\n\r\n' + frame + b'\r\n\r\n')


@app.route('/video_feed')
def video_feed():
    return Response(gen(Camera()), mimetype='multipart/x-mixed-replace; boundary=frame')


@app.route('/mouse', methods=['POST'])
def mouse_event():
    # co-ordinates of image event
    ex, ey = float(request.form.get('x')), float(request.form.get('y'))
    # size of image
    imx, imy = float(request.form.get('X')), float(request.form.get('Y'))
    # size of desktop
    dx, dy = pyautogui.size()
    # coordinates of desktop
    x, y = dx*(ex/imx), dy*(ey/imy)
    # mouse event
    event = request.form.get('type')

    if event == 'click':
        pyautogui.click(x, y)
    elif event == 'dblclick':
        pyautogui.doubleClick(x, y)
    elif event == 'rightclick':
        pyautogui.click(x, y, button='right')

    return Response("success")


@app.route('/keyboard', methods=['POST'])
def keyboard_event():
    # keyoard event
    event = request.form.get('type')
    print(event)
    if event == "text":
        text = request.form.get("text")
        pyautogui.typewrite(text)
    else:
        pyautogui.press(event)
    return Response("success")

if __name__ == "__main__":
    app.run(host='0.0.0.0', threaded=True, debug=True)
