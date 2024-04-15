// Controller реализует взаимодействие компонентов Model и View
import DirectoryView from './DirectoryView';
import DirectoryModel from './DirectoryModel';

export default class DirectoryController {
    private model: DirectoryModel;
    private view: DirectoryView;

    // constructor инициализирует экземпляр класса DirectoryController
    constructor(model: DirectoryModel) {
        this.model = model;
        this.view = new DirectoryView(this);
    }

    // loadDirectoryData вызывает функции верификации параметров URL, считывания данных по этому URL и отображения считанных данных на HTML странице, отображая на время их выполнения анимации загрузки
    loadDirectoryData(): void {
        this.view.displayLoadElement();
        this.model.verifyUrlParameters();
        this.model.fetchData(this.model.constructUrl())
            .then(() => {
                this.view.displayDirectoryData(this.model.data, this.model.getSortParameter());
            });
        this.view.hideLoadElement();
    }

    // onBtnBackClicked меняет адрес директории в URL на адрес уровнем выше и отображает файлы директории по новому адресу
    onBtnBackClicked(): void {
        const urlParameters = new URLSearchParams(window.location.search);
        const lastSlashIndex = urlParameters.get('root')!.lastIndexOf('/');
        const parentPath = urlParameters.get('root')!.substring(0, lastSlashIndex);

        const newUrl = `${window.location.pathname}?root=${parentPath ? parentPath : urlParameters.get('root')}&sort=${urlParameters.get('sort')}`;
        window.history.pushState({ path: newUrl }, '', newUrl);
        this.loadDirectoryData();
    }

    // onBtnSortClicked меняет значение параметра sort в URL и отображает файлы директории в обратном порядке
    onBtnSortClicked(): void {
        const urlParameters = new URLSearchParams(window.location.search);
        let sortParam = urlParameters.get('sort');

        sortParam = sortParam === 'desc' ? 'asc' : 'desc';

        const newUrl = `${window.location.pathname}?root=${urlParameters.get('root')}&sort=${sortParam}`;
        window.history.pushState({ path: newUrl }, '', newUrl);
        this.loadDirectoryData();
    }

    // onFilelineClicked меняет адрес директории в URL на адрес уровнем ниже с именем нажатой директории и отображает файлы директории по новому адресу
    onFilelineClicked(file: {FileName: string}): void {
        const urlParameters = new URLSearchParams(window.location.search);
            
        const newUrl = `${window.location.pathname}?root=${urlParameters.get('root')}/${file.FileName}&sort=${urlParameters.get('sort')}`;
        window.history.pushState({ path: newUrl }, '', newUrl);
        this.loadDirectoryData();
    }
}