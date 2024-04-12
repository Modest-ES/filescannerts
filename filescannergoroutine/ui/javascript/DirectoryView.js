export default class DirectoryView {
    constructor(controller) {
        this.mainShellElement = document.getElementById('directory-info');
        this.controller = controller;
    }

    displayLoadElement() {
        // const loadElement = document.getElementById('load-animation');
        // loadElement.style.opacity = 1;
        // console.log("DISPLAY", loadElement);
    }

    hideLoadElement() {
        // const loadElement = document.getElementById('load-animation');
        // loadElement.style.opacity = 0;
        // console.log("HIDE", loadElement);
    }

    displayDirectoryData(data, sortParameter) {
        this.mainShellElement.innerHTML = '';
        
        const headerElement = this.createHeaderElement(data, sortParameter);
        this.mainShellElement.appendChild(headerElement);

        const contentElement = this.createContentElement(data);
        this.mainShellElement.appendChild(contentElement);
        
        const footerElement = this.createFooterElement();
        this.mainShellElement.appendChild(footerElement);
    }

    createHeaderElement(data, sortParameter) {
        const headerElement = document.createElement('header');

        const leftSideElement = this.createLeftSideElement(data);
        headerElement.appendChild(leftSideElement);
        
        const rightSideElement = this.createRightSideElement(data, sortParameter);
        headerElement.appendChild(rightSideElement);

        return headerElement;
    }

    createLeftSideElement(data) {
        const leftSideElement = document.createElement('div');
        leftSideElement.classList.add('left-side');


        const btnBackElement = document.createElement('button');
        btnBackElement.classList.add('btn-back');
        const urlParameters = new URLSearchParams(window.location.search);
        urlParameters.get('root') == "/home" && btnBackElement.classList.add('blocked-btn');

        btnBackElement.addEventListener('click', () => this.controller.onBtnBackClicked());

        const btnBackImg = document.createElement('img');
        btnBackImg.src = 'ui/img/leftarrow.png';
        btnBackImg.alt = 'Back';
        btnBackImg.title = urlParameters.get('root') == "/home" ? "/home is the main directory" : 'Return to the previous directory';
        btnBackElement.appendChild(btnBackImg);
        
        leftSideElement.appendChild(btnBackElement);

        const rootpathElement = document.createElement('h2');
        rootpathElement.textContent = `Root: ${data.RootPath}`;
        
        leftSideElement.appendChild(rootpathElement);

        return leftSideElement;
    }

    createRightSideElement(data, sortParameter) {
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

            btnSortElement.addEventListener('click', () => this.controller.onBtnSortClicked());
        
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

        return rightSideElement;
    }

    createErrorElement(data) {
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

        return errorElement;
    }

    createFilelineElement(file) {
        const filelineElement = document.createElement('div');
            filelineElement.classList.add('fileline');
            if (file.FileType == 'Folder') {
                filelineElement.addEventListener('click', () => this.controller.onFilelineClicked(file));
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

            return filelineElement;
    }

    createContentElement(data) {
        const contentElement = document.createElement('div');
        contentElement.classList.add('content');

        if (data.Status != 0) {
            const errorElement = this.createErrorElement(data);
            contentElement.appendChild(errorElement);
        }

        data.FilesList.forEach(file => {
            const filelineElement = this.createFilelineElement(file);
            contentElement.appendChild(filelineElement);
        })
        return contentElement;
    }

    createFooterElement() {
        const footerElement = document.createElement('footer');
        
        const footerTextElement = document.createElement('p');
        footerTextElement.textContent = '® File Scanner 2024';

        footerElement.appendChild(footerTextElement);
        return footerElement;
    }
}