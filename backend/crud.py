from bottle import route, run, debug, template
from mongo import *
import bson
import mongoengine
import pymongo

@route('/entities')
def entity_list():
    return template( 'views/entity_list', entities=Entity.objects().only("name"))


@route('/entities.json')
def entity_list_json():
    entities = Entity.objects().only("name")
    entity_strings=[]
    
    for entity in entities:
        entity_strings.append( ( "{ '_id': '%s', 'name': '%s' }" % (entity.id, entity.name) ) )

    return ", ".join( entity_strings )

@route('/entity.json/:entityid')
def entity_json( entityid ):
    result = bson.json_util.dumps(Entity.objects(id=entityid)[0].to_mongo())
    #return entityid
    return result

debug(True)
run(reloader=True)
