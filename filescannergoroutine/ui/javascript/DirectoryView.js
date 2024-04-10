export default class DirectoryView {
    constructor() {
        this.mainShellElement = document.getElementById('directory-info');
    }

    displayDirectoryData(data, sortParameter) {
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
        btnBackImg.src = 'ui/img/leftarrow.png';
        btnBackImg.alt = 'Back';
        btnBackImg.title = 'Return to the previous directory';
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
            btnSortImgElement.src = sortParameter == 'asc' ? 'ui/img/sortasc.png' : 'ui/img/sortdesc.png';
            btnSortImgElement.alt = sortParameter;
            btnSortImgElement.title = sortParameter == 'asc' ? "Ascending" : "Descending";
        
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
            errorIconElement.src = 'ui/img/error.png';
            errorIconElement.alt = 'Error';
            errorIconElement.title = data.ErrorMessage;
            
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
            fileTypeImgElement.src = file.FileType == 'Folder' ? 'ui/img/folder.png' : 'ui/img/file.png';
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
}