from bottle import route, run, debug, template, static_file, redirect, post, CherryPyServer, request, response
import os
import tempfile
import subprocess

rootdir = os.path.dirname(os.path.abspath(__file__))
@route('/')
def redir():
    redirect('index.html')

# Static files
@route('/<filename:path>')
def static(filename):
    return static_file(filename, root=rootdir)

@post('/download')
def download():

    svg = template('views/svg',
                    data=request.forms.get('data'))

    if request.forms.get('format') == "svg":
        response.content_type = 'image/svg+xml'
        response.add_header('Content-Disposition', 'attachment; filename="Visualisation.svg"')
        return svg
    elif request.forms.get('format') == "png":
        response.content_type = 'image/png'
        response.add_header('Content-Disposition', 'attachment; filename="Visualisation.png"')
        tf = tempfile.NamedTemporaryFile(delete=False)
        tf.write(svg)
        tf.close()
        # probably a race condition here.
        subprocess.call( ['inkscape', '--export-png', tf.name+'.png', tf.name] )
        os.unlink(tf.name)
        return open(tf.name+'.png').read()


#debug(True) useless on cherrypy
run(server=CherryPyServer,reloader=True)
