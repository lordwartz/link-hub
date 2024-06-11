from flask import Flask, jsonify, session, abort, send_file
from PyMongoJsonProvider import PyMongoJSONProvider
from PageRenderer import get_renderer_from_file
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
    'index': get_renderer_from_file('static/pages/index.html'),
    'group': get_renderer_from_file('static/pages/group.html'),
    'settings': get_renderer_from_file('static/pages/settings.html')
}

client = MongoClient('localhost', 27017)
# client.drop_database('linkhub')
db = client.linkhub
users = db.users
groups_collection = db.groups


# region auth
def is_logged_in():
    return 'logged_in' in session


@app.route('/', methods=['GET'])
def auth():
    if request.method == 'GET':
        if 'logged_in' in session:
            groups = get_folders()
            return renderers["index"](
                id='root',
                quick_groups=groups,
                groups=groups,
                username=session["login"],
                current_location='root')
        return app.redirect('/auth')


@app.route('/auth')
def auth_page():
    if 'logged_in' in session:
        return app.redirect('/')
    return app.send_static_file('pages/auth.html')

@app.route('/settings')
def settings_page():
    if 'logged_in' in session:
        return renderers['settings'](username=session['login'], email=session['email'])
    return app.redirect('/auth')


@app.route('/login', methods=['POST'])
def login():
    form_data = request.json
    user_data = check_credentials(form_data['login'], form_data['password'])
    if user_data is None:
        abort(401)
    session['logged_in'] = True
    session['login'] = user_data['login']
    session['user_id'] = user_data['_id']
    session['email'] = user_data['email']
    return app.redirect('/')


@app.route('/register', methods=['POST'])
def register():
    form_data = request.json
    new_user = {
        "login": form_data["login"],
        "email": form_data["email"],
        "password": get_hash(form_data["password"])
    }

    insert_id = users.update_one(
        {
            "$or": [
                {"login": new_user["login"]},
                {"email": new_user["email"]}
            ]
        },
        {
            "$setOnInsert": new_user
        }, upsert=True).upserted_id

    if insert_id is None:
        return jsonify({"Error": "Account with this login or email already exists"}), 400
    return jsonify({"Ok": "Account created successfully!"}), 200


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
        return user_data
    return None

@app.route('/change_creds', methods=['POST'])
def change_credentials():
    if not 'logged_in' in session:
        abort(403)
    
    data = request.json
    if not schemas.validate(data, {'email': str, 'login': str}):
        abort(400)
    same_cred_users = users.find(
        {
            "$or": [
                {"login": data["login"]},
                {"email": data["email"]}
            ]
        })
    
    same_cred_users = list(same_cred_users)
    
    if len(same_cred_users) > 1:
        abort(400)
    
    if same_cred_users and str(same_cred_users[0]['_id']) != session['user_id']:
        abort(400)

    users.find_one_and_update({
        '_id': ObjectId(session['user_id'])
    },
    {
        '$set': {
            'login': data['login'],
            'email': data['email']
        }
    })

    session['login'] = data['login']

    return jsonify({'Ok': 'Creadentials have been successfully changed!'}), 200

@app.route('/change_pass', methods=['POST'])
def change_password():
    if not 'logged_in' in session:
        abort(403)
    
    data = request.json
    if not schemas.validate(data, {
            'old_password': str,
            'password': str,
            'password-confirm':str
        }):
        abort(400)

    user = users.find_one({'_id': ObjectId(session['user_id'])})
    old_pass = get_hash(data['old_password'])
    new_pass = get_hash(data["password"])

    if old_pass != user['password'] or user["password"] == new_pass:
        abort(400)

    users.find_one_and_update({
        '_id': ObjectId(session['user_id'])
    },
    {
        '$set': {
            'password': new_pass
        }
    })

    session.clear()

    return jsonify({'Ok': 'Password has been successfully changed!'}), 200

@app.route('/delete_account', methods=['POST'])
def delete_account():
    if not 'logged_in' in session:
        abort(403)

    data = request.json
    if not schemas.validate(data, {'confirm':bool}) or not data['confirm']:
        abort(400)

    users.find_one_and_delete({'_id': ObjectId(session['user_id'])})
    session.clear()
    return jsonify({'Ok': 'Account was deleted successfully!'}), 200

