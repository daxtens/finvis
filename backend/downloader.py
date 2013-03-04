from bottle import route, run, debug, template, static_file, redirect, \
    post, CherryPyServer, request, response
import export
import os
import urllib

rootdir = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')


@route('/')
def redir():
    redirect('index.html')


# Static files
@route('/<filename:path>')
def static(filename):
    # todo move static assets to static.finvis or somesuch
    # served directly out of nginx for speed
    return static_file(filename, root=rootdir)


# Download the current view as SVG or PNG
@post('/download')
def download():
    #print request.body.read()
    # the fragment often overflows bottle's MEMFILE_MAX
    # hack around.
    fragment = request.body.read()[16:]  # cut off first param & data=
    fragment = urllib.unquote_plus(fragment).decode("utf8")
    svg = export.svg_fragment_to_svg_document(fragment)
    #print svg
    if request.forms.get('format') == "svg":
        response.content_type = 'image/svg+xml'
        response.add_header('Content-Disposition',
                            'attachment; filename="Visualisation.svg"')
        return svg
    elif request.forms.get('format') == "png":
        response.content_type = 'image/png'
        response.add_header('Content-Disposition',
                            'attachment; filename="Visualisation.png"')
        png = export.svg_document_to_png(svg)
        return png

if __name__ == "__main__":
    #debug(True) useless on cherrypy
    run(server=CherryPyServer, reloader=True)
