const apiKey = 'JlE5Jldo5Jibnk5O5hTx6XVqsJu4WJ26';

const processLocationCard = async (card: Element) => {
    const links = card.getElementsByTagName('A');
    for (let link of links) {
        const href = (link as HTMLAnchorElement).href;
        if (href.indexOf('/home/launch') !== -1) {
            const u = new URL(href);
            const worldId = u.searchParams.get('worldId');
            if (!worldId) {
                return;
            }
            const instanceId = u.searchParams.get('instanceId');
            if (!instanceId) {
                return;
            }

            // Invite Me Button
            const inviteButton = card.getElementsByClassName('inviteme');
            if (inviteButton.length == 0) {
                const numberFriendsBadge = card.getElementsByClassName('badge-secondary');
                if (numberFriendsBadge.length > 0 && numberFriendsBadge[0] instanceof Element　&& numberFriendsBadge[0].parentElement) {
                    const inviteme = document.createElement('BUTTON');
                    inviteme.classList.add('btn', 'btn-primary', 'btn-sm', 'mx-1', 'inviteme');
                    inviteme.innerText = 'INVITE ME';
                    inviteme.addEventListener('click', async () => {

                        const inviteResp = await fetch('https://vrchat.com/api/1/instances/' + worldId + ':' + instanceId + '/invite?apiKey=' + apiKey, {
                            method: 'POST',
                            credentials: 'include',
                            headers: {
                                'content-type': 'application/json;charset=UTF-8',
                            },
                            body: '{}',
                        });
                        const invite = await inviteResp.json();
                        inviteme.innerHTML = '<span aria-hidden="true" class="fa fa-check"></span>';
                        setTimeout(() => {
                            inviteme.innerText = 'INVITE ME';
                        }, 3000);
                    });

                    numberFriendsBadge[0].parentElement.appendChild(inviteme);
                }

            }


            const instanceResp = await fetch('https://vrchat.com/api/1/instances/' + worldId + ':' + instanceId + '?apiKey=' + apiKey, {
                credentials: 'include',
            });
            const instance = await instanceResp.json();
            if (instance) {
                const userResp = await fetch('https://vrchat.com/api/1/users/' + instance.ownerId + '?apiKey=' + apiKey, {
                    credentials: 'include',
                });
                const user = await userResp.json();


                const exists = card.getElementsByClassName('location-info');

                let isExists = false;
                let locationInfo;
                if (exists.length > 0 && exists[0] instanceof Element) {
                    locationInfo = exists[0] as Element;
                    while (locationInfo.firstChild) {
                        locationInfo.removeChild(locationInfo.firstChild);
                    }
                    isExists = true;
                } else {
                    locationInfo = document.createElement('DIV');
                    locationInfo.classList.add('location-info');
                }

                const ownerLabel = document.createElement('SPAN');
                ownerLabel.classList.add('mr-1');
                ownerLabel.innerText = 'Instance Owner: ';
                locationInfo.appendChild(ownerLabel);

                const ownerLink = document.createElement('A') as HTMLAnchorElement;
                ownerLink.classList.add('mr-2');
                ownerLink.href = 'https://vrchat.com/home/user/' + instance.ownerId;
                ownerLink.innerText = user.displayName;
                locationInfo.appendChild(ownerLink);

                const usersLabel = document.createElement('SPAN');
                usersLabel.classList.add('mr-1');
                usersLabel.innerText = 'Users: ';
                locationInfo.appendChild(usersLabel);

                const usersValue = document.createElement('SPAN');
                usersValue.classList.add('mr-2');
                usersValue.innerText = instance.n_users + '/' + instance.capacity
                locationInfo.appendChild(usersValue);

                const title = card.getElementsByClassName('location-title');
                if (title.length > 0 && title[0] instanceof Element && title[0].parentElement) {
                    title[0].parentElement.insertBefore(locationInfo, title[0].nextSibling);
                }
            }
            break;
        }
    }
}

const main = () => {
    const observer = new MutationObserver(records => {
        for (let record of records) {
            for (const addedNode of record.addedNodes) {
                if (addedNode instanceof HTMLElement) {
                    const cards = addedNode.querySelectorAll('.location-card.size-large');
                    for (let card of cards) {
                        processLocationCard(card);
                    }
                }
            }
        }
    });
    observer.observe(document.documentElement, { childList: true, subtree: true });
}
main();