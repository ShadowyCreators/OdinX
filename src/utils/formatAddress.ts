import { ref } from 'vue';

export const useAddress = (address: string) => {
  return address.substring(0, 7) + '...' + address.substring(address.length - 6);
  // const addressWithDots = computed(() => {
  //   if (address) {
  //     return address.substring(0, 7) + '...' + address.substring(address.length - 6);
  //   }
  // });

  // return {
  //   addressWithDots,
  // };
};

export const clipboardText = ref('Copy address to clipboard');

export const onClipboardCopy = (address: string) => {
  clipboardText.value = 'Copied';
  setTimeout(() => {
    clipboardText.value = 'Copy address to clipboard';
  }, 5000);
  // Copy the text inside the text field
  navigator.clipboard.writeText(address);
};
