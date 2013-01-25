PREREQUISITES
=============

* Install the python package virtualenv
* Set up a virtualenv: virtualenv devenv (or whatever; I use finvisenv)
* Enter and activate the environment (cd devenv; run whatever activation script suits your shell)

* Install the following required package:
 - gjslint: easy_install http://closure-linter.googlecode.com/files/closure_linter-latest.tar.gz
 - jsdoc3: follow the instructions at https://github.com/jsdoc3/jsdoc (either git or node.js)
           I put the package in devenv/jsdoc, and my fabric file assumes you do too.
 - fabric: pip install fabric
           Fabric is like `make`, but different.
 - Unit test package: TBA.

* Optionally install the following useful packages for various projects you might want to take on:
 - For the "Closure-safe" project, you need: 
    - Google's closure compiler: https://developers.google.com/closure/compiler/
      I place this in devenv/compiler-latest, and my fabric file assumes you do too.

 - For backend work, you need:
    - MongoDB - consult 10gen/your distro
    - mongoengine: pip install mongoengine
    - bottle: pip install bottle
 
GETTING STARTED
===============

* Check out the git repository by following the instructions on github
 It should be a directory called finvis inside devenv.

* Start a local webserver (do this in another terminal tab):
  `cd finvis; python -m SimpleHTTPServer`

* Hack, watching your changes at localhost:8000

* We follow the Google JS style guide - use gjslint to verify compliance.
 - http://google-styleguide.googlecode.com/svn/trunk/javascriptguide.xml

* If you've added a new feature, write unit tests!

* Make sure you keep the JSDoc tags up to date. 
 - Generate documentation by running `fabric docs`
 - They will appear in ./docs/

PAID TASKS
==========

 - paid tasks are tagged as such on github's issue tracker, and marked with the estimated time and amount payable. 
 - Pick one to work on that hasn't been assigned to anyone. Assign it to yourself so everyone knows you're doing it.
 - Do it. If at any stage you think the price is too low, ask me if I'll increase it. I might.
 - When you're done, comment on the task with the time it took you (so I can calibrate my estimation)
 - Commit everything to the repository. If you're working on a big feature or you're unsure about anything, use a branch.
 - I will close the task when I've confirmed that you've done it.

