export default class DirectoryModel {
    constructor() {
        this.data = null;
    }

    async fetchData(rootPath, sortParameter) {
        try {
            const response = await fetch(`./files?root=${rootPath}&sort=${sortParameter}`);
            const data = await response.json();
            this.data = data;
            return data;
        } catch (error) {
            console.error('Error fetching the directory data:', error);
        }
    }
}