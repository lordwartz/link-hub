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

    this.document.querySelector('.group_card').addEventListener('click', function(e) {
        if(e.target.classList.contains('delete_card_btn')) {
            e.target.remove();
            return;
        }

        let card = e.target.closest('.card');
        if(!card || card.classList.contains('add_card')) {
            return;
        }
        
        history.pushState(null, null, `/folder/${card.id}`);
        window.location.href = `/folder/${card.id}`;
    })

    const backButton = document.querySelector('.back_button');
    backButton.addEventListener('click', showGroups);
    getGroupContent();
});

function createCardFromPrompt() {
    askUser(['Название группы'], ['name']).then(function (answers) {

        if(answers.name === null) {
            return;
        }

        tryAddCard(answers.name)
    });
}

function tryAddCard(name) {
    const card_id = document.querySelector('.group_card').dataset.currentFolder ?? null;
    const cardCount = document.querySelector('.group_card').children.length - 1;
    fetch('/add', {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            parent: card_id,
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
    .then(() => {
        location.replace(location.href);
    })
    //.catch(() => alert('Не удалось добавить ссылку'));
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




