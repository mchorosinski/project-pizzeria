import {templates, select} from '../settings.js';
import AmountWidget from './AmountWidget.js';

class Booking {
  constructor(element){
    const thisBooking = this;

    //! odebranie referencji do kontenera przekazanej w app.initBooking, jako argument (np. o nazwie element):

    //thisBooking.getElements(element);

    //! wywołanie metody render, przekazując tę referencję dalej (render musi mieć w końcu dostęp do kontenera):

    thisBooking.render(element);
    thisBooking.initWidgets();
  }

  render(element) {
    const thisBooking = this;

    //! generowanie kodu HTML za pomocą szablonu templates.bookingWidget, przy czym nie musimy przekazywać do niego żadnych danych, gdyż ten szablon nie oczekuje na żaden placeholder:

    const generatedHTML = templates.bookingWidget;

    thisBooking.dom = {};

    thisBooking.dom.wrapper = element;

    //! zmiana zawartości wrappera (innerHTML) na kod HTML wygenerowany z szablonu:

    thisBooking.dom.wrapper.innerHTML = generatedHTML;

    thisBooking.dom.peopleAmount = element.querySelector(select.booking.peopleAmount);
    thisBooking.dom.hoursAmount = element.querySelector(select.booking.hoursAmount);

  }

  initWidgets() {
    const thisBooking = this;

    //! tworzenie nowej instancji klasy `AmountWidget` równocześnie przekazując jej odpowiedni element:

    thisBooking.peopleAmountWidget = new AmountWidget(thisBooking.dom.peopleAmount);

    //! Nasłuchiwanie customowego eventu = Nasłuchuje na element `thisBooking.dom.peopleAmountWidget.addEventListener; thisBooking.dom.hoursAmountWidget.addEventListener` i na zdarzenie `updated`.
    //? Dlaczego nasłuchujemy właśnie na ten element? Bo to na nim emitowaliśmy nasz event.
    thisBooking.dom.peopleAmountWidget.addEventListener('updated', function() {
    });

    thisBooking.hoursAmountWidget = new AmountWidget(thisBooking.dom.hoursAmount);
    thisBooking.dom.hoursAmountWidget.addEventListener('updated', function() {
    });

  }

}

export default Booking; // eksportowanie domyślne