/* global Handlebars, utils, dataSource */ // eslint-disable-line no-unused-vars

{
  'use strict';

  const c = console.log.bind(document);

  const select = {
    templateOf: {
      menuProduct: '#template-menu-product',
    },
    containerOf: {
      menu: '#product-list',
      cart: '#cart',
    },
    all: {
      menuProducts: '#product-list > .product',
      menuProductsActive: '#product-list > .product.active',
      formInputs: 'input, select',
    },
    menuProduct: {
      clickable: '.product__header',
      form: '.product__order',
      priceElem: '.product__total-price .price',
      imageWrapper: '.product__images',
      amountWidget: '.widget-amount',
      cartButton: '[href="#add-to-cart"]',
    },
    widgets: {
      amount: {
        input: 'input[name="amount"]',
        linkDecrease: 'a[href="#less"]',
        linkIncrease: 'a[href="#more"]',
      },
    },
  };

  const classNames = {
    menuProduct: {
      wrapperActive: 'active',
      imageVisible: 'active',
    },
  };

  const settings = {
    amountWidget: {
      defaultValue: 1,
      defaultMin: 1,
      defaultMax: 9,
    }
  };

  const templates = {
    menuProduct: Handlebars.compile(document.querySelector(select.templateOf.menuProduct).innerHTML),
  };

  class Product { //! Przy tworzeniu każdej instancji uruchamia się funkcja konstruktora, która uruchamia dla danego obiektu metodę renderInMenu.

    constructor(id, data) {
      const thisProduct = this;

      thisProduct.id = id;
      thisProduct.data = data;

      thisProduct.renderInMenu(); //? To wywołanie uruchamia się jako czwarte?
      thisProduct.initAccordion(); //! Wywołanie piąte. Chcemy, żeby produkty od razu, od samego początku mogły być zwijane/rozwijane (dlatego wywołanie znajduje się już w konstrukotrze).
      console.log('new Product:', thisProduct);
    }

    renderInMenu() { //! W deklaracji tej metody znajdują się dane do powyższego czwartego wywołania.
      //! Metoda ta tworzy element DOM wygenerowany na podstawie szablonu HTML reprezentujący właśnie dany produkt i "dokleja" go do strony.
      const thisProduct = this;

      /* [DONE] generate HTML based on template */

      //! Klasa Product za pomocą metody renderInMenu bierze dane źródłowe produktu,
      //! "wrzuca je" do szablonu, i tak powstaje kod HTML pojedynczego produktu.

      const generatedHTML = templates.menuProduct(thisProduct.data);

      //console.log('Generated HTML:', generatedHTML);

      /* [DONE] create element using utils.createElementFromHTML */

      //! HTML to zwykły string, a element DOM to obiekt wygenerowany przez przeglądarkę na podstawie kodu HTML.
      //! Obiekt, który ma właściwości (np. innerHTML czy metody (np. getAttribute).
      //! JS nie ma wbudowanej metody, która służy do tego celu

      //? Dlaczego nie "const"? -> stworzony element DOM zapisujemy od razu jako właściwość naszej instancji.
      //? To dobra praktyka. Dzięki temu będziemy mieli do niego dostęp również w innych metodach instancji. Nie tylko w renderInMenu (np. też w initAccordion).

      thisProduct.element = utils.createDOMFromHTML(generatedHTML);

      /* [DONE] find menu container */

      const menuContainer = document.querySelector(select.containerOf.menu);

      /* [DONE] add element to menu */

      //! 'appendChild' musi dodać jakiś element, np. div, paragraf, span etc...
      //! Nie może natomiast umieścić stringa, czyli treści oraz wielu elementów (tj. w jednej linijce kilka elementów po przecinku) w przeciwieństwie do 'append'.

      //! Metoda renderInMenu jest uruchamiana w konstruktorze klasy, to przy tworzeniu każdej nowej instancji dla danego produktu, od razu renderuje się on na stronie.

      menuContainer.appendChild(thisProduct.element);

    }

    initAccordion() { //! To jest deklaracja metody.
      const thisProduct = this;

      /* [DONE] find the clickable trigger (the element that should react to clicking) */

      //! thisProduct.element to DOM, czyli obiekt wygenerowany przez przeglądarkę na podstawie kodu HTML.
      //? DOM - Document Object Model

      const clickableTrigger = thisProduct.element.querySelector(select.menuProduct.clickable);

      /* [DONE] START: add event listener to clickable trigger on event click */

      clickableTrigger.addEventListener('click', function(event) {

        c('clicked');

        /* [DONE] prevent default action for event */

        event.preventDefault();

        /* [DONE] find active product (product that has active class) */
        //! Szukamy elementu o klasie 'product' i klasie 'active', czyli po prostu aktywnego produktu.
        //? Zapis w skrócie: menuProductsActive: '#product-list > .product.active' | co oznacza ">"?

        const activeProduct = document.querySelector(select.all.menuProductsActive);

        /* [DONE] if there is active product and it's not thisProduct.element, remove class active from it */
        //! aby sprawdzić, czy dany element DOM udało się znaleźć, wystarczy sprawdzić, czy nie jest nullem if(activeProduct)

        /* //! Wyjaśnienie, cit.:
        Zauważ, że nie tylko chcemy sprawdzić, czy udało się znaleźć aktywny produkt, ale również, czy nie jest on czasem tym produktem, na który klikamy. Dlaczego?
        Pomyśl nad taką sytuacją. Powiedzmy, że aktualnie na stronie jest rozwinięty jeden produkt – pizza. Co stałoby się w momencie kliknięcia, gdybyśmy nie sprawdzali, czym jest
        znaleziony aktywny produkt? Oczekiwalibyśmy oczywiście, że kliknięcie na aktywny produkt, spowoduje jego zwinięcie. A co naprawdę by się stało?
        Nasza funkcja najpierw jako aktywny produkt znalazłaby... naszą pizzę i ją zwinęła. Następnie nasz kod niżej, który ma
        "togglować" klasę na klikniętym produkcie, ustaliłby, że na naszym elemencie (pizzy) klasy active nie ma, więc by ją... ponownie dodał.
        Tym samym nasza pizza znowu by się rozwinęła.
        */

        //! do sprawdzenia, czy dany aktywny produkt jest różny od elementu bieżącego produktu, wystarczy skorzystać z
        //! takiego samego operatora porównania, jak przy porównywaniu liczb.

        //! thisProduct.element to "bieżący produkt"

        if (activeProduct !== null && activeProduct != thisProduct.element) {
          activeProduct.classList.remove('active');
        }

        /* [DONE] toggle active class on thisProduct.element */

        //! Ważne: toggle - dodanie klasy jeśli jej nie było, i vice versa

        thisProduct.element.classList.toggle('active');

        c(thisProduct.element);

      });

    }
  }

  const app = {
    initMenu: function() { //! Metoda app.initMenu przejdzie po każdym produkcie z osobna i stworzy dla niego instancję Product, czego
      //! wynikiem będzie również utworzenie na stronie reprezentacji HTML każdego z produktów w thisApp.data.products.

      const thisApp = this;
      console.log('thisApp.data', thisApp.data );

      for (let productData in thisApp.data.products) {

        /*
        Tworząc nową instancję, przekazujemy do konstruktora aż dwa argumenty. Jako pierwszy chcemy przekazać 'productData'.
        Pętla 'for...in' przechodzi po właściwościach obiektu i pod zmienną przechowuje zawsze tylko i wyłącznie nazwę
        aktualnie "obsługiwanej" właściwości.
        */
        new Product(productData, thisApp.data.products[productData]); //? Dlaczego 'productData'? <- jest to po prostu zmienna zapisywana w pamięci RAM.
      }
    },

    initData: function() {
      const thisApp = this;

      /*
      'thisApp.data' to tylko referencja do tych samych danych, do których kieruje też stała dataSource.
      */
      thisApp.data = dataSource;
    },

    init: function(){
      const thisApp = this;
      console.log('*** App starting ***');
      console.log('thisApp:', thisApp);
      console.log('classNames:', classNames);
      console.log('settings:', settings);
      console.log('templates:', templates);

      /*
      Oczekujemy, iż thisApp (a więc 'this') ma wskazywać w metodzie 'init' na cały obiekt app.
      Metoda 'init' była uruchamiana w taki sposób – 'app.init', a więc na obiekcie app. Dlatego też zgodnie z zasadą "Implicit binding rule"
      wskaże właśnie na app.
      */

      thisApp.initData(); // To wywołanie uruchamia się jako drugie:
      //! Ma zadanie przygotować nam łatwy dostęp do danych. Przypisuje więc do app.data (właściwości całego obiektu app) referencję
      //! do dataSource, czyli po prostu danych, z których będziemy korzystać z aplikacji. Znajduje się tam m.in. obiekt products ze strukturą naszych produktów.


      thisApp.initMenu(); // To wywołanie uruchamia się jako trzecie.
      //! Metoda ta jest wywoływana po wcześniejszej, gdyż korzysta z przygotowanej wcześniej referencji do danych (thisApp.data).
      //! Jej zadaniem jest przejście po wszystkich obiektach produktów z thisApp.data.products (cake, breakfast itd.) i utworzenie
      //! dla każdego z nich instancji klasy Product.
      //!
    },
  };

  app.init(); // To wywołanie uruchamia się jako pierwsze.
}
