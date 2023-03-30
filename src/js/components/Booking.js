import {templates, classNames,  settings, select} from '../settings.js';
import utils from '../utils.js';
import AmountWidget from './AmountWidget.js';
import DatePicker from './DatePicker.js';
import HourPicker from './HourPicker.js';

class Booking {
  constructor(element){
    const thisBooking = this;

    //! odebranie referencji do kontenera przekazanej w app.initBooking, jako argument (np. o nazwie element):

    //thisBooking.getElements(element);

    //! wywołanie metody render, przekazując tę referencję dalej (render musi mieć w końcu dostęp do kontenera):

    thisBooking.render(element);
    thisBooking.initWidgets();
    thisBooking.getData();
  }

  getData() {
    const thisBooking = this;

    const startDateParam = settings.db.dateStartParamKey + '=' + utils.dateToStr(thisBooking.datePicker.minDate);
    const endDateParam = settings.db.dateEndParamKey     + '=' + utils.dateToStr(thisBooking.datePicker.maxDate);

    const params = {
      booking: [
        startDateParam,
        endDateParam,
      ],
      eventsCurrent: [
        settings.db.notRepeatParam,
        startDateParam,
        endDateParam,
      ],
      eventsRepeat: [
        settings.db.repeatParam,
        endDateParam,
      ],
    };

    //console.log('getData params:', params);

    const urls = {
      booking:        settings.db.url + '/' + settings.db.bookings + '?' + params.booking.join('&') , // "z obiektu paramas bierzemy właściwość booking"
      eventsCurrent:  settings.db.url + '/' + settings.db.events  + '?' + params.eventsCurrent.join('&'),
      eventsRepeat:   settings.db.url + '/' + settings.db.events   + '?' + params.eventsRepeat.join('&'),
    };


    Promise.all([ // ma być wykonany zestaw operacji fetch poniżej:
      fetch(urls.booking),
      fetch(urls.eventsCurrent),
      fetch(urls.eventsRepeat),
    ])
      .then(function(allResponses){
        const bookingsResponse = allResponses[0];
        const eventsCurrentResponse = allResponses[1];
        const eventsRepeatResponse  = allResponses[2];
        return Promise.all([
          bookingsResponse.json(),
          eventsCurrentResponse.json(),
          eventsRepeatResponse.json(),
        ]);
      })
      .then(function([bookings, eventsCurrent, eventsRepeat]){
        // console.log(booking);
        // console.log(eventsCurrent);
        // console.log(eventsRepeat);
        thisBooking.parseData(bookings, eventsCurrent, eventsRepeat);
      });
  }

  parseData(bookings, eventsCurrent, eventsRepeat) {
    const thisBooking = this;

    thisBooking.booked = {};

    for(let item of bookings) {
      //console.log('bookings:', bookings);
      thisBooking.makeBooked(item.date, item.hour, item.duration, item.table);
    }

    for(let item of eventsCurrent) {
      thisBooking.makeBooked(item.date, item.hour, item.duration, item.table);
    }

    const minDate = thisBooking.datePicker.minDate;
    const maxDate = thisBooking.datePicker.maxDate;

    for(let item of eventsRepeat) {
      if(item.repeat == 'daily') {
        for(let loopDate = minDate; loopDate <= maxDate; loopDate =  utils.addDays(loopDate, 1)) {
          thisBooking.makeBooked(utils.dateToStr(loopDate), item.hour, item.duration, item.table);
        }
      }
    }

    //console.log('thisBooking.booked:', thisBooking.booked);

    thisBooking.updateDOM();
  }

  makeBooked(date, hour, duration, table) {
    const thisBooking = this;

    if(typeof thisBooking.booked[date] == 'undefined') {
      thisBooking.booked[date] = {};
    }

    const startHour = utils.hourToNumber(hour);

    for(let hourBlock = startHour; hourBlock < startHour + duration; hourBlock += 0.5) {
      //console.log('loop', hourBlock);

      if(typeof thisBooking.booked[date][hourBlock] == 'undefined') {
        thisBooking.booked[date][hourBlock] = [];
      }

      thisBooking.booked[date][hourBlock].push(table);
    }

  }

