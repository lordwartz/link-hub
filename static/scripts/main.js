'use strict';

window.addEventListener('load', function() {
    const addButton = document.querySelector(".add_group_button");
    addButton.addEventListener('click', createCardFromPrompt);

    const addCardButton = document.querySelector('.add_card');
    addCardButton.addEventListener('click', createCardFromPrompt);

    const addLinkButton = document.querySelector('.add_link_button');
    addLinkButton.addEventListener('click', createLinkFromPrompt);

    this.document.querySelector('.group_card').addEventListener('click', function(e) {
        if(e.target.classList.contains('delete_card_btn')) {
            const card = e.target.closest('.card');
            card.remove();
            removeItem(card);
            return;
        }

        let card = e.target.closest('.card');
        if(!card || card.classList.contains('add_card')) {
            return;
        }

        if(card.classList.contains('link')) {
            let url = card.dataset.link;
            if (!url.startsWith('http')) {
                url = 'https://' + url;
            }
            window.open(url);
            return;
        }
        
        history.pushState(null, null, `/folder/${card.id}`);
        window.location.href = `/folder/${card.id}`;
    })

    const backButton = document.querySelector('.back_button');
    backButton.addEventListener('click', showGroups);
});

function createCardFromPrompt() {
    askUser(['Название группы'], ['name']).then(function (answers) {

        if(answers.name === null) {
            return;
        }

        addItem({
            name: answers.name
        });
    });
}

function createLinkFromPrompt() {
    askUser(['Link Text', 'URL'], ['name', 'link']).then(function (answers) {
        if(answers.name === null || answers.link === null) {
            return;
        }

        addItem({
            name: answers.name,
            link: answers.link
        });
    });
}

function addItem(itemData) {
    const card_id = document.querySelector('.group_card').dataset.currentFolder;
    const cardCount = document.querySelector('.group_card').children.length - 1;
    itemData.order = cardCount;

    fetch('/add', {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            parent: card_id,
            content: itemData
        })
    })
    .then(response => {
        if(!response.ok) {
            throw new Error(`Ошибка, код ответа: ${response.status}`);
        }

        return response.json();
    })
    .then(() => {
        location.replace(location.href);
    });
}

function removeItem(card) {
    const card_id = document.querySelector('.group_card').dataset.currentFolder;
    const isLink = card.classList.contains('link');
    const request = {
        parent: card_id,
        is_link: isLink
    }

    if(isLink) {
        request.name = card.dataset.name;
    } else {
        request.id = card.id;
    }

    fetch('/delete', {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(request)
    })
    .then(response => {
        if(!response.ok) {
            throw new Error(`Ошибка, код ответа: ${response.status}`);
        }

        return response.json();
    })
    .then(() => {
        location.replace(location.href);
    });
}

function askUser(fieldNames, keys) {
    return new Promise((resolve, reject) => {

        const inputs = document.getElementById('inputs');
        inputs.innerText = '';

        for(let i = 0;i<fieldNames.length;i++) {
            const label = document.createElement('label');
            label.innerText += fieldNames[i];

            const input = document.createElement('input');
            input.type = 'text';
            input.name = keys[i];

            label.appendChild(input);
            inputs.appendChild(label);
        }

        const buttons = document.getElementById('buttons');

        let cancelButton = buttons.getElementsByClassName('cancel')[0];
        cancelButton = clearEventListeners(cancelButton);

        let form = document.getElementById('form');
        form = clearEventListeners(form);

        form.addEventListener('submit', function (e) {
            e.preventDefault();
            e.stopPropagation();
            const answers = Object.fromEntries(new FormData(e.target).entries());
            closeModal();
            resolve(answers);
            return false;
        });

        cancelButton.addEventListener('click', function (e) {
            closeModal();
            reject(false);
        });
        showModal();
    });
}

function showModal() {
    document.getElementById('background').style.display = 'flex';
}
function closeModal() {
    document.getElementById('background').style.display = 'none';
}

//Немного костыльное удаление eventListener-ов с элемента
function clearEventListeners(element) {
    const newNode = element.cloneNode();
    while (element.hasChildNodes()) {
        newNode.appendChild(element.removeChild(element.firstChild));
    }
    element.parentNode.replaceChild(newNode, element);
    return newNode;
}




