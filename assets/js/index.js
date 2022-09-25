const downloadBtn = document.getElementById('download-btn');
const downloadSection = document.querySelector('.download-link-cont > p');
const downloadLink = document.querySelector('.download-link');
const mainTitle = document.querySelector('h1');
const urlInput = document.getElementById('url-input');
const downloadedBanner = document.querySelector('.already-downloaded-banner');
const loadingBar = document.querySelector('.loading-bar');
const showSidepanelBtn = document.querySelector('.toggle-sidepanel');
const closeSidepanelBtn = document.getElementById('close-side-panel');
const sidePanel = document.querySelector('.files-panel');
const filesList = document.querySelector('.files-list');


function addFileToList(link) {
    const li = document.createElement('li');
    const a = document.createElement('a');
    a.href = link;
    a.toggleAttribute('download');
    a.innerText = decodeURIComponent(link.replace('/media/', ''));
    li.appendChild(a);
    filesList.appendChild(li);
}
const getFilesUrl = new URL(
    '/api/v1/downloaded-media',
    document.location.origin
);
(fetch(getFilesUrl)).then((res) => {
    return res.json();
}).then((files) => {
    files.forEach(addFileToList);
});




showSidepanelBtn.addEventListener('click', (e) => {
    sidePanel.classList.add('files-panel__OPEN');
});
closeSidepanelBtn.addEventListener('click', (e) => {
    sidePanel.classList.remove('files-panel__OPEN');
});


// For the animation
downloadBtn.addEventListener('click', (e) => {
    downloadBtn.classList.add('animated-btn');
    downloadBtn.addEventListener('animationend', () => {
        downloadBtn.classList.remove('animated-btn');
    });
});

// To make the API to download
downloadBtn.addEventListener('click', async (e) => {
    if (urlInput.value === '') {
        return;
    }
    mainTitle.classList.add('blinking-title');
    loadingBar.classList.add('loading-bar__LOADING');
    const reqUrl = new URL('/api/v1/download-audio', document.location.origin);

    reqUrl.searchParams.append("url", urlInput.value);
    const res = await fetch(reqUrl);
    mainTitle.classList.remove('blinking-title');
    loadingBar.style.opacity = 0;
    setTimeout(() => {
        loadingBar.classList.remove('loading-bar__LOADING');
        loadingBar.style.removeProperty('opacity');
    }, 600);

    if (!res.ok) {
        return;
    }

    let resText = await res.text();
    if (resText.includes('ALREADY_DOWNLOADED')) {
        resText = resText.replace('ALREADY_DOWNLOADED ', '');

        const text = document.createTextNode("You've already downloaded ");
        const anchor = document.createElement("a");
        anchor.href = `/media/${encodeURIComponent(resText)}`;
        anchor.toggleAttribute("download");
        anchor.innerText = resText;

        downloadedBanner.appendChild(text);
        downloadedBanner.appendChild(anchor);

        downloadedBanner.style.bottom = "10px";
        setTimeout(() => {
            downloadedBanner.style.bottom = "-200px";
            setTimeout(() =>{
                downloadedBanner.removeChild(text);
                downloadedBanner.removeChild(anchor);
            }, 500);
        }, 6000);
        return;
    }
    let resObj = JSON.parse(resText);
    addFileToList(resObj.downloadLink);
    const styleSheet = Array.from(document.styleSheets).find(
        ss => ss.href == 'http://localhost:8080/pub/css/index.css'
    );
    const downloadLinkStyle = Array.from(
        styleSheet.cssRules
    ).find(
        rule => rule.selectorText == ".download-link-cont"
    );
    console.log(resObj);
    downloadLinkStyle.style.backgroundImage = `
        linear-gradient(to right, transparent 30%, transparent 35% 65%, transparent 70%),
        url("${resObj.metadata.thumbnail}")
    `;
    downloadLink.innerText = 'Save';
    downloadLink.href = resObj.downloadLink;
    downloadSection.style.display = 'block';
    
    if (downloadLink.previousElementSibling) {
        downloadLink.parentElement.firstElementChild.innerText = 
            `${resObj.metadata.channel} - ${resObj.metadata.title}`;
    } else {
        const audioTitle = document.createElement('span');
        audioTitle.classList.add('download-title');
        audioTitle.innerText = `${resObj.metadata.channel} - ${resObj.metadata.title}`;
        downloadLink.before(audioTitle);
        downloadLink.before(document.createElement('br'));
    }
});