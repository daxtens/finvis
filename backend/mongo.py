from pymongo import *
from mongoengine import *
from bson import Binary, Code
from bson.json_util import dumps


connect('finvis-data')

class Period(EmbeddedDocument):
    value = IntField(required=True)
    metadata = DictField()


class Item(EmbeddedDocument):
    name = StringField(required=True)
    periods = DictField(field=EmbeddedDocumentField(Period))
    items = ListField(EmbeddedDocumentField('Item'))
    metadata = DictField()


class Aggregate(Item):
    category = StringField(required=True)


class Relation(EmbeddedDocument):
    greater = StringField()
    equal = StringField()
    less = StringField()


class Entity(Document):
    name = StringField(required=True)
    username = StringField(required=True)
    public = BooleanField(required=True)
    # only saved so we can nondestructivly export
    units = IntField(required=True)
    metadata = DictField()
    meta = {'allow_inheritance': True}


class AggregateEntity(Entity):
    aggregates = ListField(EmbeddedDocumentField(Aggregate))
    relations = DictField(field=EmbeddedDocumentField(Relation))


class ItemEntity(Entity):
    item = EmbeddedDocumentField(Item)
    category = StringField(required=True)
