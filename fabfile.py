from fabric.api import *

srcfiles = ['circles.js', 'data.js', 'theopenbudget.js', 'parenting.js',
            'viewstate.js', 'viewobj.js', 'events.js']


def hello():
        print( "Hello world!" )

def compile(advanced="False"):
        files = ['d3.v3.js', 'jquery-1.8.3.js', 'jquery.contextmenu.r2.js'] + \
            srcfiles

        command = "java -jar ../compiler-latest/compiler.jar "
        command = command + "--language_in=ECMASCRIPT5_STRICT "
        for theFile in files:
                command = command + "--js=" + theFile + " "

        if advanced == "True":
                command = (command +
                           "--compilation_level ADVANCED_OPTIMIZATIONS ")

        command = command + "--formatting=pretty_print "
        
        command = command + "--js_output_file=finvis.js"
        local( command )

def docs():
        local( "../jsdoc/jsdoc " + \
               " ".join(srcfiles) + " --destination ./docs/" )
