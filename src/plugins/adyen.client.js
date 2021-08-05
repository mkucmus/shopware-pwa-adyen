import { getContextEndpoint } from "@shopware-pwa/shopware-6-client";
import { getApplicationContext, useCart, useSessionContext } from "@shopware-pwa/composables";
import { onMounted } from "@vue/composition-api";
// sdk for Adyen web components
import AdyenCheckout from '@adyen/adyen-web';
// styling
import '@adyen/adyen-web/dist/adyen.css';

export default function({ app, $config }, inject) {

  const { apiInstance } = getApplicationContext(app);
  // get the total price for current cart
  const { totalPrice } = useCart(app)
  // get chosen payment method and currency from the session context
  const { paymentMethod, currency } = useSessionContext(app);

  // initialize an instance of adyen checkout
  const initAdyenCheckout = () => {
    // get custom configuration that may be merged with default one
    // from publicRuntimeConfig in nuxt.config.js
    const customConfiguration = $config.adyen || {};
    // set the initial configuration
    const configuration = {
        locale: app.$routing?.getCurrentDomain?.value?.locale?.replace('-', '_'),
        amount: {
          value: totalPrice.value,
          currency: currency.value?.isoCode || "EUR"
        },
        onSubmit: (state, credit) => {
        },
        onChange: async (state, credit) => {
          // check if provided data pass the validation rules
          // within credit card form
          if(state.isValid) {
            // if so, send an update context request to the Shopware 6 /context endpoint
            // to invoke appriopriate event that can be captured by Adyen plugin
            try {
              await updatePaymentData(state.data)
            } catch (error) {
              console.error('adyen:onChange:updatePaymentData', error);
            }
          }
        },
        onAdditionalDetails: (state, credit) => { 
          // will be used for 3DS authentication
        }
    }

    // create an instance of Adyen Checkout with given configuration
    const checkout = new AdyenCheckout(Object.assign({}, configuration, customConfiguration));
    
    // method that sends adyenData coming from the web component
    // and current cart setup to the /store-api/context endpoint
    const updatePaymentData = async (adyenData) => {
      await apiInstance.invoke.patch(getContextEndpoint(), {
        paymentMethodId: paymentMethod.value?.id, // id of payment method
        adyenStateData: JSON.stringify(adyenData, null, 2), // card specific data (token included)
        adyenOrigin: $config.adyen.adyenOrigin || "http://localhost:8000"
      })
    }

    // create and mount a web component with credit card form
    // by given element's id like <div id="my-component"></div>
    const mountCardContainer = (elementId, settings = {}) => {
      checkout
        .create("card", Object.assign({}, settings))
        .mount(elementId)
    }

    const adyen = {
      checkout,
      mountCardContainer,
    }

    // register a plugin in nuxt's context under $adyen alias
    // thanks to this it can be used anywhere in the application
    // let's say as an express checkout button on product listing page
    inject('adyen', adyen);   
  }

  const { setup } = app;
  app.setup = function (...args) {
    let result = {};
    if (setup instanceof Function) {
      result = setup(...args) || {};
    }
    
    // init an Adyen checkout web component
    // when components are ready
    onMounted(() => initAdyenCheckout());
  }
}