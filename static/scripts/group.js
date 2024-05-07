document.addEventListener('DOMContentLoaded', function() {
    let groupTemplate = document.querySelector('#inner_group_template');
    let linkTemplate = document.querySelector('#inner_link_template');
    let groupMain = document.querySelector('.group_main');

    function addGroupContentTemplate(template, text) {
        let clone = document.importNode(template.content, true);
        clone.querySelector('span').textContent = text;
        groupMain.appendChild(clone);
    }

    addGroupContentTemplate(groupTemplate, 'Я какая-то группа');
    addGroupContentTemplate(linkTemplate, 'Я какая-то ссылка');
});
