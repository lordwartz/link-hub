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

    def render(self, folders, id):
        elements = ''.join(
            (f'''<div id="{folder["_id"]}" class="card">
                <div class ="card_label"> {folder["name"]} </div>
                <button class="delete_card_btn">✖</button>
            </div>'''
            for folder in folders)
        )
        return super().render(template=elements, folder_id=id)
