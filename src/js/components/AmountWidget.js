import {select, settings} from '../settings.js';
import BaseWidget from './BaseWidget.js';

class AmountWidget extends BaseWidget { // ta klasa jest rozszerzeniem klasy BaseWidget

  constructor(element) {
    super(element, settings.amountWidget.defaultValue); // wywołujemy konstruktor klasy nadrzędnej, czyli konstruktor klasy BaseWidget

    const thisWidget = this;
    thisWidget.getElements(element);
    //thisWidget.setValue(thisWidget.dom.input.value); //! tym zajmie się już konstruktor klasy nadrzędnej
    //! metoda `initActions` uruchamia się automatycznie, od razu po utworzeniu instancji.
    thisWidget.initActions();

    //console.log('AmounWidget:', thisWidget);
    //console.log('constructor arguments:', element);
  }

  getElements(){
    const thisWidget = this;

    //thisWidget.element = element; //! tym zajmuje się teraz klasa BaseWidget
    //thisWidget.value = settings.amountWidget.defaultValue; //! jest już w konstruktorze powyżej
    thisWidget.dom.input = thisWidget.dom.wrapper.querySelector(select.widgets.amount.input);
    thisWidget.dom.linkDecrease = thisWidget.dom.wrapper.querySelector(select.widgets.amount.linkDecrease);
    thisWidget.dom.linkIncrease = thisWidget.dom.wrapper.querySelector(select.widgets.amount.linkIncrease);
  }

  isValid(value) {
    return !isNaN(value) // sprawdzamy czy `value` nie jest nieLiczbą (Not A Number)
      && value >= settings.amountWidget.defaultMin
      && value <= settings.amountWidget.defaultMax;
  }

  renderValue() { // aby bieżąca wartość widgetu została wyświetlona na stronie
    const thisWidget = this;

    thisWidget.dom.input.value = thisWidget.value; // aktualizuje wartość samego inputu
  }

  initActions() {
    const thisWidget = this;

    //! dla thisWidget.dom.input listener eventu to `change`,
    //! zaś jego handler używa metody `setValue` z argumentem z wartością inputa
    thisWidget.dom.input.addEventListener('change', function() {
      //c('changed');

      //thisWidget.setValue(thisWidget.dom.input.value); // zmiana na potrzeby gettera w BaseWidget
      thisWidget.value = thisWidget.dom.input.value;
    });

    //! dla thisWidget.dom.linkDecrease listener eventu to `click`,
    //! zaś jego handler powstrzymuje domyślną akcję dla tego eventu,
    //! oraz używa metody `setValue` z argumentem `thisWidget.value` pomniejszonym o 1
    thisWidget.dom.linkDecrease.addEventListener('click', function(event) {
      //c('clicked');

      event.preventDefault();
      thisWidget.setValue(thisWidget.value -1);

    });

    //! dla thisWidget.dom.linkDecrease listener eventu to `click`,
    //! zaś jego handler powstrzymuje domyślną akcję dla tego eventu,
    //! oraz używa metody `setValue` z argumentem `thisWidget.value` powiększonym o 1
    thisWidget.dom.linkIncrease.addEventListener('click', function(event) {
      //c('clicked');

      event.preventDefault();
      thisWidget.setValue(thisWidget.value +1);

    });
  }
}

export default AmountWidget; // eksportowanie domyślne