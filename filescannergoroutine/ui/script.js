function fetchDirectoryData() {
    const urlParameters = new URLSearchParams(window.location.search);
    const rootParameter = urlParameters.get('root');
    const sortParameter = urlParameters.get('sort');
    let fetchUrl = './files';
    if (rootParameter) {
        fetchUrl += `?root=${rootParameter}`;
    }
    if (sortParameter) {
        fetchUrl += `&sort=${sortParameter}`;
    } else {
        fetchUrl += `&sort=asc`;
    }
    console.log("Fetching URL: ", fetchUrl);

    fetch(fetchUrl)
    .then(response => response.json())
    .then(data => {
        console.log('fetched data: ', data);
        displayDirectoryData(data, sortParameter ? sortParameter : 'asc');
    })
    .catch(error => {
        console.error('Error fetching the directory data : ', error);
    });
}

function displayDirectoryData(data, sortParameter) {
    console.log("Sort = ", sortParameter);
    const mainShellElement = document.getElementById('directory-info');
    mainShellElement.innerHTML = '';

    const headerElement = document.createElement('header');

    const leftSideElement = document.createElement('div');
    leftSideElement.classList.add('left-side');

    const btnBackElement = document.createElement('button');
    btnBackElement.classList.add('btn-back');

    btnBackElement.addEventListener('click', () => {
        const urlParameters = new URLSearchParams(window.location.search);
        const lastSlashIndex = urlParameters.get('root').lastIndexOf('/');
        const parentPath = urlParameters.get('root').substring(0, lastSlashIndex);

        const newUrl = `${window.location.pathname}?root=${parentPath ? parentPath : urlParameters.get('root')}&sort=${urlParameters.get('sort')}`;
        window.history.pushState({ path: newUrl }, '', newUrl);
        fetchDirectoryData();
    });

    const btnBackImg = document.createElement('img');
    btnBackImg.src = 'ui/leftarrow.png';
    btnBackImg.alt = 'Back';
    btnBackImg.title = 'Return to the previous directory';
    btnBackImg.width = 20;
    btnBackImg.height = 20;
    btnBackElement.appendChild(btnBackImg);
    
    leftSideElement.appendChild(btnBackElement);

    const rootpathElement = document.createElement('h2');
    rootpathElement.textContent = `Root: ${data.RootPath}`;
    
    leftSideElement.appendChild(rootpathElement);

    headerElement.appendChild(leftSideElement);

    const rightSideElement = document.createElement('div');
    rightSideElement.classList.add('right-side');

    const loadtimeElement = document.createElement('div');
    loadtimeElement.classList.add('loadtime');

    const loadtimeTitleElement = document.createElement('p');
    loadtimeTitleElement.textContent = 'Loadtime:';

    loadtimeElement.appendChild(loadtimeTitleElement);

    const loadtimeValueElement = document.createElement('p');
    loadtimeValueElement.textContent = data.Duration;
    loadtimeElement.appendChild(loadtimeValueElement);

    rightSideElement.appendChild(loadtimeElement);

    if (data.Status == 0) {
        const btnSortElement = document.createElement('button');
        btnSortElement.classList.add('btn-sort');

        btnSortElement.addEventListener('click', () => {
        const urlParameters = new URLSearchParams(window.location.search);
        let sortParam = urlParameters.get('sort');

        sortParam = sortParam === 'desc' ? 'asc' : 'desc';

        const newUrl = `${window.location.pathname}?root=${urlParameters.get('root')}&sort=${sortParam}`;
        window.history.pushState({ path: newUrl }, '', newUrl);
        fetchDirectoryData();
    });
    
        const btnSortTitleElement = document.createElement('p');
        btnSortTitleElement.textContent = 'Sorting:';
    
        btnSortElement.appendChild(btnSortTitleElement);
    
        const btnSortImgElement = document.createElement('img');
        btnSortImgElement.src = sortParameter == 'asc' ? 'ui/sortasc.png' : 'ui/sortdesc.png';
        btnSortImgElement.alt = sortParameter;
        btnSortImgElement.title = sortParameter == 'asc' ? "Ascending" : "Descending";
        btnSortImgElement.width = 20;
        btnSortImgElement.height = 20;
    
        btnSortElement.appendChild(btnSortImgElement);
    
        rightSideElement.appendChild(btnSortElement);
    }

    headerElement.appendChild(rightSideElement);

    mainShellElement.appendChild(headerElement);

    const contentElement = document.createElement('div');
    contentElement.classList.add('content');

    if (data.Status != 0) {
        const errorElement = document.createElement('div');
        errorElement.classList.add('error-message');
        const errorIconElement = document.createElement('img');
        errorIconElement.src = 'ui/error.png';
        errorIconElement.alt = 'Error';
        errorIconElement.title = data.ErrorMessage;
        errorIconElement.width = 20;
        errorIconElement.height = 20;
        
        errorElement.appendChild(errorIconElement);

        const errorMessageElement = document.createElement('p');
        errorMessageElement.textContent = data.ErrorMessage;

        errorElement.appendChild(errorMessageElement);

        contentElement.appendChild(errorElement);
    }

    data.FilesList.forEach(file => {
        const filelineElement = document.createElement('div');
        filelineElement.classList.add('fileline');
        if (file.FileType == 'Folder') {
            filelineElement.addEventListener('click', () => {
                const urlParameters = new URLSearchParams(window.location.search);
        
                const newUrl = `${window.location.pathname}?root=${urlParameters.get('root')}/${file.FileName}&sort=${urlParameters.get('sort')}`;
                window.history.pushState({ path: newUrl }, '', newUrl);
                fetchDirectoryData();
            });
        }

        const fileTypeElement = document.createElement('div');
        fileTypeElement.classList.add('file-type');
        
        const fileTypeImgElement = document.createElement('img');
        fileTypeImgElement.src = file.FileType == 'Folder' ? 'ui/folder.png' : 'ui/file.png';
        fileTypeImgElement.alt = file.FileType;
        fileTypeImgElement.title = file.FileType;
        fileTypeImgElement.width = 20;
        fileTypeImgElement.height = 20;

        fileTypeElement.appendChild(fileTypeImgElement);

        const fileTypeTitleElement = document.createElement('p');
        fileTypeTitleElement.textContent = file.FileType;

        fileTypeElement.appendChild(fileTypeTitleElement);

        filelineElement.appendChild(fileTypeElement);

        const fileNameElement = document.createElement('p');
        fileNameElement.classList.add('file-name');
        fileNameElement.textContent = file.FileName;

        filelineElement.appendChild(fileNameElement);

        const fileSizeElement = document.createElement('p');
        fileSizeElement.classList.add('file-size');
        fileSizeElement.textContent = file.FileSizeString;

        filelineElement.appendChild(fileSizeElement);

        contentElement.appendChild(filelineElement);
    })

    mainShellElement.appendChild(contentElement);

    const footerElement = document.createElement('footer');
    
    const footerTextElement = document.createElement('p');
    footerTextElement.textContent = '® Rainbowsoft 2024';

    footerElement.appendChild(footerTextElement);

    mainShellElement.appendChild(footerElement);
}

window.onload = fetchDirectoryData;