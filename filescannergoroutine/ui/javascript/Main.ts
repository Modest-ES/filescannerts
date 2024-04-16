import "../css/styles.css";

import DirectoryModel from './DirectoryModel';
import DirectoryController from './DirectoryController';

const model = new DirectoryModel();
const controller = new DirectoryController(model);

controller.loadDirectoryData();
