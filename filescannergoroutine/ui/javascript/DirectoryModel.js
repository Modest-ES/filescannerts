export default class DirectoryModel {
    constructor() {
        this.data = null;
    }

    fetchData(rootPath, sortParameter) {
        return fetch(`./files?root=${rootPath}&sort=${sortParameter}`)
            .then(response => response.json())
            .then(data => {
                this.data = data;
                return data;
            })
            .catch(error => {
                console.error('Error fetching the directory data:', error);
            });
    }
}