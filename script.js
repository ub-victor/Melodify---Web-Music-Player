document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const audioPlayer = document.getElementById('audio-player');
    const playBtn = document.getElementById('play-btn');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const volumeSlider = document.getElementById('volume-slider');
    const volumeIcon = document.getElementById('volume-icon');
    const progressBar = document.getElementById('progress-bar');
    const currentTimeEl = document.getElementById('current-time');
    const durationEl = document.getElementById('duration');
    const songTitleEl = document.getElementById('song-title');
    const songArtistEl = document.getElementById('song-artist');
    const coverArtEl = document.getElementById('cover-art');
    const songsListEl = document.getElementById('all-songs');
    const playlistsContainerEl = document.getElementById('playlists');
    const searchInput = document.getElementById('search-input');
    const genreFilter = document.getElementById('genre-filter');
    const fileUpload = document.getElementById('file-upload');
    const themeSwitch = document.getElementById('theme-switch');
    const tabButtons = document.querySelectorAll('.tab-btn');
    const newPlaylistBtn = document.getElementById('new-playlist-btn');
    const playlistModal = document.getElementById('playlist-modal');
    const closeModalBtn = document.querySelector('.close-btn');
    const playlistNameInput = document.getElementById('playlist-name');
    const createPlaylistBtn = document.getElementById('create-playlist-btn');
    const modalSongsList = document.getElementById('modal-songs-list');
    const currentYearEl = document.getElementById('current-year');

    // App State
    let songs = [];
    let playlists = [];
    let currentSongIndex = 0;
    let isPlaying = false;
    let currentTab = 'all-songs';

    // Initialize the app
    init();

    function init() {
        // Set current year in footer
        currentYearEl.textContent = new Date().getFullYear();

        // Load saved data from localStorage
        loadData();

        // Set up event listeners
        setupEventListeners();

        // Update UI
        updateUI();
    }

    function loadData() {
        // Load songs from localStorage or use default demo songs
        const savedSongs = localStorage.getItem('melodify-songs');
        if (savedSongs) {
            songs = JSON.parse(savedSongs);
        } else {
            // Add some demo songs if none exist
            songs = [
                {
                    id: '1',
                    title: 'Blinding Lights',
                    artist: 'The Weeknd',
                    duration: '3:20',
                    genre: 'pop',
                    audioSrc: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
                    coverArt: 'https://upload.wikimedia.org/wikipedia/en/e/e6/The_Weeknd_-_Blinding_Lights.png'
                },
                {
                    id: '2',
                    title: 'Bohemian Rhapsody',
                    artist: 'Queen',
                    duration: '5:55',
                    genre: 'rock',
                    audioSrc: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
                    coverArt: 'https://upload.wikimedia.org/wikipedia/en/thumb/9/9f/Bohemian_Rhapsody.png/220px-Bohemian_Rhapsody.png'
                },
                {
                    id: '3',
                    title: 'Take Five',
                    artist: 'Dave Brubeck',
                    duration: '5:24',
                    genre: 'jazz',
                    audioSrc: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
                    coverArt: 'https://share.google/images/xjJRG6WRWpy0pVPVn'
                }
            ];
            saveSongs();
        }

        // Load playlists from localStorage
        const savedPlaylists = localStorage.getItem('melodify-playlists');
        if (savedPlaylists) {
            playlists = JSON.parse(savedPlaylists);
        }
    }

    function saveSongs() {
        localStorage.setItem('melodify-songs', JSON.stringify(songs));
    }

    function savePlaylists() {
        localStorage.setItem('melodify-playlists', JSON.stringify(playlists));
    }

    function setupEventListeners() {
        // Player controls
        playBtn.addEventListener('click', togglePlay);
        prevBtn.addEventListener('click', playPreviousSong);
        nextBtn.addEventListener('click', playNextSong);
        volumeSlider.addEventListener('input', setVolume);
        progressBar.addEventListener('click', seek);

        // Audio player events
        audioPlayer.addEventListener('timeupdate', updateProgressBar);
        audioPlayer.addEventListener('ended', playNextSong);
        audioPlayer.addEventListener('loadedmetadata', updateSongInfo);

        // Theme toggle
        themeSwitch.addEventListener('change', toggleTheme);

        // Library interactions
        searchInput.addEventListener('input', filterSongs);
        genreFilter.addEventListener('change', filterSongs);
        fileUpload.addEventListener('change', handleFileUpload);

        // Tab navigation
        tabButtons.forEach(button => {
            button.addEventListener('click', () => switchTab(button.dataset.tab));
        });

        // Playlist creation
        newPlaylistBtn.addEventListener('click', openPlaylistModal);
        closeModalBtn.addEventListener('click', closePlaylistModal);
        createPlaylistBtn.addEventListener('click', createPlaylist);

        // Click outside modal to close
        window.addEventListener('click', (e) => {
            if (e.target === playlistModal) {
                closePlaylistModal();
            }
        });
    }

    function updateUI() {
        renderSongsList();
        renderPlaylists();
        updatePlayerUI();
        applyTheme();
    }

    function updatePlayerUI() {
        if (songs.length === 0) {
            songTitleEl.textContent = 'No song selected';
            songArtistEl.textContent = 'Upload some music to get started';
            coverArtEl.src = 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80';
            return;
        }

        const currentSong = songs[currentSongIndex];
        songTitleEl.textContent = currentSong.title;
        songArtistEl.textContent = currentSong.artist;
        coverArtEl.src = currentSong.coverArt || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80';

        // Update play/pause button
        playBtn.innerHTML = isPlaying ? '<i class="fas fa-pause"></i>' : '<i class="fas fa-play"></i>';

        // Highlight current song in list
        const songItems = document.querySelectorAll('.song-item');
        songItems.forEach((item, index) => {
            if (index === currentSongIndex) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });
    }

    function renderSongsList() {
        if (songs.length === 0) {
            songsListEl.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-music"></i>
                    <p>No songs available. Upload some music to get started!</p>
                </div>
            `;
            return;
        }

        songsListEl.innerHTML = '';
        songs.forEach((song, index) => {
            const songItem = document.createElement('div');
            songItem.className = `song-item ${index === currentSongIndex ? 'active' : ''}`;
            songItem.innerHTML = `
                <div class="song-number">${index + 1}</div>
                <div class="song-info">
                    <div class="song-title">${song.title}</div>
                    <div class="song-artist">${song.artist} • ${song.genre}</div>
                </div>
                <div class="song-duration">${song.duration}</div>
                <div class="song-actions">
                    <i class="fas fa-plus" data-action="add-to-playlist" data-id="${song.id}"></i>
                </div>
            `;
            songItem.addEventListener('click', () => playSong(index));
            songsListEl.appendChild(songItem);
        });

        // Add event listeners for song actions
        document.querySelectorAll('[data-action="add-to-playlist"]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                openPlaylistModal(e.target.dataset.id);
            });
        });
    }

    function renderPlaylists() {
        if (playlists.length === 0) {
            playlistsContainerEl.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-list"></i>
                    <p>No playlists created yet. Create one to organize your music!</p>
                </div>
            `;
            return;
        }

        playlistsContainerEl.innerHTML = '';
        playlists.forEach((playlist, index) => {
            const playlistItem = document.createElement('div');
            playlistItem.className = 'playlist-item';
            playlistItem.innerHTML = `
                <div class="playlist-cover">
                    <i class="fas fa-music"></i>
                </div>
                <div class="playlist-info">
                    <div class="playlist-name">${playlist.name}</div>
                    <div class="playlist-count">${playlist.songs.length} songs</div>
                </div>
            `;
            playlistItem.addEventListener('click', () => viewPlaylist(index));
            playlistsContainerEl.appendChild(playlistItem);
        });
    }

    function playSong(index) {
        if (index < 0 || index >= songs.length) return;

        currentSongIndex = index;
        const song = songs[currentSongIndex];
        
        audioPlayer.src = song.audioSrc;
        audioPlayer.load();
        
        if (isPlaying) {
            audioPlayer.play().catch(error => {
                console.error('Playback failed:', error);
            });
        }
        
        updatePlayerUI();
    }

    function togglePlay() {
        if (songs.length === 0) return;

        if (isPlaying) {
            audioPlayer.pause();
        } else {
            audioPlayer.play().catch(error => {
                console.error('Playback failed:', error);
            });
        }
        
        isPlaying = !isPlaying;
        updatePlayerUI();
    }

    function playPreviousSong() {
        if (songs.length === 0) return;

        currentSongIndex = (currentSongIndex - 1 + songs.length) % songs.length;
        playSong(currentSongIndex);
    }

    function playNextSong() {
        if (songs.length === 0) return;

        currentSongIndex = (currentSongIndex + 1) % songs.length;
        playSong(currentSongIndex);
    }

    function setVolume() {
        audioPlayer.volume = volumeSlider.value;
        
        // Update volume icon
        if (volumeSlider.value == 0) {
            volumeIcon.className = 'fas fa-volume-mute';
        } else if (volumeSlider.value < 0.5) {
            volumeIcon.className = 'fas fa-volume-down';
        } else {
            volumeIcon.className = 'fas fa-volume-up';
        }
    }

    function updateProgressBar() {
        const { currentTime, duration } = audioPlayer;
        const progressPercent = (currentTime / duration) * 100;
        
        progressBar.style.setProperty('--progress', `${progressPercent}%`);
        
        // Update time display
        currentTimeEl.textContent = formatTime(currentTime);
        
        if (!isNaN(duration)) {
            durationEl.textContent = formatTime(duration);
        }
    }

    function updateSongInfo() {
        // Update duration display when metadata is loaded
        durationEl.textContent = formatTime(audioPlayer.duration);
    }

    function seek(e) {
        const width = this.clientWidth;
        const clickX = e.offsetX;
        const duration = audioPlayer.duration;
        
        audioPlayer.currentTime = (clickX / width) * duration;
    }

    function formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
    }

    function toggleTheme() {
        if (themeSwitch.checked) {
            document.documentElement.setAttribute('data-theme', 'dark');
            localStorage.setItem('melodify-theme', 'dark');
        } else {
            document.documentElement.removeAttribute('data-theme');
            localStorage.setItem('melodify-theme', 'light');
        }
    }

    function applyTheme() {
        const savedTheme = localStorage.getItem('melodify-theme');
        if (savedTheme === 'dark') {
            themeSwitch.checked = true;
            document.documentElement.setAttribute('data-theme', 'dark');
        } else {
            themeSwitch.checked = false;
            document.documentElement.removeAttribute('data-theme');
        }
    }

    function filterSongs() {
        const searchTerm = searchInput.value.toLowerCase();
        const genre = genreFilter.value;
        
        const filteredSongs = songs.filter(song => {
            const matchesSearch = song.title.toLowerCase().includes(searchTerm) || 
                                 song.artist.toLowerCase().includes(searchTerm);
            const matchesGenre = genre === 'all' || song.genre === genre;
            return matchesSearch && matchesGenre;
        });
        
        renderFilteredSongs(filteredSongs);
    }

    function renderFilteredSongs(filteredSongs) {
        if (filteredSongs.length === 0) {
            songsListEl.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-search"></i>
                    <p>No songs found matching your criteria.</p>
                </div>
            `;
            return;
        }

        songsListEl.innerHTML = '';
        filteredSongs.forEach((song, index) => {
            const originalIndex = songs.findIndex(s => s.id === song.id);
            const songItem = document.createElement('div');
            songItem.className = `song-item ${originalIndex === currentSongIndex ? 'active' : ''}`;
            songItem.innerHTML = `
                <div class="song-number">${originalIndex + 1}</div>
                <div class="song-info">
                    <div class="song-title">${song.title}</div>
                    <div class="song-artist">${song.artist} • ${song.genre}</div>
                </div>
                <div class="song-duration">${song.duration}</div>
                <div class="song-actions">
                    <i class="fas fa-plus" data-action="add-to-playlist" data-id="${song.id}"></i>
                </div>
            `;
            songItem.addEventListener('click', () => playSong(originalIndex));
            songsListEl.appendChild(songItem);
        });

        // Add event listeners for song actions
        document.querySelectorAll('[data-action="add-to-playlist"]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                openPlaylistModal(e.target.dataset.id);
            });
        });
    }

    function handleFileUpload(e) {
        const files = e.target.files;
        if (files.length === 0) return;

        Array.from(files).forEach(file => {
            if (!file.type.startsWith('audio/')) {
                alert('Please upload only audio files');
                return;
            }

            // Create a unique ID for the song
            const id = Date.now().toString();
            
            // Extract metadata from filename (you could use a library like music-metadata for more accurate info)
            const fileName = file.name.replace(/\.[^/.]+$/, ""); // Remove extension
            const artistTitle = fileName.split(' - ');
            const artist = artistTitle.length > 1 ? artistTitle[0] : 'Unknown Artist';
            const title = artistTitle.length > 1 ? artistTitle[1] : fileName;
            
            // Create object URL for the audio file
            const audioSrc = URL.createObjectURL(file);
            
            // Create new song object
            const newSong = {
                id,
                title,
                artist,
                duration: '0:00', // Will be updated when loaded
                genre: 'unknown',
                audioSrc,
                coverArt: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80'
            };
            
            songs.push(newSong);
            
            // Create audio element to get duration
            const audio = new Audio();
            audio.src = audioSrc;
            audio.addEventListener('loadedmetadata', () => {
                newSong.duration = formatTime(audio.duration);
                saveSongs();
                updateUI();
            });
        });

        // Reset file input
        e.target.value = '';
    }

    function switchTab(tab) {
        currentTab = tab;
        
        // Update active tab button
        tabButtons.forEach(button => {
            if (button.dataset.tab === tab) {
                button.classList.add('active');
            } else {
                button.classList.remove('active');
            }
        });
        
        // Show appropriate content
        if (tab === 'all-songs') {
            songsListEl.style.display = 'block';
            playlistsContainerEl.style.display = 'none';
        } else if (tab === 'playlists') {
            songsListEl.style.display = 'none';
            playlistsContainerEl.style.display = 'block';
        }
    }

    function openPlaylistModal(preSelectedSongId = null) {
        if (songs.length === 0) {
            alert('No songs available to add to playlist');
            return;
        }

        // Reset modal
        playlistNameInput.value = '';
        modalSongsList.innerHTML = '';

        // Populate songs list in modal
        songs.forEach(song => {
            const songItem = document.createElement('div');
            songItem.className = 'modal-song-item';
            songItem.innerHTML = `
                <input type="checkbox" id="song-${song.id}" value="${song.id}" 
                    ${preSelectedSongId === song.id ? 'checked' : ''}>
                <label for="song-${song.id}" class="song-title">${song.title} - ${song.artist}</label>
            `;
            modalSongsList.appendChild(songItem);
        });

        // Show modal
        playlistModal.style.display = 'flex';
    }

    function closePlaylistModal() {
        playlistModal.style.display = 'none';
    }

    function createPlaylist() {
        const name = playlistNameInput.value.trim();
        if (!name) {
            alert('Please enter a playlist name');
            return;
        }

        // Get selected song IDs
        const selectedSongs = Array.from(modalSongsList.querySelectorAll('input[type="checkbox"]:checked'))
            .map(checkbox => checkbox.value);

        if (selectedSongs.length === 0) {
            alert('Please select at least one song for the playlist');
            return;
        }

        // Create new playlist
        const newPlaylist = {
            id: Date.now().toString(),
            name,
            songs: selectedSongs
        };

        playlists.push(newPlaylist);
        savePlaylists();

        // Close modal and update UI
        closePlaylistModal();
        renderPlaylists();

        // Switch to playlists tab if not already there
        if (currentTab !== 'playlists') {
            switchTab('playlists');
        }
    }

    function viewPlaylist(playlistIndex) {
        const playlist = playlists[playlistIndex];
        const playlistSongs = songs.filter(song => playlist.songs.includes(song.id));

        // Render the playlist songs in the main songs list
        songsListEl.innerHTML = '';
        if (playlistSongs.length === 0) {
            songsListEl.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-music"></i>
                    <p>This playlist is empty.</p>
                </div>
            `;
            return;
        }

        playlistSongs.forEach((song, index) => {
            const originalIndex = songs.findIndex(s => s.id === song.id);
            const songItem = document.createElement('div');
            songItem.className = `song-item ${originalIndex === currentSongIndex ? 'active' : ''}`;
            songItem.innerHTML = `
                <div class="song-number">${index + 1}</div>
                <div class="song-info">
                    <div class="song-title">${song.title}</div>
                    <div class="song-artist">${song.artist} • ${song.genre}</div>
                </div>
                <div class="song-duration">${song.duration}</div>
                <div class="song-actions">
                    <i class="fas fa-times" data-action="remove-from-playlist" data-playlist-id="${playlist.id}" data-song-id="${song.id}"></i>
                </div>
            `;
            songItem.addEventListener('click', () => playSong(originalIndex));
            songsListEl.appendChild(songItem);
        });

        // Add event listeners for remove buttons
        document.querySelectorAll('[data-action="remove-from-playlist"]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                removeFromPlaylist(e.target.dataset.playlistId, e.target.dataset.songId);
            });
        });

        // Switch to songs tab to show the playlist content
        switchTab('all-songs');
    }

    function removeFromPlaylist(playlistId, songId) {
        const playlistIndex = playlists.findIndex(p => p.id === playlistId);
        if (playlistIndex === -1) return;

        // Remove the song from the playlist
        playlists[playlistIndex].songs = playlists[playlistIndex].songs.filter(id => id !== songId);

        // If playlist is empty, ask if user wants to delete it
        if (playlists[playlistIndex].songs.length === 0) {
            if (confirm('This playlist will be empty. Do you want to delete it?')) {
                playlists.splice(playlistIndex, 1);
            }
        }

        savePlaylists();
        renderPlaylists();
        viewPlaylist(playlistIndex);
    }
});