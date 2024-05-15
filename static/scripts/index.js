document.addEventListener("DOMContentLoaded", function() {
    addItemListenerToContainer('.main_groups');
    addItemListenerToContainer('.quick_menu');
    document.querySelector('.add_main_group_link').addEventListener('click', () => {
        const formResult = askForm([
            {
                type: "text",
                name: "name",
                placeholder: "Введите имя группы",
                label: "Имя"
            }
        ], "Создать группу", "Отменить");

        formResult
            .then(groupData => {
                const cardCount = document.querySelector('.main_groups').children.length - 1;
                return fetch('/add', {
                    method: 'POST',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        parent: 'root',
                        content: {
                            name: groupData.name,
                            order: cardCount
                        }
                    })
                });
            })
            .then(() => {
                location.reload();
            });
    });
});