class PageRenderer:

    def __init__(self, template_path) -> None:
        with open(template_path, encoding='utf-8') as f:
            self._template = f.read()

    def render(self, **kwargs) -> str:
        '''Генерирует html-страницу на основе шаблона и переданных параметров'''
        return self._template.format(**kwargs)


class FolderPageRenderer(PageRenderer):
    def __init__(self) -> None:
        super().__init__('templates/folder_page.html')

    def render(self, items, id):
        elements = []
        for item in items:
            if item["is_link"]:
                elements.append(f'''<div data-link="{item["link"]}" data-name="{item["name"]}" class="card link">
                                    <div class="card_label"> {item["name"]} (ССЫЛКА)</div>
                                    <button class="delete_card_btn">✖</button>
                                </div>''')
            else:
             elements.append(f'''<div id="{item["_id"]}" class="card">
                                    <div class ="card_label"> {item["name"]} </div>
                                    <button class="delete_card_btn">✖</button>
                                </div>''')
        rendered_items = ''.join(elements)
        return super().render(template=rendered_items, folder_id=id)
