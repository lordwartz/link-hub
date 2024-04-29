'use strict';

window.addEventListener('load', function() {
    const addButton = document.querySelector(".add_group_button");
    addButton.addEventListener('click', createCardFromPrompt);

    const addCardButton = document.querySelector('.add_card');
    addCardButton.addEventListener('click', createCardFromPrompt);

    const addLinkButton = document.querySelector('.add_link_button');
    addLinkButton.addEventListener('click', function (e) {
        askUser(['Link Text', 'URL'], ['name', 'link']).then(function (answers) {
            const newLink = createLink(answers.name, answers.link);
            addLinkToPage(newLink);
        });
    });

    const backButton = document.querySelector('.back_button');
    backButton.addEventListener('click', showGroups);
    getGroupContent();
});

let cards = [];
let cardCount = 0;
let selectedCard = null;

function createCard(name, id) {
    const card = {
        name,
        id: id,
        links: [],
        linkCounter: 0
    };
    if(card.id === undefined) {
        console.log(id);
    }
    cards.push(card);
    const cardElement = configureItemTemplate(name, id);
    const groupContainer = document.getElementsByClassName('group_card')[0];
    groupContainer.appendChild(cardElement);
}


function configureItemTemplate(name, id, is_link) {
    const cardElement = document
        .getElementsByClassName('templates')[0]
        .getElementsByClassName('card')[0]
        .cloneNode(true);

    cardElement.addEventListener('click', function(e) {
        selectedCard = cards.find(card => card.id === id);
        getGroupContent();
    });

    const cardRemoveButton = cardElement.getElementsByClassName('delete_card_btn')[0];
    cardRemoveButton.addEventListener('click', function (e) {
        cardElement.remove();
        e.stopPropagation();
    });

    cardElement.id = `${id}-card`;
    cardElement.getElementsByClassName('card_label')[0].innerText = name;
    if (is_link) {
        cardElement.getElementsByClassName('card_label')[0].innerText += ' (ссылка)';
    }

    return cardElement;
}

function createCardFromPrompt() {
    askUser(['Название группы'], ['name']).then(function (answers) {

        if(answers.name === null) {
            return;
        }

        tryAddCard(answers.name)
    });
}

function tryAddCard(name) {
    fetch('/add', {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            parent: selectedCard?.id ?? null,
            content: {
                name: name,
                order: cardCount
            }
        })
    })
    .then(response => {
        if(!response.ok) {
            throw new Error(`Ошибка, код ответа: ${response.statusCode}`);
        }

        return response.json();
    })
    .then(payload => {
        console.log(`${name} : ${payload._id}`)
        createCard(name, payload._id);
        cardCount++;
    })
    .catch(() => alert('Не удалось добавить ссылку'));
}

function getGroupContent() {
    fetch('get', {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            id: selectedCard?.id ?? null
        })
    })
    .then(response => {
        if(!response.ok) {
            throw new Error(`Ошибка, код ответа: ${response.statusCode}`);
        }

        return response.json();
    })
    .then(payload => {
        const groups = document.querySelector('.group_card');
        const cards = Array.from(groups.children)
        cards.forEach(card => {
            if(!card.classList.contains('add_card')) {
                card.remove();
            }
        })

        payload.items.forEach(item => {
            createCard(item.name, item._id, item.is_link);
        });
    })
}

function  showGroups() {
    const links = document.getElementsByClassName('links')[0];
    links.style.display = 'none';

    const groups = document.getElementsByClassName('groups')[0];
    groups.style.display = 'block';
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




