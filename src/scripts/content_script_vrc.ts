const apiKey = 'JlE5Jldo5Jibnk5O5hTx6XVqsJu4WJ26';

type ErrorMessage = {
    message: string;
    status_code: number;
};
type ErrorResponse = {
    error: ErrorMessage;
};

const processLocationCard = async (card: Element, worldID: string, instanceID: string) => {
    const usersBox = card.querySelector<HTMLDivElement>('div:has(>svg[data-icon="users"])');
    if (!usersBox) {
        return;
    }
    usersBox.style.display = 'none';

    // インスタンス内のフレンド人数
    let friendCount = 0;
    for (const child of usersBox.childNodes) {
        if (child instanceof Text && child.textContent) {
            friendCount = parseInt(child.textContent);
        }
    }

    let instance = undefined;
    let instanceOwner = undefined;
    try {
        const instanceResp = await fetch(`https://vrchat.com/api/1/instances/${worldID}:${instanceID}?apiKey=${apiKey}`, {
            credentials: 'include',
        });
        instance = await instanceResp.json();
        if (instance.ownerId) {
            const userResp = await fetch(`https://vrchat.com/api/1/users/${instance.ownerId}?apiKey=${apiKey}`, {
                credentials: 'include',
            });
            instanceOwner = await userResp.json();
        }
    } catch (err) {
        console.error(err);
    }

    // ユーザ数更新
    let vfpUsersBox = card.querySelector<HTMLDivElement>('div[data-vfp="users"]');
    if (vfpUsersBox) {
        // 一度消す
        while (vfpUsersBox.firstChild) {
            vfpUsersBox.removeChild(vfpUsersBox.firstChild);
        }
    } else {
        vfpUsersBox = document.createElement('div');
        vfpUsersBox.setAttribute('data-vfp', 'users');
        vfpUsersBox.classList.add('align-self-end', 'me-0', 'me-sm-2', 'align-items-center');
        vfpUsersBox.style.display = 'flex';
        vfpUsersBox.style.borderRadius = '4px';
        vfpUsersBox.style.backgroundColor = 'rgb(24, 27, 31)';
        vfpUsersBox.style.padding = '7px 1rem';
        vfpUsersBox.style.whiteSpace = 'nowrap';

        usersBox.parentElement?.insertBefore(vfpUsersBox, usersBox.nextSibling);
    }
    vfpUsersBox.appendChild(document.createTextNode(`${friendCount} / ${instance.n_users}`));

    const userIcon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    userIcon.classList.add('ms-2');
    userIcon.setAttribute('width', '24');
    userIcon.setAttribute('height', '24');
    userIcon.setAttribute('viewBox', '0 0 640 512');
    userIcon.style.color = '#8f8f8d';
    userIcon.innerHTML = `<title>Number of friends in the Instance / Number of users in the Instance</title><path fill="currentColor" d="M319.9 320c57.41 0 103.1-46.56 103.1-104c0-57.44-46.54-104-103.1-104c-57.41 0-103.1 46.56-103.1 104C215.9 273.4 262.5 320 319.9 320zM369.9 352H270.1C191.6 352 128 411.7 128 485.3C128 500.1 140.7 512 156.4 512h327.2C499.3 512 512 500.1 512 485.3C512 411.7 448.4 352 369.9 352zM512 160c44.18 0 80-35.82 80-80S556.2 0 512 0c-44.18 0-80 35.82-80 80S467.8 160 512 160zM183.9 216c0-5.449 .9824-10.63 1.609-15.91C174.6 194.1 162.6 192 149.9 192H88.08C39.44 192 0 233.8 0 285.3C0 295.6 7.887 304 17.62 304h199.5C196.7 280.2 183.9 249.7 183.9 216zM128 160c44.18 0 80-35.82 80-80S172.2 0 128 0C83.82 0 48 35.82 48 80S83.82 160 128 160zM551.9 192h-61.84c-12.8 0-24.88 3.037-35.86 8.24C454.8 205.5 455.8 210.6 455.8 216c0 33.71-12.78 64.21-33.16 88h199.7C632.1 304 640 295.6 640 285.3C640 233.8 600.6 192 551.9 192z"/>`;
    vfpUsersBox.appendChild(userIcon);

    // Instance Owner表示
    if (instanceOwner) {
        let vfpOwnerBox = card.querySelector<HTMLDivElement>('div[data-vfp="owner"]');
        if (vfpOwnerBox) {
            // 一度消す
            while (vfpOwnerBox.firstChild) {
                vfpOwnerBox.removeChild(vfpOwnerBox.firstChild);
            }
        } else {
            vfpOwnerBox = document.createElement('div');
            vfpOwnerBox.setAttribute('data-vfp', 'owner');
            vfpOwnerBox.classList.add('align-self-end', 'me-0', 'me-sm-2', 'align-items-center');
            vfpOwnerBox.style.display = 'flex';
            vfpOwnerBox.style.borderRadius = '4px';
            vfpOwnerBox.style.backgroundColor = 'rgb(24, 27, 31)';
            vfpOwnerBox.style.padding = '7px 1rem';
            vfpOwnerBox.style.whiteSpace = 'nowrap';
            vfpUsersBox.parentElement?.insertBefore(vfpOwnerBox, vfpUsersBox.nextSibling);
        }
        const ownerLink = document.createElement('A') as HTMLAnchorElement;
        ownerLink.classList.add('mr-2');
        ownerLink.href = 'https://vrchat.com/home/user/' + instanceOwner.id;
        ownerLink.innerText = instanceOwner.displayName;
        vfpOwnerBox.appendChild(ownerLink);


        const ownerIcon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        ownerIcon.classList.add('ms-2');
        ownerIcon.setAttribute('width', '24');
        ownerIcon.setAttribute('height', '24');
        ownerIcon.setAttribute('viewBox', '0 0 24 24');
        ownerIcon.style.color = '#8f8f8d';
        ownerIcon.innerHTML = `<title>Instance Owner</title><path fill="currentColor" d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5m14 3c0 .6-.4 1-1 1H6c-.6 0-1-.4-1-1v-1h14v1Z"/>`;
        vfpOwnerBox.appendChild(ownerIcon);
    }
}

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

const processAnchor = (anchor: HTMLAnchorElement) => {
    if (anchor.href.indexOf('https://vrchat.com/home/launch') === -1) {
        return;
    }
    const isLocations = anchor.closest('.locations') !== null;
    const el = anchor.parentElement?.parentElement?.parentElement?.parentElement;
    const u = new URL(anchor.href);
    const worldID = u.searchParams.get('worldId');
    const instanceID = u.searchParams.get('instanceId');
    if (isLocations && worldID && instanceID && el) {
        processLocationCard(el, worldID, instanceID);
    }
}


const main = () => {
    const observer = new MutationObserver(records => {
        const isWorldPage = window.location.href.indexOf('https://vrchat.com/home/world/wrld_') === 0;
        const isLaunchPage = window.location.href.indexOf('https://vrchat.com/home/launch') === 0;
        for (let record of records) {
            for (const addedNode of record.addedNodes) {
                if (addedNode instanceof HTMLAnchorElement) {
                    processAnchor(addedNode);
                } else if (addedNode instanceof HTMLElement) {
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
                    } else {
                        const anchors = addedNode.querySelectorAll<HTMLAnchorElement>('A');
                        for (const anchor of anchors) {
                            processAnchor(anchor);
                        }
                    }
                }
            }
        }
    });
    observer.observe(document.documentElement, { childList: true, subtree: true });
}
main();