def get_hash(data):
    return sha256(data.encode('utf-8')).hexdigest()

# endregion auth


@app.route('/add', methods=['POST'])
def add():
    if not 'logged_in' in session:
        abort(403)
    
    data = request.json
    if schemas.validate(data, schemas.LINK_SCHEMA):
        folder_id = groups_collection.find_one_and_update(
            {"_id": ObjectId(data["parent"]), "user": session["user_id"]},
            {
                "$push": {
                    "links": {
                        "is_link": True,
                        "name": data["name"],
                        "link": data["link"],
                        "order": data["order"]
                    }
                }
            }
        )

        if folder_id is None:
            return jsonify({"Error": "Could not add link to folder!"}), 400
        return jsonify({"id": folder_id}), 200
    
    elif schemas.validate(data, schemas.GROUP_SCHEMA):
        group_id = groups_collection.insert_one({
            "user": session["user_id"],
            "parent": data["parent"],
            "name": data["name"],
            "order": data["order"],
            "is_link": False,
            "links": []
        }).inserted_id

        if data["parent"] != 'root':
            groups_collection.find_one_and_update(
                {"_id": ObjectId(data["parent"])},
                {
                    "$push": {
                        "links": {
                            "_id": group_id,
                            "is_link": False,
                            "name": data["name"],
                            "order": data["order"]
                        }
                    }
                }
            )

        return jsonify({"_id": group_id}), 200
    return jsonify({"error": "Wrong request json structure!"}), 400

def get_folders():
    if not 'logged_in' in session:
        abort(403)

    folders = groups_collection.find({
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

@app.route("/group/<id>", methods=['GET'])
def get_folder(id):
    if not is_logged_in():
        return app.redirect('/')

    group = groups_collection.find_one(
    {
        "$and":[
            {"user": session["user_id"]},
            {"_id": ObjectId(id)}
        ]
    })

    if group is None:
        abort(404)
        
    items = group["links"]
    links = []
    folders = []
    for item in items:
        if item["is_link"]:
            links.append(item)
        else:
            folders.append(item)

    return renderers["group"](
        current_location=group["_id"],
        username=session["login"],
        group_name=group["name"],
        quick_groups=get_folders(),
        groups=folders,
        links=links
    )

@app.route('/delete', methods=['POST'])
def delete():
    if not 'logged_in' in session:
        abort(403)

    data = request.json
    if schemas.validate(data, schemas.LINK_DEL_SCHEMA):
        folder_id = groups_collection.find_one_and_update(
            {"_id": ObjectId(data["parent"]), "user": session["user_id"]},
            {
                "$pull": {
                    "links": {
                        "name": data["name"],
                        "is_link": True
                    }
                }
            }, return_document=ReturnDocument.AFTER)

        if folder_id is None:
            return jsonify({"Error": "Could not find specified link!"}), 400
        return jsonify({"id": folder_id}), 200
    
    elif schemas.validate(data, schemas.GROUP_DEL_SCHEMA):
        delete_folder(data["id"], data["parent"])
        return jsonify({"_id": data["id"]}), 200
    return jsonify({"Error": "Wrong request json structure!"}), 400

def delete_folder(id, parent_id):
    if parent_id != 'root':
            groups_collection.find_one_and_update(
                {"_id": ObjectId(parent_id)},
                {
                    "$pull": {
                        "links": {
                            "_id": ObjectId(id),
                            "is_link": False
                        }
                    }
                }
            )

    folders = []
    folders.append((ObjectId(id), parent_id))

    while folders:
        cur_id, cur_parent_id = folders.pop()
        folder = groups_collection.find_one_and_delete({
                "user": session["user_id"],
                "parent": cur_parent_id,
                "_id": cur_id,
        })

        for link in folder["links"]:
            if link["is_link"]:
                continue
            folders.append((link["_id"], str(cur_id)))

@app.errorhandler(404)
def not_found_page(e):
    return app.send_static_file('pages/error_page.html')


if __name__ == '__main__':
    app.run(host="0.0.0.0")
