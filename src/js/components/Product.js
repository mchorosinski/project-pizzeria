import {select, classNames, templates} from '../settings.js';
import utils from '../utils.js';
import AmountWidget from './AmountWidget.js';

class Product { //! Przy tworzeniu każdej instancji uruchamia się funkcja konstruktora, która uruchamia dla danego obiektu metodę renderInMenu.

  constructor(id, data) {
    const thisProduct = this;

    thisProduct.id = id; // `id` to w data.js: `cake`, `breakfast`, `pizza`, `salad`
    thisProduct.data = data; // tutaj zawarte są wszystkie dane np. z "pizza" w data.js -> `name`, `price`, `descrtiption`, `images`

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
    //c('thisProduct.amountWidgetElem:', thisProduct.amountWidgetElem);

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

      //c('clicked');

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

    // zapis poniżej jest ważny ze względu na `productSummary`
    thisProduct.priceSingle = price; // każdorazowe uruchomienie processOrder będzie równało się także z aktualizacją `thisProduct.priceSingle`, czyli ceny jednostkowej potrzebnej później w `prepareCartProduct`

    /* multiply price by amount */

    //! Tuż przed wyświetleniem ceny obliczonej z uwzględnieniem opcji produktu, pomnożymy ją przez ilość sztuk wybraną w widgecie.
    price *= thisProduct.amountWidget.value;

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

    //! przekazywanie tego, co zwróci metoda `prepareCartProduct`, czyli wybranych opcji z thisProduct
    //app.cart.add(thisProduct.prepareCartProduct()); //! Zapamiętać: przekazywana metoda musi mieć końcowe nawiasy...

    //! Użycie customowego eventu

    const event = new CustomEvent('add-to-cart', { //obiekt zawierający ustawienia tego eventu
      bubbles: true,
      detail: {
        product: thisProduct,
      },
    });

    //! wywołanie evantu nazywa się "dispatchowanie"

    thisProduct.element.dispatchEvent(event);
  }

  prepareCartProduct() {
    const thisProduct = this;

    //! Obiekt, który posiada tylko niezbędne dla koszyka informacje.
    const productSummary = { // właściwości w obiekcie to: `id`, `name`, `amount`
      id: thisProduct.id,
      name: thisProduct.data.name,
      amount: thisProduct.amountWidget.value,
      priceSingle: thisProduct.priceSingle,
      price: thisProduct.priceSingle * thisProduct.amountWidget.value, // czyli "total price"
      params: thisProduct.prepareCartProductParams(),
    };
    return(productSummary); //w ten sposób funkcja będzie zwracała cały obiekt podsumowania
  }

  prepareCartProductParams() {
    const thisProduct = this;

    // covert form to object structure e.g. { sauce: ['tomato'], toppings: ['olives', 'redPeppers']}

    const formData = utils.serializeFormToObject(thisProduct.form);
    //c('formData', formData);

    // add an empty object `params` which contains all the categories

    const params = {};

    // for every category (param)...

    for(let paramId in thisProduct.data.params) {
      //! pętla for..in w zmiennej iteracyjnej zwraca zawsze tylko nazwę właściwości. Czyli np. paramId dla np. toppings i sauce
      //! będzie tylko samą nazwą właściwości – toppings i sauce

      // determine param value, e.g. paramId = 'toppings', param = { label: 'Toppings', type: 'checkboxes'... }
      //! Ta dodatkowa linijka dba o to, aby dostać się do całego obiektu dostępnego pod tą właściwością.
      //! `paramId` to po prostu nazwa kategorii, np. "toppings", zaś `optionId` to nazwa opcji, np. "olives".

      const param = thisProduct.data.params[paramId];
      //c(paramId, param);

      // create category param in `params` const eg. params = { ingredients: { name: 'Ingredients', options: {}}}

      params[paramId] = { //! `params` to z kolei obiekt z dokładniejszymi danymi z danego paramu (czyli `paramId`).
        label: param.label, // Stąd np. `param.label` to np. "Sauce", "Toppuings", "pizza crust"...
        options: {} // Z kolei `option.label` to byłyby np. "Olives"...
      };

      // for every option in this category
      //! `optionId` jest w tym przypadku zmienną iteracyjną i zwraca np. cucumber, tomatoes, olives, feta, gluten, cheese

      for(let optionId in param.options) {
        //c('optionId:', optionId);

        // determine option value, e.g. optionId = 'olives', option = { label: 'Olives', price: 2, default: true }
        //! stała `option` zwraca już konkretny obiekt w optionId, np. { label: 'Tomatoes', price: 1, default: true }

        const option = param.options[optionId];
        //c('option:', option);

        // check if `option` was selected and in case it was, add to `params[paramId].options` previously selected option
        //! 'params' to sauce, toppings, crust; 'options' to tomato, olives, standard

        const optionSelected = formData[paramId] && formData[paramId].includes(optionId);
        if(optionSelected) {

          params[paramId].options[optionId] = option.label;
          //! W powyższej sytuacji może np. następować próba edycji: `params.toppings.options.olives` = "Olives"
          // option selected!
        }
        //c('optionSelected:', optionSelected);
      }
    }

    return(params);
  }

}

export default Product; // eksportowanie domyślne