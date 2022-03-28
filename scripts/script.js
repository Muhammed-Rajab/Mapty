'use strict';
const log = console.log;

const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');

class App {
    
    #map;
    #mapEvent;

    constructor () {

        this._getPostition();

        form.addEventListener('submit', this._newWorkOut.bind(this));
        inputType.addEventListener('change', this.__toggleElevationField.bind(this));
    }

    _getPostition() {

        if (navigator.geolocation)
            navigator.geolocation.getCurrentPosition(this._loadMap.bind(this), () => alert("Couldn't get your position"));
        else
            alert("Your browser doesn't supports GeoLocation API");
    }

    _loadMap(pos) {

        const {latitude, longitude} = pos.coords;

        this.#map = L.map('map').setView([latitude, longitude], 14);

        L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(this.#map);
        
        this.#map.on('click', this._showForm.bind(this));
    }

    _showForm(mapE) {
        this.#mapEvent = mapE;
        form.classList.remove('hidden');
        inputDistance.focus();
    }

    _newWorkOut(e) {
        e.preventDefault();

        // Clear values of input
        inputDistance.value = inputCadence.value = inputDuration.value = inputElevation.value = '';
    
        // Display marker
        const {lat: latitude, lng: longitude} = this.#mapEvent.latlng;
    
        L.marker([latitude, longitude]).addTo(this.#map).bindPopup(L.popup({
            maxWidth: 250,
            minWidth: 100,
            autoClose: false,
            closeOnClick: false,
            className: 'running-popup',
        }))
        .setPopupContent("Workout")
        .openPopup();
    }

    __toggleElevationField() {
        inputElevation.closest('.form__row').classList.toggle('form__row--hidden');
        inputCadence.closest('.form__row').classList.toggle('form__row--hidden');
    }
};

const app = new App();