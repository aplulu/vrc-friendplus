const apiKey = 'JlE5Jldo5Jibnk5O5hTx6XVqsJu4WJ26';
const doneMarkClassName = 'vrc-friendplus-done-mark';

type ErrorMessage = {
    message: string;
    status_code: number;
};
type ErrorResponse = {
    error: ErrorMessage;
};

const processLocationCard = async (card: Element) => {
    // prevent mutation infinite loop
    if (card.classList.contains(doneMarkClassName)) {
        return;
    }
    const link = card.querySelector<HTMLAnchorElement>('a[href*="/home/launch"]');
    if (!link) {
        return;
    }
    card.classList.add(doneMarkClassName);
    const href = link.href;
    const u = new URL(href);
    const worldId = u.searchParams.get('worldId');
    if (!worldId) {
        return;
    }
    const instanceId = u.searchParams.get('instance');
    if (!instanceId) {
        return;
    }

    const instanceResp = await fetch('https://vrchat.com/api/1/instances/' + worldId + ':' + instanceId + '?apiKey=' + apiKey, {
        credentials: 'include',
    });
    const instance = await instanceResp.json();
    if (instance) {
        let owner;
        if (instance.ownerId) {
            const userResp = await fetch('https://vrchat.com/api/1/users/' + instance.ownerId + '?apiKey=' + apiKey, {
                credentials: 'include',
            });
            owner = await userResp.json();
        }

        const exists = card.getElementsByClassName('location-info');

        let locationInfo;
        if (exists.length > 0 && exists[0] instanceof Element) {
            locationInfo = exists[0] as Element;
            while (locationInfo.firstChild) {
                locationInfo.removeChild(locationInfo.firstChild);
            }
        } else {
            locationInfo = document.createElement('DIV');
            locationInfo.classList.add('location-info');
        }

        if (owner) {
            const ownerLabel = document.createElement('SPAN');
            ownerLabel.classList.add('mr-1');
            ownerLabel.innerText = 'Instance Owner: ';
            locationInfo.appendChild(ownerLabel);

            const ownerLink = document.createElement('A') as HTMLAnchorElement;
            ownerLink.classList.add('mr-2');
            ownerLink.href = 'https://vrchat.com/home/user/' + instance.ownerId;
            ownerLink.innerText = owner.displayName;
            locationInfo.appendChild(ownerLink);
        }

        const usersLabel = document.createElement('SPAN');
        usersLabel.classList.add('mr-1');
        usersLabel.innerText = 'Users: ';
        locationInfo.appendChild(usersLabel);

        const usersValue = document.createElement('SPAN');
        usersValue.classList.add('mr-2');
        usersValue.innerText = instance.n_users + '/' + instance.capacity
        locationInfo.appendChild(usersValue);

        link.parentElement?.insertBefore(locationInfo, link.nextSibling);
    }
};

