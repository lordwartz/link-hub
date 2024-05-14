document.addEventListener('DOMContentLoaded', function() {
    let groupTemplate = document.querySelector('#inner_group_template');
    let linkTemplate = document.querySelector('#inner_link_template');
    let groupMain = document.querySelector('.group_main');

    function addGroupContentTemplate(template, text, data_url) {
        let clone = document.importNode(template.content, true);
        clone.querySelector('span').textContent = text;
        clone.querySelector('.item').setAttribute('data-url', data_url);
        groupMain.appendChild(clone);
    }

    addGroupContentTemplate(groupTemplate, 'Я какая-то группа', '8179798y4kjehkdjhfiuy38');
    addGroupContentTemplate(linkTemplate, 'Я какая-то ссылка', 'google.com');

    let quick_group_template = document.querySelector('#quick_menu_group_template');
    for (let i = 1; i <= 7; i++) {
        {
            let clone = document.importNode(quick_group_template.content, true);
            let link = clone.querySelector('a');
            link.textContent = `Группа ${i}`;
            link.href = `#group${i}`;
            if (i === 3) {
                link.classList.add('active_quick_menu_group');
            }
            document.querySelector('.quick_menu').appendChild(clone);
        }
    }

    let quickLinks = document.querySelectorAll('.quick_menu a');

    quickLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault(); // Отменяем стандартное поведение ссылки
            quickLinks.forEach(link => {
                link.classList.remove('active_quick_menu_group'); // Удаляем класс у всех ссылок
            });
            this.classList.add('active_quick_menu_group'); // Добавляем класс только нажатой ссылке
        });
    });
});
