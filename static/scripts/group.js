document.addEventListener('DOMContentLoaded', function() {
    handleToHomepageClick()
    addItemListenerToContainer('.group_main');
    addItemListenerToContainer('.quick_menu');
    addListenerToBackButton();
    let groupTemplate = document.querySelector('#inner_group_template');
    let linkTemplate = document.querySelector('#inner_link_template');
    let groupMain = document.querySelector('.group_main');

    function addContentTemplate(container, template, text, data_url) {
        let clone = document.importNode(template.content, true);
        clone.querySelector('span').textContent = text;
        clone.querySelector('.item').setAttribute('data-url', data_url);
        container.appendChild(clone);
    }

    addContentTemplate(groupMain, groupTemplate, 'Я какая-то группа', '8179798y4kjehkdjhfiuy38');
    addContentTemplate(groupMain, linkTemplate, 'Я какая-то ссылка', 'google.com');

    let quick_group_template = document.querySelector('#quick_menu_group_template');
    const quickMenu = document.querySelector('.quick_menu');
    for (let i = 1; i <= 7; i++) {
        addContentTemplate(quickMenu, quick_group_template, `Группа ${i}`, `group${i}_hash`);
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
