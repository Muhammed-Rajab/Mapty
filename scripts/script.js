'use strict';
const log = console.log;

class Workout {
    
    date = new Date();
    id = (Date.now() + '').slice(-10);

    constructor (coords, distance, duration) {
        this.coords = coords; // [lat,  long]
        this.distance = distance; // in KM
        this.duration = duration; // in MIN
    }

    __setDescription () {
        const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        this.description = `${this.type[0].toUpperCase() + this.type.slice(1)} on ${months[this.date.getMonth()]} ${this.date.getDate()}`;
    }
};

class Running extends Workout{

    type = "running";
    
    constructor (coords, distance, duration, cadence) {
        super(coords, distance, duration);
        this.cadence = cadence;
        this.calcPace();
        this.__setDescription();
    }

    calcPace() {
        this.pace = this.duration / this.distance;
    }
};
class Cycling extends Workout{
    
    type = "cycling";

    constructor (coords, distance, duration, elevationGain) {
        super(coords, distance, duration);
        this.elevationGain = elevationGain;
        this.calcSpeed();
        this.__setDescription();
    }

    calcSpeed() {
        this.speed = this.distance / this.duration / 60;
    }
};


// !-------------------------------------------------
// * Application
// !-------------------------------------------------

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
    #workouts = [];

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

    __hideForm(){
        inputDistance.value = inputCadence.value = inputDuration.value = inputElevation.value = '';
        
        form.style.display = "none";
        form.classList.add('hidden');

        setTimeout(() => form.style.display = "grid", 1000)
    }

    _newWorkOut(e) {

        const validInputData = (...inputs) => inputs.every(input => Number.isFinite(input));

        const allPositive = (...inputs) => inputs.every(input => input >= 0);

        e.preventDefault();

        /*
            TODO: Get data from the form
            TODO: Validate data
            TODO: If valid, create running/cycling object
            TODO: Add object to workout array
            TODO: Render workout on map as marker
            TODO: Render workout on list
            TODO: Hide form and clear the fields
        */

        let workout;
        const type = inputType.value;
        const distance = +inputDistance.value;
        const duration = +inputDuration.value;
        const {lat: latitude, lng: longitude} = this.#mapEvent.latlng;

        if (type === "running"){
            const cadence = +inputCadence.value;

            if (!validInputData(distance, duration, cadence) || !allPositive(distance, duration, cadence)) return alert("Expected numerical values");

            workout = new Running([latitude, longitude], distance, duration, cadence);
        }
        
        if (type === "cycling") {
            const elevationGain = +inputElevation.value;
            
            if (!validInputData(distance, duration, elevationGain) || !allPositive(distance, duration)) return alert("Expected numerical values");
            
            workout = new Cycling([latitude, longitude], distance, duration, elevationGain);
        }

        this.#workouts.push(workout);

        this.__renderWorkoutMarker(workout);
        
        this.__renderWorkout(workout);
        
        this.__hideForm();
    }

    __toggleElevationField() {
        inputElevation.closest('.form__row').classList.toggle('form__row--hidden');
        inputCadence.closest('.form__row').classList.toggle('form__row--hidden');
    }

    __renderWorkoutMarker(workout) {
        L.marker(workout.coords).addTo(this.#map).bindPopup(L.popup({
            maxWidth: 250,
            minWidth: 100,
            autoClose: false,
            closeOnClick: false,
            className: `${workout.type}-popup`,
        }))
        .setPopupContent(`${workout.type === "running" ? "🏃‍♂️" : "🚴‍♀️"} ${workout.description}`)
        .openPopup();
    }

    __renderWorkout(workout) {
        let html = `
            <li class="workout workout--${workout.type}" data-id="${workout.id}">
                <h2 class="workout__title"> on April 14</h2>
                <div class="workout__details">
                    <span class="workout__icon">${workout.type === "running" ? "🏃‍♂️" : "🚴‍♀️"}</span>
                    <span class="workout__value">${workout.distance}</span>
                <span class="workout__unit">km</span>
                </div>
                <div class="workout__details">
                    <span class="workout__icon">⏱</span>
                    <span class="workout__value">${workout.duration}</span>
                    <span class="workout__unit">min</span>
                </div>
        `

        if (workout.type === "running") {
            html += `
            <div class="workout__details">
                <span class="workout__icon">⚡️</span>
                <span class="workout__value">${workout.pace.toFixed(1)}</span>
                <span class="workout__unit">min/km</span>
            </div>
            <div class="workout__details">
                <span class="workout__icon">🦶🏼</span>
                <span class="workout__value">${workout.cadence}</span>
                <span class="workout__unit">spm</span>
            </div>
        </li>`;
        }

        if (workout.type === "cycling") {
            html += `
            <div class="workout__details">
                <span class="workout__icon">⚡️</span>
                <span class="workout__value">${workout.speed.toFixed(1)}</span>
                <span class="workout__unit">km/h</span>
            </div>
            <div class="workout__details">
                <span class="workout__icon">⛰</span>
                <span class="workout__value">${workout.elevationGain}</span>
                <span class="workout__unit">m</span>
            </div>
        </li>`;
        }

        form.insertAdjacentHTML('afterend', html);
    }
};

const app = new App();