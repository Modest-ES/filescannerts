import DirectoryModel from './DirectoryModel.js';
import DirectoryView from './DirectoryView.js';

export default class DirectoryController {
    constructor() {
        this.model = new DirectoryModel();
        this.view = new DirectoryView();

        // this.view.bindSortButtonClick(this.handleSortButtonClick.bind(this));
        // this.view.bindRootPathChange(this.handleRootPathChange.bind(this));

        // this.handleRootPathChange(this.getRootPathFromUrl());
    }

    handleSortButtonClick(sortParameter) {
        const rootPath = this.getRootPathFromUrl();
        this.model.fetchData(rootPath, sortParameter)
            .then(data => this.view.displayData(data));
    }

    handleRootPathChange(rootPath) {
        this.model.fetchData(rootPath, 'asc')
            .then(data => this.view.displayData(data));
    }

    getRootPathFromUrl() {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('root');
    }
}