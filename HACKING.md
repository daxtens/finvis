GETTING STARTED
===============

* Get Vagrant

* Check out the git repository

* Run ```vagrant up``` and follow the instructions.

* Hack, watching your changes at localhost:8080

* We follow the Google JS style guide - use `gjslint --strict` to verify compliance.
 - http://google-styleguide.googlecode.com/svn/trunk/javascriptguide.xml
 - gjslint is installed by `fab setup:dev=True`

* If you've added a new feature, write unit tests! If you fix a bug, write a unit test! Unit tests are awesome!

* Make sure you keep the JSDoc tags up to date. 
 - Generate documentation by running `fabric docs`
 - They will appear in ./docs/

OLD INSTRUCTIONS
================
* Install the python package virtualenv
* Set up a virtualenv: virtualenv devenv (or whatever; I use finvisenv)
* Enter and activate the environment (cd devenv; run whatever activation script suits your shell)
* Check out the code.  It should be a directory called finvis inside devenv. `cd` there.
* Install the following required package:
 - MongoDB
 - Inkscape (SVG->PNG converter)
 - fabric: `pip install fabric`
           Fabric is like `make`, but different.
 - `fab setup:dev=True` This installs a bunch of packages we use: bottle, CherryPy, xlrd, mongoengine, pymongo, pep8, nose, gjslint, etc. 
 - jsdoc3: follow the instructions at https://github.com/jsdoc3/jsdoc (either git or node.js)
           I put the package in devenv/jsdoc, and my fabric file assumes you do too.
* Optionally install the following useful packages for various projects you might want to take on:
 - Google's closure compiler: https://developers.google.com/closure/compiler/
   I place this in devenv/compiler-latest, and my fabric file assumes you do too.

