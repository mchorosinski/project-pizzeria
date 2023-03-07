class BaseWidget {
  constructor(wrapperElement, initialValue) {
    const thisWidget = this;

    thisWidget.dom = {};
    thisWidget.dom.wrapper = wrapperElement;

    thisWidget.correctValue = initialValue;
  }

  get value() { // to jest getter
    const thisWidget = this;

    return thisWidget.correctValue;
  }

  set value(value) { // to jest setter
    const thisWidget = this;

    //! Każdy input, nawet o typie `number`, zawsze zwraca wartość w formacie tekstowym.
    //! Nawet wpisanie więc 10 da nam nie liczbę 10, a tekst '10'. parseInt zadba o konwersję takiej przykładowej '10' do liczby 10.
    const newValue = thisWidget.parseValue(value); // przekonwertowanie argumentu na liczbę

    /* [DONE] Add validation */

    //! Sprawdzamy, czy wartość, która przychodzi do funkcji, jest inna niż ta, która jest już aktualnie w `thisWidget.correctValue` oraz ustawiamy zakres akceptowalnych wartości, tj. liczba sztuk: 1-10.
    if(thisWidget.correctValue !== newValue && !isNaN(newValue) && thisWidget.isValid(newValue)) { // `!==` ozanacza różne wartości i typy danych; `!isNaN` nie jest nullem, ponieważ jeśli parseInt natrafi na tekst, którego nie da się skonwertować na liczbę (np. abc), to zwróci null
      thisWidget.correctValue = newValue; // zapisuje we właściwości thisWidget.correctValue wartość przekazanego argumentu
      //! Wywołanie metody - zadbać o to, aby uruchamiała się dopiero wtedy, kiedy nowa wartość (czyli `input.value`), którą chcemy ustawić, faktycznie jest poprawna.
      //! Event `updated` uruchomi się przy zmianie wartości, ale tylko na taką, która wciąż będzie poprawna.
      thisWidget.announce();
    }

    thisWidget.renderValue();
  }

  setValue(value) {
    const thisWidget = this;

    thisWidget.value = value;
  }

  parseValue(value) { // metoda ta wykorzystywana jest do tego, aby przekształcić wartość, którą chcemy ustawić, na odpowiedni typ lub format.
    return parseInt(value);
  }

  isValid(value) {
    return !isNaN(value); // sprawdzamy czy `value` nie jest nieLiczbą (Not A Number)
  }

  renderValue() { // aby bieżąca wartość widgetu została wyświetlona na stronie
    const thisWidget = this;

    thisWidget.dom.wrapper.innerHTML = thisWidget.value; // aktualizuje wartość samego inputu
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
    thisWidget.dom.wrapper.dispatchEvent(event);
  }
}

export default BaseWidget;