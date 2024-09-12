const selectors = {
    boardContainer: document.querySelector('.board-container'),
    board: document.querySelector('.board'),
    moves: document.querySelector('.moves'),
    timer: document.querySelector('.timer'),
    start: document.querySelector('button'),
    win: document.querySelector('.win')
}

const state = {
    gameStarted: false,
    flippedCards: 0,
    totalFlips: 0,
    totalTime: 0,
    loop: null,
    timerInterval: null
}

const shuffle = array => {
    const clonedArray = [...array];

    for (let i = clonedArray.length - 1; i > 0; i--) {
        const randomIndex = Math.floor(Math.random() * (i + 1));
        const original = clonedArray[i];

        clonedArray[i] = clonedArray[randomIndex];
        clonedArray[randomIndex] = original;
    }

    return clonedArray;
}

const generateGame = () => {
    const totalCards = 26;
    const dimensions = Math.ceil(Math.sqrt(totalCards));

    // Gunakan alfabet A-Z tanpa pasangan dan acak
    const alphabets = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
    const items = shuffle(alphabets.slice(0, totalCards));
    
    // Kartu tambahan dengan part of speech diacak
    const partsOfSpeech = shuffle(['Noun', 'Adjective', 'Verb', 'Adverb']);
    
    // Acak tata letak kartu dengan CSS grid area agar setiap kartu muncul di posisi acak
    const cards = `
        <div class="board" style="grid-template-columns: repeat(${dimensions}, 1fr);">
            ${items.map(item => `
                <div class="card" style="order:${Math.floor(Math.random() * totalCards)};">
                    <div class="card-front"></div>
                    <div class="card-back">${item}</div>
                </div>
            `).join('')}
        </div>
    `;

    // Kartu tambahan
    const extraCards = `
    <div class="additional-board">
        ${partsOfSpeech.map(item => `
            <div class="additional-card" style="order:${Math.floor(Math.random() * partsOfSpeech.length)};">
                <div class="card-front"></div>
                <div class="card-back">${item}</div>
            </div>
        `).join('')}
    </div>
    `;

    // Replace board lama dengan board baru yang berisi kartu
    const parser = new DOMParser().parseFromString(`
        <div class="game-container">
            ${cards}
            ${extraCards}
        </div>
    `, 'text/html');

    selectors.board.replaceWith(parser.querySelector('.board'));
    document.querySelector('.additional-container').innerHTML = extraCards;
};

const startGame = () => {
    state.gameStarted = true;
    selectors.start.textContent = 'Stop'; // Ganti teks tombol menjadi Stop

    // Putar musik saat game dimulai
    const music = document.getElementById('background-music');
    if (music) {
        music.play();
    }

    // Mulai timer
    state.totalTime = 0; // Reset waktu
    selectors.timer.textContent = 'Time: 0 sec'; // Reset tampilan timer

    state.timerInterval = setInterval(() => {
        state.totalTime++;
        selectors.timer.textContent = `Time: ${state.totalTime} sec`;
    }, 1000); // Update setiap detik
}

const stopGame = () => {
    state.gameStarted = false;
    selectors.start.textContent = 'Start'; // Ganti teks tombol menjadi Start

    // Hentikan timer
    clearInterval(state.timerInterval);
    state.timerInterval = null;
    state.totalTime = 0; // Reset waktu
    selectors.timer.textContent = 'Time: 0 sec'; // Reset tampilan timer

    // Putar musik berhenti
    const music = document.getElementById('background-music');
    if (music) {
        music.pause();
        music.currentTime = 0; // Reset musik ke awal
    }
}

const flipCard = card => {
    state.flippedCards++;
    state.totalFlips++;

    if (!state.gameStarted) {
        startGame();
    }

    // Buka kartu
    card.classList.add('flipped');

    // Tutup kembali kartu setelah 1 detik, tanpa menunggu kartu kedua dibuka
    setTimeout(() => {
        card.classList.remove('flipped');
    }, 1000);

    // Reset flipped cards count
    state.flippedCards = 0;

    // Cek apakah semua kartu sudah dibuka (game dimenangkan)
    if (!document.querySelectorAll('.card:not(.flipped)').length) {
        setTimeout(() => {
            selectors.boardContainer.classList.add('flipped');
            selectors.win.innerHTML = `
                <span class="win-text">
                    You won!<br />
                    with <span class="highlight">${state.totalFlips}</span> moves and <span class="highlight">${state.totalTime}</span> seconds
                </span>
            `;
            clearInterval(state.timerInterval); // Hentikan timer
            selectors.start.textContent = 'Start'; // Kembalikan teks tombol ke Start
        }, 1000);
    }
}

const attachEventListeners = () => {
    document.addEventListener('click', event => {
        const eventTarget = event.target;
        const eventParent = eventTarget.parentElement;

        if (eventTarget.className.includes('card') && !eventParent.className.includes('flipped')) {
            flipCard(eventParent);
        } else if (eventTarget.nodeName === 'BUTTON') {
            if (selectors.start.textContent === 'Start') {
                generateGame();  // Reset dan acak ulang kartu jika tombol ditekan
                startGame();
            } else {
                stopGame(); // Hentikan permainan jika tombol ditekan saat permainan sudah dimulai
            }
        }
    });
}

generateGame();
attachEventListeners();
