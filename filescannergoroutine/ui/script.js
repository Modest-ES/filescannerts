function fetchDirectoryData() {
    const urlParameters = new URLSearchParams(window.location.search);
    const rootParameter = urlParameters.get('root');
    fetch(`./files?root=${rootParameter}`)
    .then(response => response.json())
    .then(data => {
        displayDirectoryData(data);
    })
    .catch(error => {
        console.error('Error fetching the directory data : ', error);
    });
}

function displayDirectoryData(data) {
    const directoryInfoElement = document.getElementById('directory-info');
    directoryInfoElement.innerHTML = '';

    const rootpathElement = document.createElement('p');
    rootpathElement.textContent = `Root: ${data.RootPath}`;
    directoryInfoElement.appendChild(rootpathElement);

    const durationElement = document.createElement('p');
    durationElement.textContent = `Duration: ${data.Duration}`;
    directoryInfoElement.appendChild(durationElement);

    const filesListElement = document.createElement('ul');
    data.FilesList.forEach(file => {
        const fileElement = document.createElement('li');
        fileElement.textContent = `${file.FileType} : ${file.FileName} (${file.FileSizeString})`;
        filesListElement.appendChild(fileElement);
    });
    directoryInfoElement.appendChild(filesListElement);

    const statusElement = document.createElement('p');
    statusElement.textContent = `Status: ${data.Status}`;
    directoryInfoElement.appendChild(statusElement);

    const errorElement = document.createElement('p');
    errorElement.textContent = `Error Message: ${data.ErrorMessage}`;
    directoryInfoElement.appendChild(errorElement);
}

window.onload = fetchDirectoryData;