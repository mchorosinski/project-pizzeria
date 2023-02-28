import { settings, select, classNames} from './settings.js';
import Product from './components/Product.js';
import Cart from './components/Cart.js';
import Booking from './components/Booking.js';

const app = {

  initPages: function(){
    const thisApp = this;

    thisApp.pages = document.querySelector(select.containerOf.pages).children;

    //! Aktywacja pierwszej z podstron:
    thisApp.navLinks = document.querySelectorAll(select.nav.links);

    const idFromHash = window.location.hash.replace('#/', '');
    //console.log('idFromHash:', idFromHash);

    //! sprawdzanie czy strona o podanym id istnieje (np. przy ręcznym wpisaniu randomowego id w przeglądarce):

    let pageMatchingHash = thisApp.pages[0].id;
    //console.log('pageMatchingHash:', pageMatchingHash);

    for(let page of thisApp.pages){
      if(page.id == idFromHash){
        pageMatchingHash = page.id;
        break;
      }
    }

    //thisApp.activatePage(thisApp.pages[0].id); // pierwsza ze znalezionych stron
    thisApp.activatePage(pageMatchingHash);

    //! Dodanie eventListenerów do linków nawigacyjnych:
    for(let link of thisApp.navLinks) {
      link.addEventListener('click', function(event){ // ma on nasłuchiwać eventu 'click'i wykonywać funkcję
        const clickedElement = this;
        event.preventDefault();

        /* get page id from href attribute */

        const id = clickedElement.getAttribute('href').replace('#', ''); // replace na pusty ciąg znaków - ponieważ href zaczyna się od '#', który nie jest częścią id podstrony

        /* run thisApp.activatePage with that id */

        thisApp.activatePage(id);

        /* change URL hash */

        window.location.hash = '#/' + id;

      });
    }
  },

  activatePage: function(pageId) { // funkcja jako argument otrzymała tekst order lub booking
    const thisApp = this;

    /* add class "active" to matching pages, remove from non-matching */

    //! pętla która przechodzi przez wszystkie kontenery podstron:

    for(let page of thisApp.pages){
      // if(page.id == pageId) {
      //   page.classList.add(classNames.pages.active);
      // } else {
      //   page.classList.remove(classNames.pages.active);
      // }

      page.classList.toggle(classNames.pages.active, page.id == pageId); // ten zapis jest równoznaczny z powyższym
      //console.log('page:', page);
      //console.log('pageId:', pageId);
      //console.log('page.id:', page.id);

    }

    /* add class "active" to matching links, remove from non-matching */

    for(let link of thisApp.navLinks){
      link.classList.toggle(
        classNames.nav.active,
        link.getAttribute('href') == '#' + pageId // hash, ponieważ nasze linki mają dodany '#' przed id, np "#order", "#booking" w main-nav.
      );
    }
  },

  initMenu: function () { //! Metoda app.initMenu przejdzie po każdym produkcie z osobna i stworzy dla niego instancję Product, czego
    //! wynikiem będzie również utworzenie na stronie reprezentacji HTML każdego z produktów w thisApp.data.products.

    const thisApp = this;
    //console.log('thisApp.data', thisApp.data);

    for (let productData in thisApp.data.products) {

      /*
      Tworząc nową instancję, przekazujemy do konstruktora aż dwa argumenty. Jako pierwszy chcemy przekazać 'thisApp.data.products[productData].id'.
      Pętla 'for...in' przechodzi po właściwościach obiektu i pod zmienną przechowuje zawsze tylko i wyłącznie nazwę
      aktualnie "obsługiwanej" właściwości.
      */
      new Product(thisApp.data.products[productData].id, thisApp.data.products[productData]); //? Dlaczego 'productData'? <- jest to po prostu zmienna zapisywana w pamięci RAM.
    }
  },

  initData: function () {
    const thisApp = this;

    thisApp.data = {};

    const url = settings.db.url + '/' + settings.db.products; // czyli: http://localhost:3131/products

    fetch(url) // Najpierw za pomocą funkcji fetch wysyłamy zapytanie (request) pod podany adres endpointu - > http://localhost:3131/products
      //! Należy pamiętać, że odpowiedź jaką otrzymamy jest obiektem typu Response, którego nie możemy wprost odczytać.
      //! Należy na niej wykonać metodę text lub json, aby uzyskać wartość gotową do odczytu.
      .then(function (rawResponse) {
        // Dalej konwertujemy tę odpowiedź na obiekt JS-owy
        return rawResponse.json(); // Następnie otrzyma odpowiedź, która jest w formacie JSON
        //! JSON Data Types to: string, numbers, obiekt, array, boolean, null
      })
      //! Te metoda zwracaja Promise, więc ponownie musimy użyć metody then, aby odczytać sparsowaną odpowiedź serwera.
      .then(function (parsedResponse) {
        //console.log('parsedResponse', parsedResponse);

        /* [DONE] save parsedResponse as thisApp.data.products */

        thisApp.data.products = parsedResponse;

        /* [DONE] execute initMenu method */

        thisApp.initMenu(); // To wywołanie uruchamia się jako drugie.
        //! Metoda ta jest wywoływana po wcześniejszej, gdyż korzysta z przygotowanej wcześniej referencji do danych (thisApp.data).
        //! Jej zadaniem jest przejście po wszystkich obiektach produktów z thisApp.data.products (cake, breakfast itd.) i utworzenie
        //! dla każdego z nich instancji klasy Product.

      });

    //console.log('thisApp.data', JSON.stringify(thisApp.data)); // Po otrzymaniu skonwertowanej odpowiedzi parsedResponse, wyświetlamy ją w konsoli.

    /* 1. Połącz się z adresem url przy użyciu metody fetch. */
    /* 2. Jeśli połączenie się zakończy, to wtedy (pierwsze .then) skonwertuj dane do obiektu JS-owego. */
    /* 3. Kiedy i ta operacja się zakończy, to wtedy (drugie .then) pokaż w konsoli te skonwertowane dane. */

    /* Zauważ, że obie funkcje w then uruchomią się dopiero w momencie zakończenia jakiejś operacji.
       Pierwsze then czeka na zakończenie reqestu, a drugie konwersji danych. Wcześniej JS nawet ich nie "dotknie". */
  },

  initCart: function () { // inicjacja instancji koszyka // W aplikacji będzie tylko jeden koszyk, więc wykorzystujemy tę klasę tylko raz.
    const thisApp = this;

    const cartElem = document.querySelector(select.containerOf.cart); // Konstruktor klasy `Cart` oczekuje na przekazanie referencji do diva, w którym ten koszyk ma być obecny.

    //! Przekazujemy klasie `Cart` wrapper (czyli kontener, element okalający) koszyka.

    thisApp.cart = new Cart(cartElem);

    thisApp.productList = document.querySelector(select.containerOf.menu);

    thisApp.productList.addEventListener('add-to-cart', function(event){
      app.cart.add(event.detail.product);
    }); // handlerem tego eventu jest anonimowa funkcja przyjmująca 'event'
  },

  initBooking: function () { // inicjacja instancji klasy Booking w Booking.js
    const thisApp = this;

    //! znajdowanie kontenera widgetu do rezerwacji stron, którego selektor mamy zapisany w select.containerOf.booking:

    const bookingPage = document.querySelector(select.containerOf.booking);

    //! tworzenie nowej instancji klasy Booking i przekazywaniedo konstruktora kontenera, który przed chwilą znaleźliśmy:

    thisApp.booking = new Booking(bookingPage);
  },

  init: function () {
    const thisApp = this;
    //console.log('*** App starting ***');
    //console.log('thisApp:', thisApp);
    //console.log('classNames:', classNames);
    //console.log('settings:', settings);
    //console.log('templates:', templates);

    thisApp.initPages();

    /*
    Oczekujemy, iż thisApp (a więc 'this') ma wskazywać w metodzie 'init' na cały obiekt app.
    Metoda 'init' była uruchamiana w taki sposób – 'app.init', a więc na obiekcie app. Dlatego też zgodnie z zasadą "Implicit binding rule"
    wskaże właśnie na app.
    */

    thisApp.initData();
    //! Ma zadanie przygotować nam łatwy dostęp do danych. Przypisuje więc do app.data (właściwości całego obiektu app) referencję
    //! do dataSource, czyli po prostu danych, z których będziemy korzystać z aplikacji. Znajduje się tam m.in. obiekt products ze strukturą naszych produktów.

    thisApp.initCart();

    thisApp.initBooking();
  },
};

app.init(); // To wywołanie uruchamia się jako pierwsze.

