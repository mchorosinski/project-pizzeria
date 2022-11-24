/* global Handlebars, utils, dataSource */ // eslint-disable-line no-unused-vars

{
  'use strict';

  const c = console.log.bind(document);

  const select = {
    templateOf: {
      menuProduct: '#template-menu-product',
      cartProduct: '#template-cart-product',
    },
    containerOf: {
      menu: '#product-list',
      cart: '#cart',
    },
    all: {
      //! Symbol '>' oznacza, że chodzi koniecznie o dziecko. Czyli szuakamy elementu o klasie 'product' i 'active', który jest dzieckiem '#product-list'.
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
        input: 'input.amount',
        linkDecrease: 'a[href="#less"]',
        linkIncrease: 'a[href="#more"]',
      },
    },
    cart: {
      productList: '.cart__order-summary',
      toggleTrigger: '.cart__summary',
      totalNumber: `.cart__total-number`,
      totalPrice: '.cart__total-price strong, .cart__order-total .cart__order-price-sum strong',
      subtotalPrice: '.cart__order-subtotal .cart__order-price-sum strong',
      deliveryFee: '.cart__order-delivery .cart__order-price-sum strong',
      form: '.cart__order',
      formSubmit: '.cart__order [type="submit"]',
      phone: '[name="phone"]',
      address: '[name="address"]',
    },
    cartProduct: {
      amountWidget: '.widget-amount',
      price: '.cart__product-price',
      edit: '[href="#edit"]',
      remove: '[href="#remove"]',
    },
  };

  const classNames = {
    menuProduct: {
      wrapperActive: 'active',
      imageVisible: 'active',
    },
    cart: {
      wrapperActive: 'active',
    },
  };

  const settings = {
    amountWidget: {
      defaultValue: 1,
      defaultMin: 1,
      defaultMax: 10,
    },
    cart: {
      defaultDeliveryFee: 20,
    },
  };

  const templates = {
    menuProduct: Handlebars.compile(document.querySelector(select.templateOf.menuProduct).innerHTML),
    cartProduct: Handlebars.compile(document.querySelector(select.templateOf.cartProduct).innerHTML),
  };

  class Product { //! Przy tworzeniu każdej instancji uruchamia się funkcja konstruktora, która uruchamia dla danego obiektu metodę renderInMenu.

    constructor(id, data) {
      const thisProduct = this;

      thisProduct.id = id;
      thisProduct.data = data;

      thisProduct.renderInMenu();
      thisProduct.getElements();
      thisProduct.initAccordion(); //! Chcemy, żeby produkty od razu, od samego początku mogły być zwijane/rozwijane (dlatego wywołanie znajduje się już w konstrukotrze).
      thisProduct.initOrderForm();
      thisProduct.initAmountWidget();
      thisProduct.processOrder();
      console.log('new Product:', thisProduct);
    }

    renderInMenu() {
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

    //! Przygotowanie referencji do np. inputów
    getElements(){
      const thisProduct = this;

      thisProduct.accordionTrigger = thisProduct.element.querySelector(select.menuProduct.clickable);
      //c('thisProduct.accordionTrigger', thisProduct.accordionTrigger);

      thisProduct.form = thisProduct.element.querySelector(select.menuProduct.form);
      //c('thisProduct.form', thisProduct.form);

      thisProduct.formInputs = thisProduct.form.querySelectorAll(select.all.formInputs);
      //c('thisProduct.formInputs', thisProduct.formInputs);

      thisProduct.cartButton = thisProduct.element.querySelector(select.menuProduct.cartButton);
      //c('thisProduct.cartButton', thisProduct.cartButton);

      thisProduct.priceElem = thisProduct.element.querySelector(select.menuProduct.priceElem);
      //c('thisProduct.priceElem', thisProduct.priceElem);

      //! Poniżej referencja do pojedynczego elementu o selektorze zapisanym w select.menuProduct.imageWrapper, czyli: '.product__images'
      thisProduct.imageWrapper = thisProduct.element.querySelector(select.menuProduct.imageWrapper);
      //c('thisProduct.imageWrapper:', thisProduct.imageWrapper);

      //! Właściwość thisProduct.amountWidgetElem, kórej wartością jest referencja do elementu o selektorze select.menuProduct.amountWidget
      thisProduct.amountWidgetElem = thisProduct.element.querySelector(select.menuProduct.amountWidget); // '.widget-amount'
      c('thisProduct.amountWidgetElem:', thisProduct.amountWidgetElem);

    }

    initAccordion() { //! To jest deklaracja metody.
      const thisProduct = this;

      /* [DONE] find the clickable trigger (the element that should react to clicking) */

      //! thisProduct.element to DOM, czyli obiekt wygenerowany przez przeglądarkę na podstawie kodu HTML.
      //? DOM - Document Object Model

      const clickableTrigger = thisProduct.element.querySelector(select.menuProduct.clickable);
      //! metoda getElements uruchamia się już z odpowiednią referencją przed initAccordion -> thisProduct.accordionTrigger = thisProduct.element.querySelector(select.menuProduct.clickable);

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
          activeProduct.classList.remove(classNames.menuProduct.wrapperActive);
        }

        /* [DONE] toggle active class on thisProduct.element */

        //! Ważne: toggle - dodanie klasy jeśli jej nie było, i vice versa

        thisProduct.element.classList.toggle(classNames.menuProduct.wrapperActive);

        //c(thisProduct.element);

      });
    }

    initOrderForm() {
      const thisProduct = this;
      //c('initOrderForm:', thisProduct.initOrderForm);

      thisProduct.form.addEventListener('submit', function(event) {
        event.preventDefault();
        thisProduct.processOrder();
      });

      for(let input of thisProduct.formInputs){
        input.addEventListener('change', function(){
          thisProduct.processOrder();
        });
      }

      thisProduct.cartButton.addEventListener('click', function(event){
        event.preventDefault();
        thisProduct.processOrder();
        thisProduct.addToCart();
      });
    }

    processOrder() {
      const thisProduct = this;

      // covert form to object structure e.g. { sauce: ['tomato'], toppings: ['olives', 'redPeppers']}

      const formData = utils.serializeFormToObject(thisProduct.form);
      //c('formData', formData);

      // set price to default price
      //! Tworzymy zmienną, w której będziemy trzymać naszą cenę. Startowo otrzymuje ona domyślną cenę produktu.

      let price = thisProduct.data.price;

      // for every category (param)...

      for(let paramId in thisProduct.data.params) {
        //! pętla for..in w zmiennej iteracyjnej zwraca zawsze tylko nazwę właściwości. Czyli np. paramId dla np. toppings i sauce
        //! będzie tylko samą nazwą właściwości – toppings i sauce

        // determine param value, e.g. paramId = 'toppings', param = { label: 'Toppings', type: 'checkboxes'... }
        //! Ta dodatkowa linijka dba o to, aby dostać się do całego obiektu dostępnego pod tą właściwością.

        const param = thisProduct.data.params[paramId];
        //c(paramId, param);

        // for every option in this category
        //! `optionId` jest w tym przypadku zmienną iteracyjną i zwraca np. cucumber, tomatoes, olives, feta, gluten, cheese

        for(let optionId in param.options) {
          //c('optionId:', optionId);

          // determine option value, e.g. optionId = 'olives', option = { label: 'Olives', price: 2, default: true }
          //! stała `option` zwraca już konkretny obiekt w optionId, np. { label: 'Tomatoes', price: 1, default: true }

          const option = param.options[optionId];
          //c('option:', option);

          // find an image in type of category-option -> .paramId-optionId

          const optionImage = thisProduct.imageWrapper.querySelector('.' + paramId + '-' + optionId);
          //c('optionImage:', optionImage);

          // check if in formData exists a category name (param), and then (if yes) does it include a proper (checked/selected) option
          //! 'params' to sauce, toppings, crust; 'options' to tomato, olives, standard

          const optionSelected = formData[paramId] && formData[paramId].includes(optionId);
          if(optionSelected) {

            // check if the option is not default

            if(!option.default) {

              // add option price to price variable
              //! Cenę opcji dodajemy do już istniejącej zmiennej `price`
              price  = price + option.price;
            }

          } else {

            // check if the option is default

            if(option.default) {

              // reduce price variable

              price =  price - option.price;
            }
          }

          if(optionImage) {
            if(optionSelected) {

              optionImage.classList.add(classNames.menuProduct.imageVisible);

            } else {

              optionImage.classList.remove(classNames.menuProduct.imageVisible);
            }
          }
        }
      }

      /* multiply price by amount */

      //! Tuż przed wyświetleniem ceny obliczonej z uwzględnieniem opcji produktu, pomnożymy ją przez ilość sztuk wybraną w widgecie.
      price *= thisProduct.amountWidget.value;

      // update calculated price in the HTML

      thisProduct.priceElem.innerHTML = price;
    }

    //! Metoda initAmountWidget jest odpowiedzialna za utworzenie nowej instancji klasy AmountWidget i zapisywanie jej we właściwości produktu
    //! Od razu przekazujemy do konstruktora referencję do naszego diva z inputem i buttonami tak, jak oczekiwała na to klasa AmountWidget
    initAmountWidget() {
      const thisProduct = this;

      thisProduct.amountWidget = new AmountWidget(thisProduct.amountWidgetElem);

      //! Nasłuchiwanie customowego eventu = Nasłuchuje na element `thisProduct.amountWidgetElem` i na zdarzenie `updated`.
      //? Dlaczego nasłuchujemy właśnie na ten element? Bo to na nim emitowaliśmy nasz event (thisWidget.element to referencja do tego samego identycznego elementu co thisProduct.amountWidgetElem).
      thisProduct.amountWidgetElem.addEventListener('updated', function() {
        thisProduct.processOrder();
      });
    }

    addToCart() {
      const thisProduct = this;

      //! metoda
      app.cart.add(thisProduct);
    }

    prepareCartProduct() {
      const thisProduct = this;


      //! Obiekt, który posiada tylko niezbędne dla koszyka informacje.
      const productSummary = {

      };
      c('Summary', productSummary);
    }
  }

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

      /* TODO: Add validation */

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
      const event = new Event('updated');
      thisWidget.element.dispatchEvent(event);
    }
  }

  class Cart {
    constructor(element) {
      const thisCart = this;

      thisCart.products = [];

      thisCart.getElements(element);
      thisCart.initActions();

      //c('new Cart', thisCart);
    }

    //! Przygotowanie referencji do np. selectorów
    getElements(element) { // Argument element, który otrzymaliśmy w konstruktorze jest tylko referencją elementu DOM
      const thisCart = this;

      thisCart.dom = {};

      thisCart.dom.wrapper = element;

      //! To jest definicja właściwości w metodzie `getElements(element)`
      thisCart.dom.toggleTrigger = thisCart.dom.wrapper.querySelector(select.cart.toggleTrigger); // '.cart__summary'
    }

    initActions() {
      const thisCart = this;

      //! Dodajemy listener eventu 'click' na elemencie `thisCart.dom.toggleTrigger` // '.cart__summary'
      thisCart.dom.toggleTrigger.addEventListener('click', function() {
        c('clicked');

        //! Handler toggluje klasę zapisaną w (classNames.cart.wrapperActive) na elemencie `thisCart.dom.wrapper`
        thisCart.dom.wrapper.classList.toggle(classNames.cart.wrapperActive);
      });
    }

    add(menuProduct) {
      // const thisCart = this;

      c('adding product', menuProduct);

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

    initCart: function() { // inicjacja instancji koszyka // W aplikacji będzie tylko jeden koszyk, więc wykorzystujemy tę klasę tylko raz.
      const thisApp = this;

      const cartElem = document.querySelector(select.containerOf.cart); // Konstruktor klasy `Cart` oczekuje na przekazanie referencji do diva, w którym ten koszyk ma być obecny.

      //! Przekazujemy klasie `Cart` wrapper (czyli kontener, element okalający) koszyka.
      thisApp.cart = new Cart(cartElem);
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

      thisApp.initCart(); // To wywołanie uruchamia się jako czwarte.
    },
  };

  app.init(); // To wywołanie uruchamia się jako pierwsze.
}
