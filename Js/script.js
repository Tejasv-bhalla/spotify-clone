// getting songs from the folder and making new array songs href 
let currentSong = new Audio();
let songs;
let currfolder;

function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`;
}

const PlayMusic = (audio_file, pause = false) => {
    currentSong.src = `/${currfolder}/` + audio_file;
    if (!pause) {
        currentSong.play();
        play.src = "img/pause.svg";
    }
    document.querySelector(".songinfo").innerHTML = decodeURI(audio_file);
    document.querySelector(".songtime").innerHTML = "00:00/00:00";
}


async function getSongs(folder) {
    currfolder = folder;
    let a = await fetch(`/${folder}/`)
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let b = div.getElementsByTagName("a");
    songs = [];
    for (let index = 0; index < b.length; index++) {
        const element = b[index];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`/${folder}/`)[1]);
        }
    }

    // show all the songs in the playlist.
    let songUL = document.querySelector('.songList').getElementsByTagName("ul")[0];
    songUL.innerHTML = "";
    for (let song of songs) {
        console.log(song);
        songUL.innerHTML = songUL.innerHTML + `<li>
                                <div class="info">
                                    <img class="invert" width="34" src="img/music.svg" >
                                    <div> ${song.replaceAll("%20", " ")}</div>
                                </div>
                                <div class="playnow">
                                    <span>Play Now</span>
                                    <img class="invert" src="img/play.svg" alt="">
                                </div> </li>`;
    }

    //Attach an event listner to each songs.
    Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach(e => {

        e.addEventListener("click", element => {
            console.log(e.querySelector(".info").getElementsByTagName("div")[0].innerHTML);
            PlayMusic(e.querySelector(".info").getElementsByTagName("div")[0].innerHTML.trim());
        });
    });

    return songs;
}

async function displayAlbums() {
    let a = await fetch(`/songs/`);
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let anchors = div.getElementsByTagName("a");
    let cardContainer = document.querySelector(".cardContainer")
    let array = Array.from(anchors)
    for (let index = 0; index < array.length; index++) {
        const e = array[index];
        if (e.href.includes("/songs/") && !e.href.includes(".htaccess")) {
            let folder = e.href.split("/").slice(-1)[0];
            // Get the metadata of the folder
            let a = await fetch(`/songs/${folder}/info.json`)
            let response = await a.json();
            cardContainer.innerHTML = cardContainer.innerHTML + `<div  data-folder="${folder}" class="card">
            <div class="play">
                <svg width="48" height="48" viewBox="0 0 48 48" fill="none"
                    xmlns="http://www.w3.org/2000/svg">
                    <circle cx="24" cy="24" r="24" fill="#00FF00" />
                    <path d="M18 34V14L34 24L18 34Z" fill="black" />
                </svg>
            </div>
            <img src="/songs/${folder}/cover.jpg">
            <h3>${response.title}</h3>
            <p class="fade" style="font-size: 14px;">${response.description}</p>
            </div>`
        }
    }

    //Load the playlist whenever that playlist card is clicked.
    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async (items) => {
            songs = await getSongs(`songs/${items.currentTarget.dataset.folder}`);
            PlayMusic(songs[0]);
        });
    })
}



async function main() {
    // Get the list of all the songs.
    await getSongs("songs/weeknd");
    PlayMusic(songs[0], true);

    //Display all the ALbums on page.
    displayAlbums();

    //Attach event listner to play button of playbar.
    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play();
            play.src = "img/pause.svg";
        }
        else {
            currentSong.pause();
            play.src = "img/play.svg";
        }
    });

    // event listner for time update event
    currentSong.addEventListener("timeupdate", () => {
        document.querySelector(".songtime").innerHTML = `${secondsToMinutesSeconds(currentSong.currentTime)} / ${secondsToMinutesSeconds(currentSong.duration)}`;
        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
    })

    //Add an event listner to seekbar.
    document.querySelector(".seekbar").addEventListener("click", (e) => {
        document.querySelector(".circle").style.left = (e.offsetX / e.target.getBoundingClientRect().width) * 100 + "%";
        currentSong.currentTime = (e.offsetX / e.target.getBoundingClientRect().width) * currentSong.duration;
    })

    //Add an event lsitner to Previous button.
    prev.addEventListener("click", () => {
        let index = songs.indexOf(currentSong.src.split(`/${currfolder}/`)[1]);
        if (index - 1 >= 0) {
            PlayMusic(songs[index - 1]);
        }
    })

    //Add an event listner to Next button.
    next.addEventListener("click", () => {
        // console.log(currentSong.src.split("/").slice(-1)[0]);
        let index = songs.indexOf(currentSong.src.split(`/${currfolder}/`)[1]);
        if (index + 1 < songs.length) {
            PlayMusic(songs[index + 1]);
        }
        else{
            PlayMusic(songs[0]);
        }
    })

    //Add an event to volume range.
    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
        currentSong.volume = parseInt(e.target.value) / 100;
        if (currentSong.volume == 0) {
            volButton.src = "img/mute.svg";
        }
        else {
            volButton.src = "img/volume.svg";
        }
    });

    //Add an event to volume button - mute.
    volButton.addEventListener("click", (e) => {
        if (e.target.src.includes("img/volume.svg")) {
            e.target.src = e.target.src.replace("img/volume.svg", "img/mute.svg")
            currentSong.volume = 0;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 0;
        }
        else {
            e.target.src = e.target.src.replace("img/mute.svg", "img/volume.svg")
            currentSong.volume = .10;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 10;
        }
    });

    //Add an event listner to hamburger icon(sideMenu).
    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.display = "flex";
    });

    //Add an event listner to close icon.
    document.querySelector(".closeButton").addEventListener("click", () => {
        document.querySelector(".left").style.display = "none";
    });

}


main();


