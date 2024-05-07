from flask.json.provider import JSONProvider
from json import JSONEncoder, loads, dumps
from bson import ObjectId




class PyMongoEncoder(JSONEncoder):
    '''Кастомный сериализатор, чтобы обрабатывать ObjectId у записей из mongodb'''
    def default(self, o):
        if isinstance(o, ObjectId):
            return str(o)
        return JSONEncoder.default(self, o)


class PyMongoJSONProvider(JSONProvider):

    def dumps(self, obj, **kwargs):
        return dumps(obj, **kwargs, cls=PyMongoEncoder)

    def loads(self, s: str | bytes, **kwargs):
        return loads(s, **kwargs)
