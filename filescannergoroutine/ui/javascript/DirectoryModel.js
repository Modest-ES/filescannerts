// Model обрабатывает внутреннюю логику и алгоритмы взаимодействия с данными
export default class DirectoryModel {
    // constructor инициализирует экземпляр класса DirectoryModel
    constructor() {
        this.data = null;
    }

    // verifyUrlParameters проверяет наличие значений параметров sort и root в URL и при их отсутствии указывает им стандартные значения: для root указывается /home, для sort указывается asc
    verifyUrlParameters() {
        const urlParameters = new URLSearchParams(window.location.search);
        
        if (!urlParameters.has('sort')) {
            const newUrl = new URL(window.location.href);
            newUrl.searchParams.set('sort', 'asc');
            window.location.href = newUrl.toString();
        }
        if (!urlParameters.has('root')) {
            const newUrl = new URL(window.location.href);
            newUrl.searchParams.set('root', '/home');
            window.location.href = newUrl.toString();
        }
    }

    // getSortParameter возвращает текущее значение параметра sort в URL
    getSortParameter() {
        const urlParameters = new URLSearchParams(window.location.search);
        return urlParameters.get('sort');
    }

    // constructUrl создает строку URL с указанием значений параметров sort, root
    constructUrl() {
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
            url += `&sort=asc`;
        }
        
        return url;
    }

    // fetchData считывает данные по указанному URL и обновляет поле data считанными данными
    async fetchData(url) {
        try {
            const response = await fetch(url);
            const data = await response.json();
            this.data = data;

        } catch (error) {
            console.error('Error fetching the directory data : ', error);
        }
    }
}