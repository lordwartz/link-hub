function ask(message, ok, cancel = null) {
    const template = getModalTemplate();
    const modal = template.querySelector('.input_fields');

    const messageEl = document.createElement('span');
    messageEl.innerText = message;
    messageEl.style.textAlign = 'center';

    modal.append(messageEl);
    modal.append(getButtons(ok, cancel));

    document.body.append(template);

    return new Promise((resolve, reject) => {
        modal.querySelector('.submit_btn').focus({focusVisible: false});

        template.querySelector('form').addEventListener('submit', function (e) {
            e.preventDefault();
            e.stopPropagation();
            resolve(true);
            template.remove();
            return false;
        });

        template.addEventListener('click', (e) => {
            if (e.currentTarget === e.target) {
                template.remove();
            }
        });

        if (cancel != null) {
            modal.querySelector('.cancel_btn').addEventListener('click', () => {
                reject(false);
                template.remove();
            });
        }
    });
}

function askForm(inputs, ok, cancel = null) {
    const template = getModalTemplate();
    const modal = template.querySelector('.input_fields');
    inputs.forEach(inputData => modal.append(getInput(inputData)));
    modal.append(getButtons(ok, cancel));

    document.body.append(template);

    return new Promise((resolve, reject) => {
        modal.querySelector('.modal_input').focus();

        template.querySelector('form').addEventListener('submit', function (e) {
            e.preventDefault();
            e.stopPropagation();
            template.remove();
            const formData = new FormData(e.target);
            resolve(Object.fromEntries(formData));
            return false;
        });

        template.addEventListener('click', (e) => {
            if (e.currentTarget === e.target) {
                template.remove();
            }
        });

        if (cancel === null) {
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

function getModalTemplate() {
    const wrapper = createWithClass('div', 'modal_background');
    const modal = createWithClass('div', 'modal');
    wrapper.append(modal);
    const form = createWithClass('form', 'input_fields');
    modal.append(form);
    return wrapper;
}

function getButtons(ok, cancel = null) {
    const wrapper = createWithClass('div', 'modal_buttons');

    const okButton = createWithClass('button', 'submit_btn my_button');
    okButton.type = 'submit';

    okButton.innerText = ok;
    wrapper.append(okButton);

    if (cancel === null) {
        return wrapper;
    }

    const cancelButton = createWithClass('button', 'cancel_btn my_button');
    cancelButton.innerText = cancel;
    cancelButton.type = 'button';
    wrapper.prepend(cancelButton);
    return wrapper;
}

function createWithClass(tagName, className) {
    const el = document.createElement(tagName);
    const classList = className.split(' ');
    for (const itemClass of classList) {
        el.classList.add(itemClass);
    }
    return el;
}