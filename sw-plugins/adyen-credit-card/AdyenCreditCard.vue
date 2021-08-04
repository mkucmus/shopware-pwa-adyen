<template>
  <div id="adyen-cards-container"></div>
</template>

<script>
import { onMounted } from '@vue/composition-api';
export default {
  name: "AdyenCreditCard",
  setup(props, { root: { context: { $adyen } } }) {
    onMounted(() => {
      // show the Card form component with custom configuration
      // inside adyen-cards-container div element
      $adyen && $adyen.mountCardContainer('#adyen-cards-container', {
        enableStoreDetails: false,
        hasHolderName: false,
        holderNameRequired: false,
        billingAddressRequired: false,
        showPayButton: false,
      });
    })
  },
};
</script>