  updateDOM() {
    const thisBooking = this;

    thisBooking.date = thisBooking.datePicker.value;
    thisBooking.hour = utils.hourToNumber(thisBooking.hourPicker.value);

    let allAvailable = false;

    if(
      typeof thisBooking.booked[thisBooking.date] == 'undefined'
      ||
      typeof thisBooking.booked[thisBooking.date][thisBooking.hour] == 'undefined'
    ){
      allAvailable = true;
    }

    for(let table of thisBooking.dom.tables) {
      let tableId = table.getAttribute(settings.booking.tableIdAttribute);
      if(!isNaN(tableId)){
        tableId = parseInt(tableId);
      }

      if(
        !allAvailable
        &&
        thisBooking.booked[thisBooking.date][thisBooking.hour].includes(tableId)
      ){
        table.classList.add(classNames.booking.tableBooked);
      } else {
        table.classList.remove(classNames.booking.tableBooked);
      }
    }
  }

  render(element) {
    const thisBooking = this;

    //! generowanie kodu HTML za pomocą szablonu templates.bookingWidget, przy czym nie musimy przekazywać do niego żadnych danych, gdyż ten szablon nie oczekuje na żaden placeholder:

    const generatedHTML = templates.bookingWidget();

    thisBooking.dom = {};

    thisBooking.dom.wrapper = element;

    //! zmiana zawartości wrappera (innerHTML) na kod HTML wygenerowany z szablonu:

    thisBooking.dom.wrapper.innerHTML = generatedHTML;

    thisBooking.dom.peopleAmount = element.querySelector(select.booking.peopleAmount);
    thisBooking.dom.hoursAmount = element.querySelector(select.booking.hoursAmount);
    thisBooking.dom.datePicker = element.querySelector(select.widgets.datePicker.wrapper); // '.date-picker'
    thisBooking.dom.hourPicker = element.querySelector(select.widgets.hourPicker.wrapper); // '.hour-picker'
    thisBooking.dom.tables = element.querySelectorAll(select.booking.table);
    thisBooking.dom.floor = element.querySelector(select.booking.floor); // div ze wszystkimi stolikami
    thisBooking.dom.submit = element.querySelector(select.booking.submit);
    thisBooking.dom.duration = element.querySelector(select.booking.duration);
    thisBooking.dom.people = element.querySelector(select.booking.people);
    thisBooking.dom.starters = element.querySelectorAll(select.booking.starters);
    thisBooking.dom.phone = element.querySelector(select.booking.phone);
    thisBooking.dom.address = element.querySelector(select.booking.address);
  }

  initTables() { // TODO fix starters add & updateDOM
    const thisBooking = this;

    const bookedTableArr = [];

    thisBooking.dom.floor.addEventListener('click', function(event) {
      event.preventDefault();
      //console.log('event.target:', event.target);

      const targetTable = event.target; // to jest "event delegation" - Technika ta polega na tym, że zamiast nasłuchiwać na pojedyncze elementy, nasłuchuje się na jeden kontener.

      if(targetTable.classList.contains('table')) { // z klasy
        event.preventDefault();
        console.log('targetTable:', targetTable);

        const tableId = targetTable.getAttribute('data-table'); // z atrybutu

        if(!targetTable.classList.contains(classNames.booking.tableBooked)) { // sprawdzamy czy stolik nie ma klasy 'booked'

          let tables = thisBooking.dom.tables;

          for(let table of tables) {

            if (table.classList.contains(classNames.booking.tableSelected) &&
            table !== event.target) {
              table.classList.remove(classNames.booking.tableSelected);
            }
            if(targetTable.classList.contains(classNames.booking.tableSelected)) {
              targetTable.classList.remove(classNames.booking.tableSelected);

            } else {
              targetTable.classList.add(classNames.booking.tableSelected);
            }
            thisBooking.selectedTable = tableId;
          }
          console.log('thisBooking.selectedTable:', thisBooking.selectedTable);
        }
      }
      bookedTableArr.push(thisBooking.selectedTable);
      //console.log('bookedTableArr:', bookedTableArr);

      // let tempBookedArrLastItem = tempBookedArr[tempBookedArr.length - 1];
      // console.log('tempBookedArrLastItem :', tempBookedArrLastItem );

      // let tempBookedArrLastItem = tempBookedArr.slice(-1)[0];
      // console.log('tempBookedArrLastItem :', tempBookedArrLastItem );
    });
  }

