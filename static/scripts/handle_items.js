function deleteItem(item) {
    item.remove();
    console.log('Delete item:', item);
}

function addItemListenerToContainer(container) {
    const containerName = `.${container}`;
    const itemContainer = document.querySelector(containerName);

    itemContainer.addEventListener('click', function (event) {
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
            let hash = item.dataset.url;
            console.log('Redirect to ' + hash);
            window.location.href = `/group/${hash}`;
        }
    });
}
