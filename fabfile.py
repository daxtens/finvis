from fabric.api import *

srcfiles_embedded = ['js/circles.js', 'js/util.js', 'js/parenting.js',
                     'js/viewstate.js', 'js/viewobj.js', 'js/events/events_all.js']
srcfiles_standalone = ['js/events/events_standalone.js']


def hello():
        print( "Hello world!" )

def setup(dev="False"):
        # web framework
        local("pip install bottle")
        local("pip install CherryPy")  # (accelerated server)
        # auth
        local("pip install bottle-cork")
        # excel
        local("pip install xlrd xlwt")
        # database
        local("pip install pymongo mongoengine")
        # PNG export: verify inkscape is installed
        local("inkscape --version")

	if dev == "True":
		local("pip install pep8")
		local("pip install http://sourceforge.net/projects/pychecker/files/pychecker/0.8.19/pychecker-0.8.19.tar.gz/download")
		local("pip install nose")
		local("easy_install http://closure-linter.googlecode.com/files/closure_linter-latest.tar.gz")


def compile(advanced="False", pretty="True", standalone="False"):
        files = srcfiles_embedded
	if standalone == "True":
		files = files + srcfiles_standalone

        command = "java -jar ../compiler-latest/compiler.jar "
        command = command + "--language_in=ECMASCRIPT5_STRICT "
        for theFile in files:
                command = command + "--js=" + theFile + " "

        if advanced == "True":
                command = (command +
                           "--compilation_level ADVANCED_OPTIMIZATIONS ")

	if pretty == "True":
                command = command + "--formatting=pretty_print "
        
        command = command + "--js_output_file=js/finvis.js"
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

        # needed to compile pymongo
        run("sudo apt-get -y install build-essential python-dev")

        print("You now have the required packages.")
