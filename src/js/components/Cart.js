import {select, classNames, templates, settings} from '../settings.js';
import utils from '../utils.js';
import CartProduct from './CartProduct.js';

const c = console.log.bind(document);

class Cart {
  constructor(element) {
    const thisCart = this;

    thisCart.products = [];

    thisCart.getElements(element);
    thisCart.initActions();

    //c('new Cart', thisCart);
  }

  //! Przygotowanie referencji do np. selectorów, czyli referencji do elementów w HTML
  getElements(element) { // Argument `element`, który otrzymaliśmy w konstruktorze jest tylko referencją elementu DOM
    const thisCart = this;

    thisCart.dom = {};

    thisCart.dom.wrapper = element;

    //! To jest definicja właściwości w metodzie `getElements(element)`
    thisCart.dom.toggleTrigger = thisCart.dom.wrapper.querySelector(select.cart.toggleTrigger); // '.cart__summary'

    thisCart.dom.productList = thisCart.dom.wrapper.querySelector(select.cart.productList); // '.cart__order-summary'

    // referencja do elementu pokazującego koszt przesyłki
    thisCart.dom.deliveryFee = thisCart.dom.wrapper.querySelector(select.cart.deliveryFee); // '.cart__order-delivery .cart__order-price-sum strong'

    // referencja do elementu pokazującego cenę końcową, ale bez kosztów przesyłki
    thisCart.dom.subtotalPrice = thisCart.dom.wrapper.querySelector(select.cart.subtotalPrice); // '.cart__order-subtotal .cart__order-price-sum strong'

    // referencja do elementów pokazujących cenę końcową
    thisCart.dom.totalPrice = thisCart.dom.wrapper.querySelectorAll(select.cart.totalPrice); // '.cart__total-price strong, .cart__order-total .cart__order-price-sum strong'

    // referencja do elementu pokazującego liczbę sztuk
    thisCart.dom.totalNumber = thisCart.dom.wrapper.querySelector(select.cart.totalNumber); // `.cart__total-number`

    // referencja do elementu formularza
    thisCart.dom.form = thisCart.dom.wrapper.querySelector(select.cart.form); // '.cart__order'

    // referencja do elementu z adresem
    thisCart.dom.address = thisCart.dom.wrapper.querySelector(select.cart.address); // '[name="address"]'

    // referencja do elementu z numerem telefonu
    thisCart.dom.phone = thisCart.dom.wrapper.querySelector(select.cart.phone); // '[name="phone"]'

  }

  initActions() {
    const thisCart = this;

    //! Dodajemy listener eventu 'click' na elemencie `thisCart.dom.toggleTrigger` // '.cart__summary'
    thisCart.dom.toggleTrigger.addEventListener('click', function() {
      //c('clicked');

      //! Handler toggluje klasę zapisaną w (classNames.cart.wrapperActive) na elemencie `thisCart.dom.wrapper`
      thisCart.dom.wrapper.classList.toggle(classNames.cart.wrapperActive);
    });

    //! Nasłuchujemy tutaj na listę produktów, w której umieszczamy produkty, w których znajduje się widget liczby sztuk, który generuje ten event.
    //! Dzięki właściwości bubbles "usłyszymy" go na tej liście. Jest dla nas informacja, że w "którymś" z produktów doszło do zmiany ilości sztuk.
    //! Nieważne nawet w którym. Ważne jest to, że w takiej sytuacji należy uruchomić update, aby ponownie przeliczyć kwoty.
    thisCart.dom.productList.addEventListener('updated', function() {
      thisCart.update();
    });

    thisCart.dom.productList.addEventListener('remove', function(event) {
      thisCart.remove(event.detail.cartProduct);
    });

    //! Dodajemy nasłuchiwacz (listener) do formularza (thisCart.dom.form - '.cart__order')
    thisCart.dom.form.addEventListener('submit', function(event) {
      event.preventDefault(); // funkcja callback zawiera instrukcję, która blokuje domyślne zachowanie formularza

      thisCart.sendOrder(); // zadaniem tej metody (w funkcji callback) jest kompletowanie informacji o zamówieniu i późniejsza jego wysyłka do serwera
    });

  }

  add(menuProduct) { // metoda dodająca produkty do koszyka
    const thisCart = this;

    //c('adding product', menuProduct);

    /* [DONE] generate HTML based on template */
    // powstaje kod HTML listy produktów

    const generatedHTML = templates.cartProduct(menuProduct); // jako szablon wykorzystano ten z podstawowymi informacjami o produkcie

    /* [DONE] create DOM using utils.createElementFromHTML */

    //! HTML to zwykły string, a element DOM to obiekt wygenerowany przez przeglądarkę na podstawie kodu HTML.
    //! Obiekt, który ma właściwości (np. innerHTML czy metody (np. getAttribute).
    //! JS nie ma wbudowanej metody, która służy do tego celu

    const generatedDOM = utils.createDOMFromHTML(generatedHTML);

    //!/* [NOT NEEDED] find cart (koszyk) container */

    //!const cartContainer = document.querySelector(select.containerOf.cart); // '#cart'

    /* [DONE] add previously generated DOM to dom.productList... */

    /* ...czyli do thisCart.dom.productList = thisCart.dom.wrapper.querySelector(select.cart.productList); // '.cart__order-summary' */

    //! 'appendChild' musi dodać jakiś element, np. div, paragraf, span etc...
    //! Nie może natomiast umieścić stringa, czyli treści oraz wielu elementów (tj. w jednej linijce kilka elementów po przecinku) w przeciwieństwie do 'append'.

    thisCart.dom.productList.appendChild(generatedDOM);

    /* [DONE] save chosen products into array `products` (thisCart.products) and start new instance of `CartProduct` */

    thisCart.products.push(new CartProduct(menuProduct, generatedDOM));
    //c('thisCart.products:', thisCart.products);

    thisCart.update();
  }

