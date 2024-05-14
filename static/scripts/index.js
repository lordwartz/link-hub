document.addEventListener("DOMContentLoaded", function() {
    let quick_group_template = document.querySelector('#quick_menu_group_template');
    let main_group_template = document.querySelector('#main_group_template');
    let add_button_template = document.querySelector('#add_group');
    for (let i = 1; i <= 12; i++) {
        {
            let clone = document.importNode(main_group_template.content, true);
            let link = clone.querySelector('a');
            link.textContent = `Группа ${i}`;
            link.href = `#group${i}`;
            document.querySelector('.main_groups').appendChild(clone);
        }
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

    let clone = document.importNode(add_button_template.content, true);
    document.querySelector('.main_groups').appendChild(clone);

    let quickLinks = document.querySelectorAll('.quick_menu a');

    quickLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            quickLinks.forEach(link => {
                link.classList.remove('active_quick_menu_group');
            });
            this.classList.add('active_quick_menu_group');
        });
    });
})