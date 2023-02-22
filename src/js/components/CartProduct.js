import {select} from '../settings.js';
import AmountWidget from './AmountWidget.js';

const c = console.log.bind(document);

class CartProduct {
  // Pierwszy argument przyjmuje referencję do obiektu podsumowania, zaś drugi referencję do utworzonego dla tego produktu elementu w HTML-u (generatedDOM)
  constructor(menuProduct, element) {
    const thisCartProduct = this;

    // właściwości z argumentu `menuProduct` przypisane do pojedynczych właściwości
    thisCartProduct.id = menuProduct.id;
    thisCartProduct.amount = menuProduct.amount; // liczba nowych sztuk
    thisCartProduct.name = menuProduct.name;
    thisCartProduct.price = menuProduct.price;
    thisCartProduct.priceSingle = menuProduct.priceSingle;
    thisCartProduct.params = menuProduct.params;

    thisCartProduct.getElements(element); // `element` to referencja do oryginalnego elementu DOM
    thisCartProduct.initAmountWidget();
    thisCartProduct.initActions();

    //c('new Cart Product', thisCartProduct);
  }

  //! Przygotowanie referencji do np. selectorów, czyli referencji do elementów w HTML
  getElements(element) { // Argument `element`, który otrzymaliśmy w konstruktorze jest tylko referencją elementu DOM
    const thisCartProduct = this;

    thisCartProduct.dom = {};

    thisCartProduct.dom.wrapper = element;

    thisCartProduct.dom.amountWidget = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.amountWidget); // '.widget-amount'

    thisCartProduct.dom.price = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.price); // '.cart__product-price'

    thisCartProduct.dom.edit = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.edit); // '[href="#edit"]'

    thisCartProduct.dom.remove = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.remove); // '[href="#remove"]'

  }

  //! Metoda initAmountWidget jest odpowiedzialna za utworzenie nowej instancji klasy AmountWidget i zapisywanie jej we właściwości produktu
  //! Od razu przekazujemy do konstruktora referencję do naszego diva z inputem i buttonami tak, jak oczekiwała na to klasa AmountWidget
  initAmountWidget() {
    const thisCartProduct = this;

    // tworzenie nowej instancji klasy `AmountWidget` równocześnie przekazując jej odpowiedni element, na którym ma pracować oraz liczbę nowych sztuk
    thisCartProduct.amountWidget = new AmountWidget(thisCartProduct.dom.amountWidget);

    //! Nasłuchiwanie customowego eventu = Nasłuchuje na element `thisCartProduct.dom.amountWidget.addEventListener` i na zdarzenie `updated`.
    //? Dlaczego nasłuchujemy właśnie na ten element? Bo to na nim emitowaliśmy nasz event.
    //! Właściwość thisCartProduct.dom.amountWidget, kórej wartością jest referencja do elementu o selektorze `select.cartProduct.amountWidget` - '.widget-amount'
    thisCartProduct.dom.amountWidget.addEventListener('updated', function() {
      thisCartProduct.amount = thisCartProduct.amountWidget.value; // liczba nowych sztuk
      thisCartProduct.price = thisCartProduct.amount * thisCartProduct.priceSingle;

      //aby zmienić swój innerHTML, obiekt musi być elementem HTML-owym
      thisCartProduct.dom.price.innerHTML = thisCartProduct.price; // aktualizacja kwoty widocznej w samej reprezentacji HTML-a tego produktu - referencja do odpowiedniego elementu w HTML
    });
  }

  remove() {
    const thisCartProduct = this;

    const event = new CustomEvent('remove', {
      bubbles: true,
      //! `detail` możesz rozumieć jako "szczegóły", które mają być przekazywane wraz z eventem.
      detail: { // W tej właściwości można przekazać dowolne informacje do handlera eventu. Bowiem teraz `Cart` będzie musiało wiedzieć, co dokładnie trzeba usunąć. W tym przypadku przekazujemy więc wraz z eventem dodatkowo odwołanie do tej instancji, dla której kliknięto guzik usuwania.
        cartProduct: thisCartProduct,
      },
    });

    thisCartProduct.dom.wrapper.dispatchEvent(event);
    c('clicked remove');
  }

  initActions() {
    const thisCartProduct = this;

    //! Dodajemy listener eventu 'click' na elemencie `thisCartProduct.dom.edit` // '[href="#edit"]'
    thisCartProduct.dom.edit.addEventListener('click', function(event) {

      event.preventDefault();
    });

    //! Dodajemy listener eventu 'click' na elemencie `thisCartProduct.dom.remove` // '[href="#remove"]'
    thisCartProduct.dom.remove.addEventListener('click', function(event) {

      event.preventDefault();

      thisCartProduct.remove();
    });
  }

  getData() {
    const thisCartProduct = this;

    //! obiekt `data` ma na celu przekazanie wybranych właściwości z `thisCartProduct` pomocnych/niezbędnych przy zamówieniu i wykorzystaniu ich później w metodzie `Cart.sendOrder`, a dokładniej w obiekcie `payload.products`.
    const data = {
      id: thisCartProduct.id,
      amount: thisCartProduct.amount,
      price: thisCartProduct.price,
      priceSingle: thisCartProduct.priceSingle,
      name: thisCartProduct.name,
      params: thisCartProduct.params,
    };
    return(data); //w ten sposób funkcja będzie zwracała cały obiekt `data`
  }
}

export default CartProduct; // eksportowanie domyślne