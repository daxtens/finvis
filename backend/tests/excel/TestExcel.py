from unittest import TestCase
from nose.tools import *
import os
import excel
import bson

class TestExcel(TestCase):
    @classmethod
    def setUpClass(self):
        self.rootdir = os.path.dirname(os.path.abspath(__file__))

    def test_Aggregate(self):
        aggregate = open(os.path.join(self.rootdir, 'cth-fbo.xls'), 'r').read()
        assert_equal(bson.json_util.dumps(excel.import_excel(aggregate).to_mongo()),
                     open(os.path.join(self.rootdir, 'cth-fbo.json'),'r').read())

    def test_Item(self):
        item = open(os.path.join(self.rootdir, 'transportandcoms.xls'), 'r').read()
        assert_equal(bson.json_util.dumps(excel.import_excel(item).to_mongo()),
                     open(os.path.join(self.rootdir, 'transportandcoms.json'),'r').read())

    
