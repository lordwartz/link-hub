const groupFormInputs = [
    {
        type: "text",
        name: "name",
        placeholder: "Введите имя группы",
        label: "Имя"
    }
];

const linkFormInputs = [
    {
        type: "text",
        name: "name",
        placeholder: "Введите имя ссылки",
        label: "Имя"
    },
    {
        type: "text",
        name: "link",
        placeholder: "Введите имя ссылки",
        label: "Ссылка"
    }
];

function addItem(isLink) {
    let formResult = null;
    if(isLink) {
        formResult = askForm(linkFormInputs, "Создать ссылку", "Отменить");
    } else {
        formResult = askForm(groupFormInputs, "Создать группу", "Отменить");
    }

    formResult
        .then(formData => {
            return fetch('/add', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    ...formData,
                    parent: document.body.dataset.location,
                    order: 0
                })
            });
        })
        .then(() => {
            location.reload();
        });
}

function deleteItem(item) {
    const name = item.querySelector('span').innerText;
    const isLink = item.classList.contains('link');
    const confirmation = ask(`Удалить ${isLink ? 'ссылку' : 'группу'} "${name}"?`, 'Удалить', 'Отменить');

    const sendData = {
        parent: document.body.dataset.location
    };

    if(isLink) {
        sendData.name = name;
    } else {
        sendData.id = item.dataset.url
    }

    confirmation
        .then(() => {
            return fetch('/delete', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(sendData)
            });
        })
        .then(() => {
            location.reload();
        });
}

function addSettingsMenuListener(container) {
    const itemContainer = document.querySelector(container);

    itemContainer.addEventListener('click', function(event) {
        const group = event.target.closest('.group');
        changePathTo(group, '');
    });
}

function changePathTo(item, prefix) {
    let hash = item.dataset.url;
    console.log('Redirect to ' + hash);
    window.location.href = `/${prefix}${hash}`;
}

function addItemListenerToContainer(container) {
    const itemContainer = document.querySelector(container);

    itemContainer.addEventListener('click', function (event) {
        if(event.target.classList.contains('add_group')) {
            addItem(false);
            return;
        }

        if(event.target.classList.contains('add_link')) {
            addItem(true);
            return;
        }

        const item = event.target.closest('.item');
        if (!item) return;

        if (event.target.classList.contains('delete_button')) {
            deleteItem(item);
        } else if (item.classList.contains('link')) {
            let url = item.dataset.url;
            if (!url.startsWith('http')) {
                url = 'https://' + url;
            }
            window.open(url, '_blank');
        } else if (item.classList.contains('group')) {
            changePathTo(item, 'group/');
        }
    });
}