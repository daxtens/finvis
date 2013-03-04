"""
Tools to transform something from the web frontend (at the moment, an
<svg>...</svg> fragment) into something more that can be downloaded/exported.
Presently, export into a true SVG document and to PNG through Inkscape (yes,
ugly, I know) is supported.
"""

import os
import tempfile
import subprocess

rootdir = os.path.dirname(os.path.abspath(__file__))


def svg_fragment_to_svg_document(fragment):
    """Convert an SVG frament into a true XML document."""

    result = """<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN"
"http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">""" + \
        fragment

    return result.encode('utf-8')


def svg_document_to_png(svg):
    """Convert an SVG document to PNG. Currently done through Inkscape."""

    tf = tempfile.NamedTemporaryFile(delete=False, suffix='.svg')
    tf.write(svg)
    tf.close()
    # probably a race condition here.
    subprocess.call(['inkscape', '--export-png', tf.name+'.png', tf.name])
    os.unlink(tf.name)
    png = open(tf.name + '.png', 'rb').read()
    os.unlink(tf.name + '.png')
    return png
