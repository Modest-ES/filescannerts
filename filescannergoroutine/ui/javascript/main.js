import DirectoryModel from './DirectoryModel.js';
import DirectoryController from './DirectoryController.js';

const model = new DirectoryModel();
const controller = new DirectoryController(model);

controller.loadDirectoryData();
