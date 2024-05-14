import re

_template_regex = re.compile(r"{{(?P<command>.+?)\|(?P<parameter>.+?)}}\s*(?P<content>.*?)\s*{{end}}", re.DOTALL)

def _repeat_renderer(pattern, parameter_name):

    def formatter(parameters):
        items = []
        item_list = parameters[parameter_name]
        for item in item_list:
            joined_dict = {**parameters, **{parameter_name : item}}
            items.append(pattern.format(**joined_dict))
        return '\n'.join(items)
    
    return formatter

_renderers = {
    'repeat': _repeat_renderer
}

def get_renderer(page_struct):
    sub_renderers = {}

    def _parse_match(match):
        command = match['command']
        parameter_name = match['parameter']
        content = match['content']

        renderer_func = _renderers[command]  
        sub_renderers[parameter_name] = renderer_func(content, parameter_name)

        return f'{{{parameter_name}}}'

    parsed_page = re.sub(_template_regex, _parse_match, page_struct)

    def renderer(**parameters):
        replacements = {key : sub_renderer(parameters) for key, sub_renderer in sub_renderers.items()}
        return parsed_page.format(**replacements)

    return renderer

def get_renderer_from_file(path):
    page = None
    with open(path, 'r', encoding='utf-8') as f:
        page = get_renderer(f.read())
    return page
