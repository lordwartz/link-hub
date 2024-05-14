function ask(message, ok, cancel=null) {
    const template = getModalTemplate();
    const modal = template.querySelector('.modal');

    const messageEl = document.createElement('p');
    messageEl.innerText = message;

    modal.append(messageEl);
    modal.append(getButtons(ok, cancel));

    document.body.append(template);

    return new Promise((resolve, reject) => {
        modal.querySelector('.submit_btn').addEventListener('click', () => {
            resolve(true);
            template.remove();
        });

        if(cancel != null) {
            modal.querySelector('.cancel_btn').addEventListener('click', () => {
                reject(false);
                template.remove();
            });
        }
    });
}

function askForm(inputs, ok, cancel= null) {
    const template = getModalTemplate(true);
    const modal = template.querySelector('.input_fields');
    inputs.forEach(inputData => modal.append(getInput(inputData)));
    modal.append(getButtons(ok, cancel, true));

    document.body.append(template);

    return new Promise((resolve, reject) => {
        template.querySelector('form').addEventListener('submit', function (e) {
            e.preventDefault();
            e.stopPropagation();
            template.remove();
            const formData = new FormData(e.target);
            resolve(Object.fromEntries(formData));
            return false;
        });

        if(cancel === null) {
            return;
        }

        modal.querySelector('.cancel_btn').addEventListener('click', () => {
            template.remove();
            reject(false);
        });
    });
}

function getInput(inputData) {
    const label = createWithClass('label', 'modal_input_label');

    const labelText = document.createElement('span');
    labelText.innerText = inputData.label;
    label.append(labelText);

    const input = createWithClass('input', 'modal_input');
    input.type = inputData.type;
    input.name = inputData.name;
    input.placeholder = inputData.placeholder;
    input.required = true;
    label.append(input);

    return label;
}

function getModalTemplate(isForm=false) {
    const wrapper = createWithClass('div', 'modal_background');
    const modal = createWithClass('div', 'modal');
    wrapper.append(modal);

    if(!isForm) {
        return wrapper;
    }

    const form= createWithClass('form', 'input_fields');
    modal.append(form);
    return wrapper;
}

function getButtons(ok, cancel=null, isForm=false) {
    const wrapper = createWithClass('div', 'modal_buttons');

    const okButton = createWithClass('button', 'submit_btn');
    if(isForm) {
        okButton.type = 'submit';
    }

    okButton.innerText = ok;
    wrapper.append(okButton);

    if(cancel === null) {
        return wrapper;
    }

    const cancelButton = createWithClass('button', 'cancel_btn');
    cancelButton.innerText = cancel;
    wrapper.prepend(cancelButton);
    return wrapper;
}

function createWithClass(tagName, className) {
    const el = document.createElement(tagName);
    el.classList.add(className);
    return el;
}