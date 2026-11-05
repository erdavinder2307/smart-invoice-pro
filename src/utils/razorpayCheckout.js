const CHECKOUT_SRC = 'https://checkout.razorpay.com/v1/checkout.js';

let loading = null;

// Loads Razorpay Checkout once, on first use, so public pages never pull the script.
export const loadRazorpay = () => {
  if (window.Razorpay) return Promise.resolve(window.Razorpay);
  if (!loading) {
    loading = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = CHECKOUT_SRC;
      script.async = true;
      script.onload = () => (window.Razorpay ? resolve(window.Razorpay) : reject(new Error('Razorpay unavailable')));
      script.onerror = () => {
        loading = null;
        script.remove();
        reject(new Error('Could not load Razorpay Checkout'));
      };
      document.body.appendChild(script);
    });
  }
  return loading;
};

// Opens Checkout for a subscription. Resolves true when the customer finished paying, false when they closed it.
export const openSubscriptionCheckout = async ({ keyId, subscriptionId, description, prefill }) => {
  const Razorpay = await loadRazorpay();
  return new Promise((resolve) => {
    const checkout = new Razorpay({
      key: keyId,
      subscription_id: subscriptionId,
      name: 'Solidev Books',
      description,
      prefill,
      handler: () => resolve(true),
      modal: { ondismiss: () => resolve(false) },
    });
    checkout.open();
  });
};