  update() {
    const thisCart = this;


    const deliveryFee = settings.cart.defaultDeliveryFee;

    thisCart.totalNumber = 0; // odpowiada całościowej liczbie sztuk - wartość startowa to 0
    thisCart.subtotalPrice = 0; // zsumowana cena za wszystko (chociaż bez kosztu dostawy) - wartość startowa to 0
    thisCart.totalPrice = 0; // cena całkowita, czyli kwota potrzebna do kupna wszystkich produktów z koszyka i koszt dostawy - wartość startowa to 0

    //! Pętla for...of umożliwia wykonywanie operacji na obiektach iterowalnych, takich jak tablice lub mapy.

    for (let product of thisCart.products) {
      thisCart.totalNumber += product.amount; // zwiększa liczbę sztuk danego produktu
      thisCart.subtotalPrice += product.price; // zwiększa się o cenę całkowitą

      //c('product:', product);
    }

    if (thisCart.subtotalPrice != 0) { // `!=` oznacza różne wartości (jeśli nie równa się zero) / czyli jeśli nie ma produktów, więc nie ma dostawy, a zatem nie ma kosztów dostawy.
      thisCart.totalPrice = thisCart.subtotalPrice + deliveryFee;
    } else {
      thisCart.totalPrice = 0;
    }
    //c('deliveryFee:', deliveryFee, 'totalNumber:', thisCart.totalNumber, 'subtotalPrice', thisCart.subtotalPrice, 'totalPrice:', thisCart.totalPrice);

    /* LUB
    if (thisCart.totalNumber === 0) {
    thisCart.deliveryFee = 0;
    thisCart.totalPrice = 0;
    } else {
    thisCart.totalPrice = thisCart.subtotalPrice + deliveryFee;
    }
    */

    /* [DONE] update the HTML Cart code within the total number of the items, subtotal price, total price and delivery fee (if 0 itmes then no delivery fee) */

    thisCart.dom.totalNumber.innerHTML = thisCart.totalNumber;

    thisCart.dom.subtotalPrice.innerHTML = thisCart.subtotalPrice;


    for(let price of thisCart.dom.totalPrice){
      price.innerHTML = thisCart.totalPrice;
    }

    if (thisCart.deliveryFee == 0) { //  operator porównania `==` = równa wartość
      deliveryFee == 0;
    } else {
      thisCart.dom.deliveryFee.innerHTML = deliveryFee;
    }
    c('Products List:', thisCart.products);
  }


  remove(event) { //! Odwołanie do Customowego Eventu w CartProduct // Cart musi wiedzieć, co dokładnie trzeba usunąć. W tym przypadku przekazujemy więc wraz z eventem dodatkowo odwołanie do tej instancji, dla której kliknięto guzik usuwania.
    //! Każdy `cartProduct` w koszyku jest przechowywany na dwa sposoby: 1. instancja `cartProductu` jest przechowywana w `thisCart.products`; 2. div reprezentujący ten `carProduct` jest zapisany w HTML-u
    const thisCart = this;

    /* [DONE] remove product's DOM  */
    //! Usunięcie elementu z DOM można wykonać za pomocą metody remove wykonanej na elemencie, który ma zostać usunięty.
    //! Najprościej taką reprezentację produktu w HTML rozpoznać po wrapperze - "opakowaniu". Każda bowiem instancja `cartProduct` ma właściwość `dom.wrapper`, która wskazuje wlaśnie na tę reprezentację w HTML tego produktu.

    event.dom.wrapper.remove();

    /* [DONE] locate and remove the product from an array */

    const removeProduct = thisCart.products.indexOf(event);
    thisCart.products.splice(removeProduct, 10); // array.splice(index, howmany (Number of items to be removed.), item1, ....., itemX (New elements(s) to be added.))
    //c('removeProduct', removeProduct);

    thisCart.update();
  }

  sendOrder() {
    const thisCart = this;

    const url = settings.db.url + '/' + settings.db.orders; // endpoint z którym chcemy się połączyć - http://localhost:3131/orders

    const payload = {
      address: thisCart.dom.address.value, // Aby dojść do wartości elementu input, należy skorzystać z jego właściwości `value`
      phone: thisCart.dom.phone.value, // Aby dojść do wartości elementu input, należy skorzystać z jego właściwości `value`
      totalPrice: thisCart.totalPrice,
      subtotalPrice: thisCart.subtotalPrice,
      totalNumber: thisCart.totalNumber,
      deliveryFee: settings.cart.defaultDeliveryFee,
      products: [],
    };

    //! tutaj następuje zapełnienie tablicy `payload.products` nie całymi instancjami produktów w koszyku, a tylko mini obiektami z ich podsumowaniem z `getData`, a dokładniej z obiektu `data`.
    for(let prod of thisCart.products) {
      payload.products.push(prod.getData());
    }
    //c('Zawartość payload', payload);

    //! Przygotowanie danych do wysyłki do serwera
    //! Serwer komunikuje się z nami przy użyciu formatu JSON, a `payload` to zwykły obiekt JS-owy.
    //! Musimy więc skonwertować go jeszcze na format JSON. Warto również przy użyciu nagłówków (headers) poinformować serwer o tym,
    //! że ma spodziewać się właśnie JSON-a:

    //! "Brzydsza" wersja:
    /*
    fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });
    */

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
      });
  }
}

export default Cart;