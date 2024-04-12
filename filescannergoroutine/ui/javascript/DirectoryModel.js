export default class DirectoryModel {
    constructor() {
        this.data = null;
    }

    verifyUrlParameters() {
        const urlParameters = new URLSearchParams(window.location.search);

        const loadElement = document.getElementById('load-animation');
        loadElement.style.opacity = 1;
        console.log("DISPLAY", loadElement);
        
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

    getSortParameter() {
        const urlParameters = new URLSearchParams(window.location.search);
        return urlParameters.get('sort');
    }

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

    async fetchData(url) {
        try {
            const response = await fetch(url);
            const data = await response.json();
            this.data = data;

            const loadElement = document.getElementById('load-animation');
            loadElement.style.opacity = 0;
            console.log("HIDE", loadElement);

        } catch (error) {
            console.error('Error fetching the directory data : ', error);
        }
    }
}