import "../css/styles.css";
import config from '../../config.json';
import { SortOptions } from "./Main";

console.log(config);

// File структура каждого отдельного файла (или папки) в директории
export interface File {
    FileName: string; // название файла или папки
    FileSize: number; // размер файла или папки
    FileSizeString: string; // размер в строковом формате с указанием единиц измерения
    FileType: string; // тип (файл или папка)
}

// FileScannerData структура всего списка файлов (или папок) в текущей директории
export interface FileScannerData {
    RootPath: string; // путь текущей директории
    Duration: string; // время подсчета размеров папок и файлов в директории
    FilesList: File[]; // список всех файлов и папок в директории
    Status: number; // статус выполнения (0 - без ошибок / >0 - с ошибкой)
    ErrorMessage: string; // сообщение об ошибке при ее наличии
}

// Model обрабатывает внутреннюю логику и алгоритмы взаимодействия с данными
export default class DirectoryModel {
    data: FileScannerData | null;

    // constructor инициализирует экземпляр класса DirectoryModel
    constructor() {
        this.data = null;
    }

    // verifyUrlParameters проверяет наличие значений параметров sort и root в URL и при их отсутствии указывает им стандартные значения: для root указывается /home, для sort указывается asc
    verifyUrlParameters(): void {
        const urlParameters = new URLSearchParams(window.location.search);
        if (!urlParameters.has('sort')) {
            const newUrl = new URL(window.location.href);
            newUrl.searchParams.set('sort', SortOptions.Ascending);
            window.location.href = newUrl.toString();
        }
        if (!urlParameters.has('root')) {
            const newUrl = new URL(window.location.href);
            newUrl.searchParams.set('root', '/home');
            window.location.href = newUrl.toString();
        }
    }

    // getSortParameter возвращает текущее значение параметра sort в URL
    getSortParameter(): string {
        const urlParameters = new URLSearchParams(window.location.search);
        const sortParameter = urlParameters.get('sort');
        if (sortParameter)
            return sortParameter;
        return "";
    }

    // constructUrl создает строку URL с указанием значений параметров sort, root
    constructUrl() : string {
        const urlParameters = new URLSearchParams(window.location.search);
        const sortParameter = urlParameters.get('sort');
        const rootParameter = urlParameters.get('root');
        let url = './files';
        if (rootParameter) {
            url += `?root=${rootParameter}`;
        }
    
        if (sortParameter) {
            url += `&sort=${sortParameter}`;
        } else {
            url += `&sort=${SortOptions.Ascending}`;
        }
        
        return url;
    }

    // fetchData считывает данные по указанному URL и обновляет поле data считанными данными
    async fetchData(url: string): Promise<void> {
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            this.data = data;
        } catch (error) {
            console.error('Ошибка считывания данных из json: ', error);
            throw error;
        }
    }
}