import {select, settings} from '../settings.js';

class AmountWidget {

  constructor(element) {
    const thisWidget = this;
    thisWidget.getElements(element);
    thisWidget.setValue(thisWidget.input.value);
    //! metoda `initActions` uruchamia się automatycznie, od razu po utworzeniu instancji.
    thisWidget.initActions();

    //c('AmounWidget:', thisWidget);
    //c('constructor arguments:', element);
  }

  getElements(element){
    const thisWidget = this;

    thisWidget.element = element;
    thisWidget.value = settings.amountWidget.defaultValue;
    thisWidget.input = thisWidget.element.querySelector(select.widgets.amount.input);
    thisWidget.linkDecrease = thisWidget.element.querySelector(select.widgets.amount.linkDecrease);
    thisWidget.linkIncrease = thisWidget.element.querySelector(select.widgets.amount.linkIncrease);
  }

  setValue(value) {
    const thisWidget = this;

    //! Każdy input, nawet o typie `number`, zawsze zwraca wartość w formacie tekstowym.
    //! Nawet wpisanie więc 10 da nam nie liczbę 10, a tekst '10'. parseInt zadba o konwersję takiej przykładowej '10' do liczby 10.
    const newValue = parseInt(value); // przekonwertowanie argumentu na liczbę

    /* [DONE] Add validation */

    //! Sprawdzamy, czy wartość, która przychodzi do funkcji, jest inna niż ta, która jest już aktualnie w `thisWidget.value` oraz ustawiamy zakres akceptowalnych wartości, tj. liczba sztuk: 1-10.
    if(thisWidget.value !== newValue && !isNaN(newValue) && newValue >= settings.amountWidget.defaultMin && newValue <= settings.amountWidget.defaultMax) { // `!==` ozanacza różne wartości i typy danych; `!isNaN` nie jest nullem, ponieważ jeśli parseInt natrafi na tekst, którego nie da się skonwertować na liczbę (np. abc), to zwróci null
      thisWidget.value = newValue; // zapisuje we właściwości thisWidget.value wartość przekazanego argumentu
    }

    thisWidget.input.value = thisWidget.value; // aktualizuje wartość samego inputu

    //! Wywołanie metody - zadbać o to, aby uruchamiała się dopiero wtedy, kiedy nowa wartość (czyli `input.value`), którą chcemy ustawić, faktycznie jest poprawna.
    //! Event `updated` uruchomi się przy zmianie wartości, ale tylko na taką, która wciąż będzie poprawna.
    thisWidget.announce();

  }

  initActions() {
    const thisWidget = this;

    //! dla thisWidget.input listener eventu to `change`,
    //! zaś jego handler używa metody `setValue` z argumentem z wartością inputa
    thisWidget.input.addEventListener('change', function() {
      //c('changed');

      thisWidget.setValue(thisWidget.input.value);
    });

    //! dla thisWidget.linkDecrease listener eventu to `click`,
    //! zaś jego handler powstrzymuje domyślną akcję dla tego eventu,
    //! oraz używa metody `setValue` z argumentem `thisWidget.value` pomniejszonym o 1
    thisWidget.linkDecrease.addEventListener('click', function(event) {
      //c('clicked');

      event.preventDefault();
      thisWidget.setValue(thisWidget.value -1);

    });

    //! dla thisWidget.linkDecrease listener eventu to `click`,
    //! zaś jego handler powstrzymuje domyślną akcję dla tego eventu,
    //! oraz używa metody `setValue` z argumentem `thisWidget.value` powiększonym o 1
    thisWidget.linkIncrease.addEventListener('click', function(event) {
      //c('clicked');

      event.preventDefault();
      thisWidget.setValue(thisWidget.value +1);

    });
  }

  //! CUSTOMOWY EVENT!
  announce() {
    const thisWidget = this;

    //! Metody `announce` tworzy instancje klasy Event, wbudowanej w silnik JS. Jest to klasa odpowiedzialna za stworzenie obiektu "eventu". Następnie, ten event zostanie wyemitowany na kontenerze widgetu.
    //! CZYLI: użytkownik klika gdzieś na stronie, to przeglądarka robi dokładnie to samo co my teraz.
    //! Również tworzy event click w podobny sposób przy użyciu klasy Event, a następnie emituje go na tym klikniętym elemencie za pomocą metody `dispatchEvent` - później koniecznie jest nasłuchiwanie tego customowego zdarzenia w `initAmountWidget`.
    const event = new CustomEvent('updated', {
      bubbles: true //! włączamy właściwość `bubbles`
    });
    thisWidget.element.dispatchEvent(event);
  }
}

export default AmountWidget; // eksportowanie domyślne