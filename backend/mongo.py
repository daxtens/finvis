from pymongo import *
from mongoengine import *
from bson import Binary, Code
from bson.json_util import dumps
import datetime

connect('finvis-data')


class Period(EmbeddedDocument):
    value = IntField(required=True)
    metadata = DictField()


class Item(EmbeddedDocument):
    name = StringField(required=True)
    periods = DictField(field=EmbeddedDocumentField(Period))
    items = ListField(EmbeddedDocumentField('Item'))
    metadata = DictField()
    meta = {'allow_inheritance': True}


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


## State saving
class ViewObjState(EmbeddedDocument):
    entityId = ReferenceField(Entity, dbref=False)
    position = ListField(FloatField(), required=True)
    specifiedAggregates = ListField(StringField())
    poppedOut = BooleanField()
    children = ListField(EmbeddedDocumentField('ViewObjState'))
    meta = {'allow_inheritance': False}


class SavedState(Document):
    period = StringField(required=True)
    viewcenter = ListField(FloatField(), required=True)
    scaleMax = FloatField(required=True)
    children = ListField(EmbeddedDocumentField(ViewObjState))
    visits = IntField(default=0)
    visited_date = DateTimeField(default=datetime.datetime.now)
    creation_date = DateTimeField()
    creator = StringField()
    meta = {'allow_inheritance': False}

    def save(self, *args, **kwargs):
        if not self.creation_date:
            self.creation_date = datetime.datetime.now()
        self.visited_date = datetime.datetime.now()
        return super(SavedState, self).save(*args, **kwargs)
