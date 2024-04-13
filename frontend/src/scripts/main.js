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

    loadCardsFromLocalStorage();
});

let cards = [];
let nextCardId = 0;
let selectedCard = null;

function loadCardsFromLocalStorage() {
    const storedCards = localStorage.getItem('cards');
    if (storedCards) {
        cards = JSON.parse(storedCards);
        nextCardId = cards.length;
        cards.forEach(card => {
            const cardElement = configureCardTemplate(card.name, card.id.split('-')[0]);
            document.querySelector('.group_card').appendChild(cardElement);

            card.links.forEach(link => addLinkToPage(link, card.id));
        });
    }
}

function saveCardsToLocalStorage() {
    localStorage.setItem('cards', JSON.stringify(cards));
}

function deleteCardFromLocalStorage(cardId) {
    cards = cards.filter(card => card.id !== cardId);
    saveCardsToLocalStorage();
}

function createCard(name) {
    const card = {
        name,
        id: `${nextCardId}-card`,
        links: [],
        linkCounter: 0
    };

    cards.push(card);
    saveCardsToLocalStorage();
    const cardElement = configureCardTemplate(name, nextCardId);
    const groupContainer = document.getElementsByClassName('group_card')[0];
    groupContainer.appendChild(cardElement);
    nextCardId++;
}


function configureCardTemplate(name, id) {
    const cardElement = document
        .getElementsByClassName('templates')[0]
        .getElementsByClassName('card')[0]
        .cloneNode(true);

    cardElement.addEventListener('click', function(e) {
        selectedCard = cards.find(el => el.id === cardElement.id);
        showLinks();
    });

    const cardRemoveButton = cardElement.getElementsByClassName('delete_card_btn')[0];
    cardRemoveButton.addEventListener('click', function (e) {
        cardElement.remove();
        deleteCardFromLocalStorage(cardElement.id);
        e.stopPropagation();
    });

    cardElement.id = `${id}-card`;
    cardElement.getElementsByClassName('card_label')[0].innerText = name;

    return cardElement;
}

function configureLinkTemplate(linkObj) {
    const linkElement = document
        .getElementsByClassName('templates')[0]
        .getElementsByClassName('link')[0]
        .cloneNode(true);

    linkElement.addEventListener('click', function (e) {
        window.open(linkObj.link);
    });

    const linkRemoveButton = linkElement.getElementsByClassName('delete_link_btn')[0];

    linkRemoveButton.addEventListener('click', function (e) {
        linkElement.remove();
        const linkIndex = selectedCard.links.findIndex(link => link.id === linkElement.id);
        selectedCard.links.splice(linkIndex, 1);
        e.stopPropagation();
    });

    linkElement.id = linkObj.id;
    linkElement.getElementsByTagName('a')[0].innerText = linkObj.name;

    return linkElement;
}

function createLink(name, link) {
    const newLink = {
        name,
        link,
        id: `${selectedCard.linkCounter++}-link`
    };

    selectedCard.links.push(newLink);

    saveCardsToLocalStorage();
    return newLink;
}
function addLinkToPage(linkObj) {
    const linkElement = configureLinkTemplate(linkObj);
    document.getElementsByClassName('link_group')[0].appendChild(linkElement);
}

function createCardFromPrompt() {
    askUser(['Название группы'], ['name']).then(function (answers) {

        if(answers.name === null) {
            return;
        }

        createCard(answers.name);
    });
}

function showLinks() {
    const linksGroup = document.getElementsByClassName('link_group')[0];
    linksGroup.innerText = '';
    selectedCard.links.forEach(link => addLinkToPage(link));

    const groups = document.getElementsByClassName('groups')[0];
    groups.style.display = 'none';
    const links = document.getElementsByClassName('links')[0];
    links.style.display = 'block';
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




