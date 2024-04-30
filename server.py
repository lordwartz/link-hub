from flask import Flask, jsonify, session, abort, send_from_directory
from PyMongoJsonProvider import PyMongoJSONProvider
from PageRenderer import FolderPageRenderer
from pymongo import ReturnDocument
from pymongo import MongoClient
from hashlib import sha256
from bson import ObjectId
from flask import request
import schemas
import os

app = Flask(__name__)

# Генерируем секретный ключ
app.secret_key = os.urandom(30).hex()
app.json = PyMongoJSONProvider(app)
renderers = {
    "folder": FolderPageRenderer()
}

client = MongoClient('localhost', 27017)
client.drop_database('linkhub')
db = client.linkhub
users = db.users
groups = db.groups


# region auth
def is_logged_in():
    return 'logged_in' in session


@app.route('/main', methods=['GET'])
def auth():
    if request.method == 'GET':
        if 'logged_in' in session:
            return renderers["folder"].render(get_folders(), id='root')
        return app.send_static_file('pages/auth.html')


@app.route('/login', methods=['POST'])
def login():
    form_data = request.form
    user_id = check_credentials(form_data['login'], form_data['password'])
    if user_id is not None:
        session['logged_in'] = True
        session['user_id'] = user_id
        return app.redirect('/main')
    abort(401)


@app.route('/register', methods=['POST'])
def register():
    form_data = request.form
    new_user = {
        "_id": form_data["login"],
        "name": form_data["name"],
        "email": form_data["email"],
        "login": form_data["login"],
        "password": get_hash(form_data["password"])
    }

    insert_id = users.update_one(
        {
            "$or": [
                {"_id": new_user["_id"]},
                {"email": new_user["email"]}
            ]
        },
        {
            "$setOnInsert": new_user
        }, upsert=True).upserted_id

    if insert_id is None:
        return jsonify({"Error": "Account with this login or email already exists"}), 400
    return app.redirect('/main')


@app.route('/logout', methods=['GET'])
def logout():
    if 'logged_in' in session:
        session.pop('logged_in')
    return app.redirect('/')


def check_credentials(login, password):
    user_data = users.find_one({"login": login})
    if not user_data:
        return None

    if user_data["password"] == get_hash(password):
        return user_data["_id"]
    return None


def get_hash(data):
    return sha256(data.encode('utf-8')).hexdigest()

# endregion auth


@app.route('/add', methods=['POST'])
def add():
    data = request.json
    if schemas.validate(data, schemas.LINK_SCHEMA):
        link_data = data["content"]
        return groups.find_one_and_update(
            {"_id": data["parent"], "user": session["user_id"]},
            {
                "$push": {
                    "links": {
                        "data": {
                            "is_link": True,
                            "name": link_data["name"],
                            "link": link_data["link"]
                        },
                        "order": link_data["order"]
                    }
                }
            }, return_document=ReturnDocument.AFTER)

    elif schemas.validate(data, schemas.GROUP_SCHEMA):
        group_data = data["content"]

        group_id = groups.insert_one({
            "user": session["user_id"],
            "parent": data["parent"],
            "name": group_data["name"],
            "order": group_data["order"],
            "is_link": False,
            "links": []
        }).inserted_id

        if data["parent"] != 'root':
            groups.find_one_and_update(
                {"_id": ObjectId(data["parent"])},
                {
                    "$push": {
                        "links": {
                            "_id": group_id,
                            "is_link": False,
                            "name": group_data["name"],
                            "$ref": group_id,
                            "order": group_data["order"]
                        }
                    }
                }
            )

        return jsonify({"_id": group_id}), 200
    return jsonify({"error": "Wrong request json structure!"}), 400


@app.route('/get', methods=['POST'])
def add_user():
    user_request = request.json
    if not schemas.validate(user_request, {"id": str}):
        return jsonify({"error": "Wrong request json structure!"}), 400
    items = None
    if user_request["id"] == None:
        items = get_folders()
    else:
        group = groups.find_one(
        {
            "$and":[
                {"user": session["user_id"]},
                {"_id": ObjectId(user_request["id"])}
            ]
        })
        
        items = group["links"]
    if items is None:
        return jsonify({"Error": "No group found with given id"}), 400
    return jsonify({"items" : items})

def get_folders():
    folders = groups.find({
        "$and": [
            {"user": session["user_id"]},
            {"parent": 'root'}
        ]
    })

    return [{
        "_id": folder["_id"],
        "name": folder["name"],
        "is_link": False,
    } for folder in folders]

@app.route("/folder/<id>", methods=['GET'])
def get_folder(id):
    group = groups.find_one(
    {
        "$and":[
            {"user": session["user_id"]},
            {"_id": ObjectId(id)}
        ]
    })

    if group is None:
        abort(404)
        
    items = group["links"]
    return renderers["folder"].render(items, id)


if __name__ == '__main__':
    app.run(debug=True)
