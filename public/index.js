const perPageOptions = [10, 25, 50, 100];
let currentPage = 1;
let perPage = perPageOptions[0];

function searchUser() {
    const username = document.getElementById('usernameInput').value;
    if (!username) {
        alert('Please enter a GitHub username.');
        return;
    }

    showLoading();

    // API endpoint for user details
    const userApiUrl = `https://api.github.com/users/${username}`;

    // API endpoint for public repositories of a user
    const repoApiUrl = `https://api.github.com/users/${username}/repos?per_page=${perPage}&page=${currentPage}`;

    // jQuery for AJAX request for user details
    $.ajax({
        url: userApiUrl,
        method: 'GET',
        success: function (userData) {
            // jQuery for AJAX request for repositories
            $.ajax({
                url: repoApiUrl,
                method: 'GET',
                success: function (repoData) {
                    displayUserDetails(userData);
                    displayRepositories(repoData, userData);
                    hideLoading();
                },
                error: function (repoError) {
                    console.error('Error fetching repositories:', repoError);
                    hideLoading();
                }
            });
        },
        error: function (userError) {
            console.error('Error fetching user details:', userError);
            hideLoading();
        }
    });
}

function displayUserDetails(userData) {
    const userDetailsContainer = document.getElementById('userDetails');
    userDetailsContainer.innerHTML = '';

    const userDiv = document.createElement('div');
    userDiv.classList.add('user-details');

    const repoSearchDiv = document.createElement('div');
    repoSearchDiv.classList.add('repo-search-container');

    repoSearchDiv.innerHTML = `
        <input type="text" id="repoNameSearchInput" class="search-input" placeholder="Search Repositories by Name (use exact name)...">
        <button id="repo-search" class="search-button">Search</button>
    `;

    const avatarDiv = document.createElement('div');
    avatarDiv.innerHTML = `<img src="${userData.avatar_url}" alt="User Avatar" class="user-avatar">`;
    userDiv.appendChild(avatarDiv);

    const userInfoDiv = document.createElement('div');
    userInfoDiv.classList.add('user-info');
    userInfoDiv.innerHTML = `
        <p class="user-name">${userData.name || 'Name not available'}</p>
        <p>${userData.bio || 'No bio available.'}</p>
        <p class="social-wrapper">
            <img width="17px" src="icons/location.png" alt="link">
            ${userData.location || 'No location available.'}
        </p>
        <p class="social-wrapper">
            <img width="17px" src="icons/github.png" alt="link">
            <a href="${userData.html_url}" target="_blank">${userData.html_url}</a>
        </p>
    `;

    if (userData.twitter_username) {
        const twitterUrl = `https://twitter.com/${userData.twitter_username}`;
        userInfoDiv.innerHTML += `
            <p class="social-wrapper">
                <img width="17px" src="icons/twitter.png" alt="link">
                <a href="${twitterUrl}" target="_blank">${twitterUrl}</a>
            </p>
        `;
    } else {
        userInfoDiv.innerHTML += `
            <p class="social-wrapper">
                <img width="17px" src="icons/twitter.png" alt="link">
                Not available
            </p>
        `;
    }

    userDiv.appendChild(userInfoDiv);

    userDetailsContainer.appendChild(userDiv);
    userDetailsContainer.appendChild(repoSearchDiv);
}

function displayRepositories(repoData, userData) {
    const repositoriesContainer = document.getElementById('repositories');

    repositoriesContainer.innerHTML = '';
    
    const repoNameSearchButton = document.getElementById('repo-search');
    repoNameSearchButton.addEventListener('click', () => {
        filterRepositoriesByName(repoData, userData);
    });
    
    repoData.forEach(repo => {
        const repoCardDiv = document.createElement('div');
        repoCardDiv.classList.add('repo-card');

        repoCardDiv.innerHTML += `
            <div class="repo-name-wrapper">
                <p class="repo-name">${repo.name}</p>
                <a href="${repo.html_url}" target="_blank">
                    <img width="15px" src="icons/link.png" alt="link">
                </a>
            </div>
            <p class="repo-description">${repo.description || 'No description available.'}</p>
            <p class="repo-topics">Topic: ${repo.topics.join(', ') || 'Not specified'}</p>
        `;

        repositoriesContainer.appendChild(repoCardDiv);
    });


    // Pagination buttons
    const paginationContainer = document.getElementById('pagination');
    paginationContainer.innerHTML = '';

    const totalPages = Math.ceil(userData.public_repos / perPage);

    const prevButton = createPaginationButton('Previous', () => {

        if (currentPage > 1) {
            currentPage--;
            searchUser();
        }

        if(currentPage === 1) {
            prevButton.disabled = true;
        }
    });
    paginationContainer.appendChild(prevButton);

    const nextButton = createPaginationButton('Next', () => {

        if (currentPage < totalPages) {
            currentPage++;
            searchUser();
        }

        if(currentPage === totalPages) {
            nextButton.disabled = true;
        }
    });
    paginationContainer.appendChild(nextButton);

    // Per page options
    const perPageSelect = document.createElement('select');
    perPageSelect.addEventListener('change', (event) => {
        perPage = parseInt(event.target.value);
        currentPage = 1;
        searchUser();
    });

    perPageOptions.forEach(option => {
        const optionElement = document.createElement('option');
        optionElement.value = option;
        optionElement.text = option;
        perPageSelect.appendChild(optionElement);
    });

    perPageSelect.value = perPage;
    paginationContainer.appendChild(perPageSelect);
}

function createPaginationButton(text, clickHandler) {
    const button = document.createElement('button');
    button.textContent = text;
    button.classList.add('pagination-button');
    button.addEventListener('click', clickHandler);
    return button;
}

function showLoading() {
    document.getElementById('loading').style.display = 'block';
    document.getElementById('inner').style.display = 'none';
}

function hideLoading() {
    document.getElementById('loading').style.display = 'none';
    document.getElementById('inner').style.display = 'block';
}

// function for filtering repo by name
function filterRepositoriesByName(repoData, userData) {
    const repoNameSearchInput = document.getElementById('repoNameSearchInput');
    const filterValue = repoNameSearchInput.value.toLowerCase();
    const filteredRepos = repoData.filter(repo => repo.name.toLowerCase().includes(filterValue));
    displayRepositories(filteredRepos, userData);
}