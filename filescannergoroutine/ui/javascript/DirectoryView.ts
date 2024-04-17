import "../css/styles.css";

import DirectoryController from "./DirectoryController";

// View обрабатывает функционал интерфейса пользователя
export default class DirectoryView {
    private controller: DirectoryController;
    private mainShellElement: HTMLElement | null;

    // constructor инициализирует экземпляр класса DirectoryView
    constructor(controller: DirectoryController) {
        this.mainShellElement = document.getElementById('directory-info');
        this.controller = controller;
    }

    // displayLoadElement отображает HTML-элемент с анимацией загрузки
    displayLoadElement(): void {
        // const loadElement = document.getElementById('load-animation');
        // if (loadElement) {
        //     loadElement.style.opacity = '1';
        //     console.log("DISPLAY", loadElement);
        // }
    }

    // hideLoadElement скрывает HTML-элемент с анимацией загрузки
    hideLoadElement(): void {
        // const loadElement = document.getElementById('load-animation');
        // if (loadElement) {
        //     loadElement.style.opacity = '0';
        //     console.log("HIDE", loadElement);
        // }
    }

    // displayDirectoryData отображает на странице header, основную часть и footer
    displayDirectoryData(data: any, sortParameter: string): void {
        if (this.mainShellElement) {
            this.mainShellElement.innerHTML = '';

            const headerElement = this.createHeaderElement(data, sortParameter);
            this.mainShellElement.appendChild(headerElement);

            const contentElement = this.createContentElement(data);
            this.mainShellElement.appendChild(contentElement);

            const footerElement = this.createFooterElement();
            this.mainShellElement.appendChild(footerElement);
        }
    }

    // createHeaderElement отображает левую и правую части header-элемента
    createHeaderElement(data: any, sortParameter: string): HTMLElement {
        const headerElement = document.createElement('header');

        const leftSideElement = this.createLeftSideElement(data, sortParameter);
        headerElement.appendChild(leftSideElement);
        
        const rightSideElement = this.createRightSideElement(data, sortParameter);
        headerElement.appendChild(rightSideElement);

        return headerElement;
    }

    // createLeftSideElement отображает кнопку возвращения на предыдущую директорию и адрес текущей директории
    createLeftSideElement(data: any, sortParameter: string): HTMLElement {
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

        const buttonLinkElement = document.createElement('a');
        buttonLinkElement.classList.add('btn-stats');
        buttonLinkElement.href = `http://localhost:80/uistats.php?root=${data.RootPath}&sort=${sortParameter}`;
        const btnStatsElement = document.createElement('button');
        btnStatsElement.classList.add('btn-back');

        const btnStatsImg = document.createElement('img');
        btnStatsImg.src = 'ui/img/stats.png';
        btnStatsImg.alt = 'Stats';
        btnStatsImg.title = 'Посмотреть статистику';
        btnStatsElement.appendChild(btnStatsImg);
        
        buttonLinkElement.appendChild(btnStatsElement);
        leftSideElement.appendChild(buttonLinkElement);

        const rootpathElement = document.createElement('h2');
        rootpathElement.textContent = `Root: ${data.RootPath}`;
        
        leftSideElement.appendChild(rootpathElement);

        return leftSideElement;
    }

    // createRightSideElement отображает время загрузки данных на странице и кнопку изменения направления сортировки
    createRightSideElement(data: any, sortParameter: string): HTMLElement {
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

    // createContentElement отображает элемент с сообщением об ошибке при ее наличии, либо список строк с данными о файлах
    createContentElement(data: any): HTMLElement {
        const contentElement = document.createElement('div');
        contentElement.classList.add('content');

        if (data.Status != 0) {
            const errorElement = this.createErrorElement(data);
            contentElement.appendChild(errorElement);
        }
        
        if (data.FilesList == null) {
            const nullElement = this.createNullElement();
            contentElement.appendChild(nullElement);
        } else {
            data.FilesList.forEach((file: any) => {
                const filelineElement = this.createFilelineElement(file);
                contentElement.appendChild(filelineElement);
            })
        }
        
        return contentElement;
    }

    // createErrorElement отображает сообщение об ошибке
    createErrorElement(data: any): HTMLElement {
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

    // createNullElement отображает сообщение о том, что директория пустая
    createNullElement(): HTMLElement {
        const nullElement = document.createElement('div');
        nullElement.classList.add('null-element');
        const warningIconElement = document.createElement('img');
        warningIconElement.src = 'ui/img/warning.png';
        warningIconElement.alt = 'Warning';
        warningIconElement.title = "Текущая директория пустая";

        nullElement.appendChild(warningIconElement);

        const nullText = document.createElement('p');
        nullText.textContent = "Текущая директория пустая";
        nullElement.appendChild(nullText);

        return nullElement;
    }

    // createFilelineElement отображает строку с данными о файле
    createFilelineElement(file: any): HTMLElement {
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

    // createFooterElement отображает footer на странице
    createFooterElement(): HTMLElement {
        const footerElement = document.createElement('footer');
        
        const footerTextElement = document.createElement('p');
        footerTextElement.textContent = '® File Scanner 2024';

        footerElement.appendChild(footerTextElement);
        return footerElement;
    }
}