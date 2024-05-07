def validate(struct, schema):
    if isinstance(struct, dict) and isinstance(schema, dict):
        return all(k in struct and validate(struct[k], schema[k]) for k in schema)

    if isinstance(struct, list) and isinstance(schema, list):
        return all(validate(struct[0], c) for c in schema)
    elif isinstance(schema, type):
        return isinstance(struct, schema) or struct is None
    else:
        return False


LINK_SCHEMA = {
    "parent": str,
    "content": {
        "name": str,
        "link": str,
        "order": int
    }

}

GROUP_SCHEMA = {
    "parent": str,
    "content": {
        "name": str,
        "order": int
    }
}

LINK_DEL_SCHEMA = {
    "parent": str,
    "name": str
}

GROUP_DEL_SCHEMA = {
    "parent": str,
    "id": str
}
