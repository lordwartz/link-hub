'use strict'
window.addEventListener('load', function() {
    const addButton = document.getElementsByClassName("add_group_button")[0];

    addButton.addEventListener('click', function (e) {
        createCardFromPrompt();
    });

    const add_card = document.getElementsByClassName('add_card')[0];

    add_card.addEventListener('click', function (e)  {
        createCardFromPrompt();
    });
});

let cards = [];
let nextCardId = 0;
function createCard(name) {
    const card = {
        name,
        id : nextCardId
    }

    cards.push(card);
    configureCardTemplate(name, nextCardId);
    nextCardId++;
}

function configureCardTemplate(name, id) {
    const cardElement = document
        .getElementsByClassName('templates')[0]
        .getElementsByClassName('card')[0]
        .cloneNode(true);

    const cardRemoveButton = cardElement.getElementsByClassName('delete_card_btn')[0];
    cardRemoveButton.addEventListener('click', function (e) {
        cardElement.remove();
    });

    cardElement.id = id.toString();
    cardElement.getElementsByClassName('card_label')[0].innerText = name;
    nextCardId++;

    const groupContainer = document.getElementsByClassName('group_card')[0];
    groupContainer.appendChild(cardElement);
    return cardElement;
}

function createCardFromPrompt() {
    let newCardName = prompt("Введите название группы");

    if(newCardName === null) {
        return;
    }

    createCard(newCardName);
}




