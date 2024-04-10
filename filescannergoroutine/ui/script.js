function fetchDirectoryData() {
    const urlParameters = new URLSearchParams(window.location.search);
    const rootParameter = urlParameters.get('root');
    fetch(`./files?root=${rootParameter}`)
    .then(response => response.json())
    .then(data => {
        displayDirectoryData(data);
    })
    .catch(error => {
        console.error('Error fetching the directory data : ', error);
    });
}

function displayDirectoryData(data) {
    const mainShellElement = document.getElementById('directory-info');
    mainShellElement.innerHTML = '';

    const headerElement = document.createElement('header');

    const leftSideElement = document.createElement('div');
    leftSideElement.classList.add('left-side');

    const btnBackElement = document.createElement('button');
    btnBackElement.classList.add('btn-back');

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

    const btnSortElement = document.createElement('button');
    btnSortElement.classList.add('btn-sort');

    const btnSortTitleElement = document.createElement('p');
    btnSortTitleElement.textContent = 'Sorting:';

    btnSortElement.appendChild(btnSortTitleElement);

    const btnSortImgElement = document.createElement('img');
    btnSortImgElement.src = 'ui/sortasc.png';
    btnSortImgElement.alt = "asc";
    btnSortImgElement.title = "Ascending";
    btnSortImgElement.width = 20;
    btnSortImgElement.height = 20;

    btnSortElement.appendChild(btnSortImgElement);

    rightSideElement.appendChild(btnSortElement);

    headerElement.appendChild(rightSideElement);

    mainShellElement.appendChild(headerElement);

    const contentElement = document.createElement('div');
    contentElement.classList.add('content');

    data.FilesList.forEach(file => {
        const filelineElement = document.createElement('div');
        filelineElement.classList.add('fileline');

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









    // const filesListElement = document.createElement('ul');
    // data.FilesList.forEach(file => {
    //     const fileElement = document.createElement('li');
    //     fileElement.textContent = `${file.FileType} : ${file.FileName} (${file.FileSizeString})`;
    //     filesListElement.appendChild(fileElement);
    // });
    // mainShellElement.appendChild(filesListElement);

    // const statusElement = document.createElement('p');
    // statusElement.textContent = `Status: ${data.Status}`;
    // mainShellElement.appendChild(statusElement);

    // const errorElement = document.createElement('p');
    // errorElement.textContent = `Error Message: ${data.ErrorMessage}`;
    // mainShellElement.appendChild(errorElement);
}

window.onload = fetchDirectoryData;