const createAddFavoriteButton = (worldId: string): HTMLElement => {
    const favoriteIcon = document.createElement('SPAN');
    favoriteIcon.ariaHidden = 'true';
    favoriteIcon.classList.add('fa', 'fa-star', 'mr-2');
    favoriteIcon.style.color = '#54b5c5';

    const favoriteButton = document.createElement('BUTTON');
    favoriteButton.style.background = 'none';
    favoriteButton.style.border = 'none';
    favoriteButton.style.padding = '0px';
    favoriteButton.style.font = 'inherit';
    favoriteButton.style.color = 'inherit';
    favoriteButton.style.cursor = 'pointer';
    favoriteButton.appendChild(favoriteIcon);
    favoriteButton.appendChild(document.createTextNode('Add to Favorite'));

    favoriteButton.addEventListener('click', async () => {
        const overlay = document.createElement('DIV');
        overlay.id = '_vrc_friendplus_overlay';
        overlay.style.position = 'fixed';
        overlay.style.left = '0px';
        overlay.style.top = '0px';
        overlay.style.width = '100%';
        overlay.style.height = '100%';
        overlay.style.zIndex = '2000';
        overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
        overlay.addEventListener('click', () => {
            document.body.removeChild(overlay);
        });
        const card = document.createElement('DIV');
        card.classList.add('card');
        card.style.transform = 'translate(-50%, -50%)';
        card.style.position = 'absolute';
        card.style.top = '50%';
        card.style.left = '50%';
        card.style.width = '500px';
        card.addEventListener('click', (e) => {
            e.stopPropagation();
        });
        overlay.appendChild(card);

        const cardTitle = document.createElement('H3');
        cardTitle.classList.add('card-header');
        cardTitle.innerText = 'CHOOSE A PLAYLIST';
        card.appendChild(cardTitle);

        const cardBody = document.createElement('DIV');
        cardBody.classList.add('card-body');
        card.appendChild(cardBody);

        const groups = await (await fetch('https://vrchat.com/api/1/favorite/groups?n=50&apiKey=' + apiKey, {
            credentials: 'include',
        })).json();

        const form = document.createElement('FORM') as HTMLFormElement;
        cardBody.appendChild(form);

        const ul = document.createElement('UL');
        ul.style.listStyle = 'none';
        form.appendChild(ul);

        for (const group of groups) {
            if (group.type != 'world') {
                continue;
            }

            const li = document.createElement('LI');
            const input = document.createElement('INPUT') as HTMLInputElement;
            input.classList.add('form-check-input');
            input.type = 'radio';
            input.name = 'favorite_group_id';
            input.value = group.name;
            input.id = group.id;
            li.appendChild(input);

            const label = document.createElement('LABEL') as HTMLLabelElement;
            label.setAttribute('for', group.id);
            label.innerText = group.displayName;
            li.appendChild(label);

            ul.appendChild(li);
        }

        const messageArea = document.createElement('DIV');
        form.appendChild(messageArea)

        const addButton = document.createElement('BUTTON') as HTMLButtonElement
        addButton.classList.add('btn', 'btn-primary', 'mr-2');
        addButton.innerText = 'ADD';
        addButton.type = 'BUTTON';
        addButton.addEventListener('click', async () => {
            const groupName = form.favorite_group_id.value;
            if (groupName) {
                addButton.disabled = true;

                const resp = await (await fetch('https://vrchat.com/api/1/favorites?apiKey=' + apiKey, {
                    method: 'POST',
                    credentials: 'include',
                    headers: {
                        'content-type': 'application/json;charset=UTF-8',
                    },
                    body: JSON.stringify({
                        type: 'world',
                        favoriteId: worldId,
                        tags: [groupName],
                    }),
                }));

                if (resp.status == 200) {
                    document.body.removeChild(overlay);
                } else {
                    let message = 'Failed to add to favorites.';
                    try {
                        const result = await resp.json() as ErrorResponse;
                        if (result.error && result.error.message) {
                            message = result.error.message;
                        }
                    } catch (e) {
                        // ignored
                    }

                    while (messageArea.firstChild != null) {
                        messageArea.removeChild(messageArea.firstChild);
                    }
                    const span = document.createElement('SPAN');
                    span.style.color = 'red';
                    span.innerText = message;
                    messageArea.appendChild(span);
                    addButton.disabled = false;
                }
            }
        });
        form.appendChild(addButton);

        const closeButton = document.createElement('BUTTON') as HTMLButtonElement
        closeButton.classList.add('btn', 'btn-secondary');
        closeButton.innerText = 'CLOSE';
        closeButton.addEventListener('click', () => {
            document.body.removeChild(overlay);
        });
        form.appendChild(closeButton);



        document.body.appendChild(overlay);
    });

    return favoriteButton;
};

const processWorldNode = async (node: Element) => {
    const worldId = location.href.substr(30);
    const twitterButton = node.querySelector<HTMLButtonElement>('[aria-label=twitter]');
    if (!worldId || !twitterButton) {
        return;
    }

    const container = document.createElement('DIV');
    container.classList.add('d-flex', 'align-items-center');
    const separator = document.createElement('DIV');
    separator.style.height = '10px';
    separator.style.width ='1px';
    separator.style.backgroundColor = 'rgba(255, 255, 255, 0.5)';
    separator.style.margin = '0 0.8rem';
    container.appendChild(separator);

    container.appendChild(createAddFavoriteButton(worldId));

    node.appendChild(container);
};

const processLaunchNode = async (node: Element) => {
    const u = new URL(location.href);
    const worldId = u.searchParams.get('worldId');
    if (!worldId) {
        return;
    }

    const container = document.createElement('DIV');
    container.classList.add('d-inline-flex', 'align-items-center');
    container.style.verticalAlign = 'top';
    container.style.marginTop = '8px';

    const separator = document.createElement('DIV');
    separator.style.height = '10px';
    separator.style.width ='1px';
    separator.style.backgroundColor = 'rgba(255, 255, 255, 0.5)';
    separator.style.margin = '0 0.8rem';
    container.appendChild(separator);

    container.appendChild(createAddFavoriteButton(worldId));

    node.appendChild(container);
};

const main = () => {
    const observer = new MutationObserver(records => {
        const isWorldPage = window.location.href.indexOf('https://vrchat.com/home/world/wrld_') === 0;
        const isLaunchPage = window.location.href.indexOf('https://vrchat.com/home/launch') === 0;
        const cards = document.querySelectorAll('.locations > div');
        for (let record of records) {
            for (const addedNode of record.addedNodes) {
                if (addedNode instanceof HTMLElement) {
                    for (const card of cards) {
                        if (card.contains(addedNode)) {
                            processLocationCard(card);
                        }
                    }

                    // World Button Group
                    if (isWorldPage) {
                        const nodes = addedNode.querySelectorAll('div[role=region]');
                        for (const node of nodes) {
                            processWorldNode(node)
                        }
                    } else if (isLaunchPage) {
                        const nodes = addedNode.querySelectorAll('.card-body.d-flex > .w-100');
                        for (const node of nodes) {
                            processLaunchNode(node)
                        }
                    }
                }
            }
        }
    });
    observer.observe(document.documentElement, { childList: true, subtree: true });
}
main();
