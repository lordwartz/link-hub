document.addEventListener("DOMContentLoaded", () => {
    handleToHomepageClick();
    addListenerToBackButton();
    addItemListenerToSideNavBtn();
    const itemContainer = document.querySelector('#settings_quick_menu');
    let editProfile = document.querySelector('#edit_profile');
    let securitySettings = document.querySelector('#security_settings');
    const contentHeader = document.querySelector('.content_header span');

    itemContainer.addEventListener('click', function(event) {
        const group = event.target.closest('.group');
        const url = group.dataset.url;
        if (url.includes('edit')) {
            securitySettings.style.display = 'none';
            editProfile.style.display = 'flex';
            contentHeader.textContent = 'Редактирование профиля';
        } else {
            editProfile.style.display = 'none';
            securitySettings.style.display = 'flex';
            contentHeader.textContent = 'Безопасность';
        }
    });

    document.querySelector('.edit_form').addEventListener('submit', function(e)  {
        e.preventDefault();
        trySendForm(e.target, '/change_creds', 'Данные успешно изменены!', 'Пользователь с такими данными уже сщуествует!');
    });

    document.querySelector('.edit_password_form').addEventListener('submit', function(e)  {
        e.preventDefault();
        trySendForm(e.target, '/change_pass', 'Пароль успешно изменен!', 'Не удалось сменить пароль!');
    });

    document.querySelector('.edit_password_form input[name=password]').addEventListener('change', onPasswordFieldChange);
    document.querySelector('.edit_password_form input[name=password-confirm]').addEventListener('change', onPasswordFieldChange);

    document.querySelector('.delete_account_btn').addEventListener('click', () =>{
        ask('Вы точно хотите удалить аккаунт?', 'Да', 'Нет')
            .then(() => {
                return fetch('/delete_account', {
                    method: 'POST',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({confirm: true})
                })
            })
            .then(() => {
                return ask('Аккаунт был упешно удален! Возвращайтесь скорее!', 'Ok');
            })
            .then(() => {
                location.reload();
            })
    });
})

function trySendForm(form, path, ok, error) {
    let formData = new FormData(form);
    const sendData = Object.fromEntries(formData);

    fetch(path, {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(sendData)
    })
        .then((response) => {
            if(response.status === 200) {
                ask(ok, 'Ok').then(() => {
                    location.reload();
                });
            } else {
                ask(error, 'Ok');
            }
        });
}

function onPasswordFieldChange() {
    const password = document.querySelector('.edit_password_form input[name=password]');
    const confirm = document.querySelector('.edit_password_form input[name=password-confirm]');
    if(password.value === confirm.value) {
        confirm.setCustomValidity('');
    } else {
        confirm.setCustomValidity('Пароли не совпадают');
    }
}