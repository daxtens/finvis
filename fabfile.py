from fabric.api import *

srcfiles = ['circles.js', 'util.js', 'parenting.js',
            'viewstate.js', 'viewobj.js', 'events.js']


def hello():
        print( "Hello world!" )

def setup(dev="False"):
        # web framework
        run("pip install bottle")
        run("pip install CherryPy")  # (accelerated server)
        # auth
        run("pip install bottle-cork")
        # excel
        run("pip install xlrd xlwt")
        # database
        run("pip install pymongo mongoengine")
        # PNG export: verify inkscape is installed
        run("inkscape --version")

	if dev == "True":
		run("pip install pep8")
		run("pip install http://sourceforge.net/projects/pychecker/files/pychecker/0.8.19/pychecker-0.8.19.tar.gz/download")
		run("pip install nose")
		run("easy_install http://closure-linter.googlecode.com/files/closure_linter-latest.tar.gz")


def compile(advanced="False", pretty="True"):
        files = srcfiles

        command = "java -jar ../compiler-latest/compiler.jar "
        command = command + "--language_in=ECMASCRIPT5_STRICT "
        for theFile in files:
                command = command + "--js=" + theFile + " "

        if advanced == "True":
                command = (command +
                           "--compilation_level ADVANCED_OPTIMIZATIONS ")

	if pretty == "True":
                command = command + "--formatting=pretty_print "
        
        command = command + "--js_output_file=finvis.js"
        local( command )

def docs():
        local( "../jsdoc/jsdoc " + \
               " ".join(srcfiles) + " --destination ./docs/" )

def init_machine():
        # do system updates
        run("sudo apt-get update")
        run("sudo apt-get -y upgrade")

        #install mongodb
        run("sudo apt-key adv --keyserver keyserver.ubuntu.com --recv 7F0CEB10")
        run("echo 'deb http://downloads-distro.mongodb.org/repo/ubuntu-upstart dist 10gen' | sudo tee /etc/apt/sources.list.d/10gen.list")
        run("sudo apt-get update")
        run("sudo apt-get -y install mongodb-10gen")

        # install various dependencies
        run("sudo apt-get install -y nginx inkscape fabric python-virtualenv supervisor git")

        print("You now have the required packages.")
