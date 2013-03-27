from bottle import route, run, debug, template, post, request, response
from mongo import *
import bson
import mongoengine
import pymongo
import mongo
import excel


@route('/entities')
def entity_list():
    return template('views/entity_list',
                    entities=Entity.objects().only("name"))


@route('/entities.json')
def entity_list_json():
    entities = Entity.objects().only("name")
    entity_strings = []

    for entity in entities:
        entity_strings.append(
            ("{ '_id': '%s', 'name': '%s' }" % (entity.id, entity.name)))

    return ", ".join(entity_strings)


@route('/entity.json/:entityid')
def entity_json(entityid):
    result = bson.json_util.dumps(Entity.objects(id=entityid)[0].to_mongo())
    #return entityid
    return result


@post('/excel_to_json.json')
def excel_to_json():
    """Return the uploaded excel file as a JSON document."""
    excelfile = request.files.get('excelfile')

    response.content_type = 'text/json'

    try:
        obj = excel.import_excel(excelfile.file.read())
    except excel.ExcelError as e:
        return {'error': str(e)}

    result = bson.json_util.dumps(obj.to_mongo())
    return result
