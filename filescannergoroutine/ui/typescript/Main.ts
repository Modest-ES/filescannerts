import "../css/styles.css";

import DirectoryModel from './DirectoryModel';
import DirectoryController from './DirectoryController';

// SortOptions - варианты сортировки списка файлов в директории
export enum SortOptions {
    Ascending = 'asc', // по возрастанию
    Descending = 'desc' // по убыванию
}

const model = new DirectoryModel();
const controller = new DirectoryController(model);
controller.loadDirectoryData();
