//import DirectoryModel from './DirectoryModel.js';
import DirectoryView from './DirectoryView.js';

export default class DirectoryController {
    constructor(model) {
        this.model = model;
        this.view = new DirectoryView(this);
    }

    fetchDirectoryData() {
        this.view.displayLoadElement();
        this.model.verifyUrlParameters();
        this.model.fetchData(this.model.constructUrl())
            .then(() => {
                this.view.displayDirectoryData(this.model.data, this.model.getSortParameter());
            });
        this.view.hideLoadElement();
    }

    onBtnBackClicked() {
        const urlParameters = new URLSearchParams(window.location.search);
        const lastSlashIndex = urlParameters.get('root').lastIndexOf('/');
        const parentPath = urlParameters.get('root').substring(0, lastSlashIndex);

        const newUrl = `${window.location.pathname}?root=${parentPath ? parentPath : urlParameters.get('root')}&sort=${urlParameters.get('sort')}`;
        window.history.pushState({ path: newUrl }, '', newUrl);
        this.fetchDirectoryData();
    }

    onBtnSortClicked() {
        const urlParameters = new URLSearchParams(window.location.search);
        let sortParam = urlParameters.get('sort');

        sortParam = sortParam === 'desc' ? 'asc' : 'desc';

        const newUrl = `${window.location.pathname}?root=${urlParameters.get('root')}&sort=${sortParam}`;
        window.history.pushState({ path: newUrl }, '', newUrl);
        this.fetchDirectoryData();
    }

    onFilelineClicked(file) {
        const urlParameters = new URLSearchParams(window.location.search);
            
        const newUrl = `${window.location.pathname}?root=${urlParameters.get('root')}/${file.FileName}&sort=${urlParameters.get('sort')}`;
        window.history.pushState({ path: newUrl }, '', newUrl);
        this.fetchDirectoryData();
    }
}