  sendBooking() {
    const thisBooking = this;

    const url = settings.db.url + '/' + settings.db.bookings;

    const payload = {
      date: thisBooking.datePicker.value,
      hour: thisBooking.hourPicker.value,
      table: Number(thisBooking.selectedTable),
      duration: parseInt(thisBooking.dom.duration.value),
      people: parseInt(thisBooking.dom.people.value),
      starters: [],
      phone: thisBooking.dom.phone.value,
      address: thisBooking.dom.address.value,
    };

    for (let starter of thisBooking.dom.starters) {
      if (starter.checked) {
        payload.starters.push(starter.value);
      }
    }
    console.log('payload.starters', payload.starters);

    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    };

    fetch(url, options)
      .then(function(response){
        return response.json();
      }).then(function(parsedResponse){
        console.log('parsedResponse', parsedResponse);
        thisBooking.updateDOM();
      });

    console.log('thisBooking.booked', thisBooking.booked);
  }

  initWidgets() {
    const thisBooking = this;

    //! tworzenie nowej instancji klasy `AmountWidget` równocześnie przekazując jej odpowiedni element:

    thisBooking.peopleAmount = new AmountWidget(thisBooking.dom.peopleAmount);
    //console.log('thisBooking.peopleAmount:', thisBooking.peopleAmount);

    //! Nasłuchiwanie customowego eventu = Nasłuchuje na element `thisBooking.dom.peopleAmount.addEventListener; thisBooking.dom.hoursAmount.addEventListener` i na zdarzenie `updated`.
    //? Dlaczego nasłuchujemy właśnie na ten element? Bo to na nim emitowaliśmy nasz event.
    // thisBooking.dom.peopleAmount.addEventListener('updated', function() {
    // });

    thisBooking.hoursAmount = new AmountWidget(thisBooking.dom.hoursAmount);
    // thisBooking.dom.hoursAmount.addEventListener('updated', function() {
    // });

    thisBooking.datePicker = new DatePicker(thisBooking.dom.datePicker);
    // thisBooking.dom.datePicker.addEventListener('updated', function() {
    // });

    thisBooking.hourPicker = new HourPicker(thisBooking.dom.hourPicker);
    // thisBooking.dom.hourPicker.addEventListener('updated', function() {
    // });

    thisBooking.dom.wrapper.addEventListener('updated', function(event) {
      thisBooking.updateDOM();

      if (
        event.target == thisBooking.dom.hourPicker ||
        event.target == thisBooking.dom.datePicker ||
        event.target == thisBooking.dom.peopleAmount ||
        event.target == thisBooking.dom.hoursAmount
      ){
        thisBooking.selectedTable = {};
        console.log('thisBooking.selectedTable', thisBooking.selectedTable);
        for (let table of thisBooking.dom.tables){
          table.classList.remove('selected');
        }
      }
    });

    thisBooking.dom.floor.addEventListener('click', function (event) {
      thisBooking.initTables(event);
    });

    thisBooking.dom.submit.addEventListener('click', function(event){
      event.preventDefault();
      thisBooking.sendBooking();
      console.log('clicked submit');
    });
  }
}

export default Booking; // eksportowanie domyślne