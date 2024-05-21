function getCookie(name) {
    let matches = document.cookie.match(new RegExp(
        "(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
    ));
    return matches ? decodeURIComponent(matches[1]) : undefined;
}

document.addEventListener('DOMContentLoaded', function() {
    let logLink = document.querySelector('.auth_link');
    let regLink = document.querySelector('.reg_link');
    let loginForm = document.querySelector('.login_form');
    let regForm = document.querySelector('.reg_form');
    let regLine = document.querySelector('.line#reg');
    let loginLine = document.querySelector('.line#login');

    let activeForm = getCookie('activeForm');

    regLink.addEventListener('click', function(e) {
        e.preventDefault();
        loginForm.style.display = 'none';
        regForm.style.display = 'flex';
        logLink.classList.add('inactive');
        regLink.classList.remove('inactive');
        loginLine.classList.add('inactive');
        regLine.classList.remove('inactive');

        document.cookie = `activeForm=registration`;
    });

    logLink.addEventListener('click', function(e) {
        e.preventDefault();
        regForm.style.display = 'none';
        loginForm.style.display = 'flex';
        regLink.classList.add('inactive');
        logLink.classList.remove('inactive');
        regLine.classList.add('inactive');
        loginLine.classList.remove('inactive');

        document.cookie = `activeForm=authorization`;
    });

    document.querySelector('.reg_form input[name=password]').addEventListener('change', onPasswordFieldChange);
    document.querySelector('.reg_form input[name=password-confirm]').addEventListener('change', onPasswordFieldChange);

    if (activeForm !== 'registration') {
        logLink.click();
    }

    document.querySelector('.reg_form').addEventListener('submit', function (e) {
        e.preventDefault();
        trySendForm(e.target, '/register', 'Вы успешно зарегистрировались!', 'Имя пользователя или почта уже заняты!');
    });

    document.querySelector('.login_form').addEventListener('submit', function (e) {
        e.preventDefault();
        trySendForm(e.target, '/login', null, 'Некоррректные данные входа!');
    });
});

function onPasswordFieldChange() {
    const password = document.querySelector('.reg_form input[name=password]');
    const confirm = document.querySelector('.reg_form input[name=password-confirm]');
    if(password.value === confirm.value) {
        confirm.setCustomValidity('');
    } else {
        confirm.setCustomValidity('Пароли не совпадают');
    }
}

function trySendForm(form, path, ok=null, error=null) {
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
                if (ok === null) {
                    location.reload();
                    return;
                }

                ask(ok, 'Ok').then(() => {
                    location.reload();
                });
            } else {
                ask(error, 'Ok');
            }
        });
}
