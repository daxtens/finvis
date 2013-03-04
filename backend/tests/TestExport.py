from unittest import TestCase
from nose.tools import *
import os
import export

class TestExport(TestCase):
    @classmethod
    def setUpClass(self):
        self.rootdir = os.path.dirname(os.path.abspath(__file__))

    def test_SVG(self):
        fragment = open(os.path.join(self.rootdir, 'svg.fragment'), 'r').read()
        assert_equal(export.svg_fragment_to_svg_document(fragment),
                     open(os.path.join(self.rootdir, 'Visualisation.svg'),'r').read())

    def test_PNG(self):
        fragment = open(os.path.join(self.rootdir, 'svg.fragment'), 'r').read()
        svg = export.svg_fragment_to_svg_document(fragment)
        assert_equal(export.svg_document_to_png(fragment),
                     open(os.path.join(self.rootdir, 'Visualisation.png'),'r').read())
        
