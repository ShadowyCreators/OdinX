<script setup lang="ts">
import { Chains, type CreateSwapResponse, type GetTokenSwapDetailsRequest, type GetTokenSwapDetailsResponse } from '@odinxorg/types';
import { computed, onMounted, ref } from 'vue';
import { SdkService } from '../services/sdkService';
import { useWalletStore } from '../stores/walletStore';
import { formatBitcoinBalance } from '../utils/formatBalances';

const walletStore = useWalletStore();
const useSdkService = new SdkService(walletStore.getOdinTrade());
const errorMessage = ref('');

const props = defineProps<{
  chainIn: Chains;
}>();

const chainsList = [Chains.ETHEREUM, Chains.BITCOIN];

const maxAmountInIsLoading = ref(false);

const swapUserInput = ref<GetTokenSwapDetailsRequest>({
  amountIn: 0,
  tokenInSymbol: props.chainIn === Chains.ETHEREUM ? 'ETH' : 'BTC',
  tokenOutSymbol: props.chainIn === Chains.ETHEREUM ? 'BTC' : 'ETH',
  chainIn: props.chainIn,
  chainOut: props.chainIn === Chains.ETHEREUM ? Chains.BITCOIN : Chains.ETHEREUM,
  addressIn: walletStore.evmAddress,
  addressOut: walletStore.btcAddress,
});

const createSwapResponse = ref<CreateSwapResponse>();
const swapIdAlreadyCreated = ref('');
const swapDetails = ref<GetTokenSwapDetailsResponse>();
const maxAmountIn = ref(0);
const isLoading = ref(false);
const isCreationRequestCompleted = ref(false);

// Full list of tokens
const allTokens = {
  [Chains.BITCOIN]: ['BTC'],
  [Chains.ETHEREUM]: ['ETH'],
};

onMounted(async () => {
  swapUserInput.value.chainIn = props.chainIn;
  swapUserInput.value.chainOut = swapUserInput.value.chainIn === Chains.BITCOIN ? Chains.ETHEREUM : Chains.BITCOIN;
  swapUserInput.value.addressIn = swapUserInput.value.chainIn === Chains.BITCOIN ? walletStore.btcAddress : walletStore.evmAddress;
  swapUserInput.value.addressOut = swapUserInput.value.chainOut === Chains.BITCOIN ? walletStore.btcAddress : walletStore.evmAddress;
  swapUserInput.value.amountIn = 0;

  await getMaxAmountIn();
});

// Dynamic token lists
const tokenInOptions = computed(() => allTokens[swapUserInput.value.chainIn] || []);
const tokenOutOptions = computed(() => allTokens[swapUserInput.value.chainOut] || []);

const onChainInChange = async () => {
  swapUserInput.value.chainOut = swapUserInput.value.chainIn === Chains.BITCOIN ? Chains.ETHEREUM : Chains.BITCOIN;
  swapUserInput.value.addressIn = swapUserInput.value.chainIn === Chains.BITCOIN ? walletStore.btcAddress : walletStore.evmAddress;
  swapUserInput.value.addressOut = swapUserInput.value.chainOut === Chains.BITCOIN ? walletStore.btcAddress : walletStore.evmAddress;
  swapUserInput.value.tokenInSymbol = tokenInOptions.value[0];
  swapUserInput.value.tokenOutSymbol = tokenOutOptions.value[0];
  swapUserInput.value.amountIn = 0;
  swapDetails.value = undefined;

  await getMaxAmountIn();
};

const onChainOutChange = async () => {
  swapUserInput.value.chainIn = swapUserInput.value.chainOut === Chains.BITCOIN ? Chains.ETHEREUM : Chains.BITCOIN;
  swapUserInput.value.addressOut = swapUserInput.value.chainOut === Chains.BITCOIN ? walletStore.btcAddress : walletStore.evmAddress;
  swapUserInput.value.addressIn = swapUserInput.value.chainIn === Chains.BITCOIN ? walletStore.btcAddress : walletStore.evmAddress;
  swapUserInput.value.tokenOutSymbol = tokenOutOptions.value[0];
  swapUserInput.value.tokenInSymbol = tokenInOptions.value[0];
  swapUserInput.value.amountIn = 0;
  swapDetails.value = undefined;
  await getMaxAmountIn();
};

// Get swap details
const getSwapDetails = async () => {
  if (!swapUserInput.value.amountIn) return;
  console.log('swapUserInput', swapUserInput.value);
  const details = await useSdkService.getTokenSwapDetails(swapUserInput.value);
  swapDetails.value = details;
};

const getMaxAmountIn = async () => {
  maxAmountInIsLoading.value = true;
  const response = await useSdkService.getMaxAmountOut(swapUserInput.value);
  maxAmountIn.value = response.maxAmountIn;
  maxAmountInIsLoading.value = false;
};

// Button states
const isCreateSwapButtonDisabled = computed(() => {
  return (
    !swapUserInput.value.amountIn ||
    swapUserInput.value.amountIn > maxAmountIn.value ||
    !swapDetails.value ||
    isLoading.value ||
    isCreationRequestCompleted.value
  );
});

const isConfirmSwapButtonDisabled = computed(() => isLoading.value);

// Create swap
const createSwap = async () => {
  try {
    if (!swapDetails.value) return;
    if (swapUserInput.value.amountIn > maxAmountIn.value) return;

    isLoading.value = true;

    const requestToCreateSwap = {
      amountOut: swapDetails.value.amountOut,
      tokenInSymbol: swapUserInput.value.tokenInSymbol,
      tokenOutSymbol: swapUserInput.value.tokenOutSymbol,
      chainIn: swapUserInput.value.chainIn,
      chainOut: swapUserInput.value.chainOut,
    };
    createSwapResponse.value = await useSdkService.createSwap(requestToCreateSwap);
    console.log('createSwapResponse', createSwapResponse.value);
    swapIdAlreadyCreated.value = createSwapResponse.value?.swapId || '';
    isCreationRequestCompleted.value = true;
  } catch (error) {
    console.error('Error creating swap', error);
    errorMessage.value = 'Error creating swap:' + error;
  } finally {
    isLoading.value = false;
  }
};

// Confirm swap
const confirmSwap = async () => {
  if (!createSwapResponse.value || !swapIdAlreadyCreated.value) return;

  try {
    isLoading.value = true;
    await useSdkService.confirmSwap(swapIdAlreadyCreated.value, createSwapResponse.value.userClaimToSign || '');
  } catch (error) {
    console.error('Error confirming swap', error);
    errorMessage.value = 'Error confirming swap:' + error;
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <div v-if="errorMessage" class="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
    <div class="bg-gray-800 p-6 rounded-xl shadow-xl max-w-sm w-full text-white">
      <h3 class="text-lg font-semibold mb-4">Something went wrong</h3>
      <p class="text-sm text-gray-300 mb-6">{{ errorMessage }}</p>
      <button class="btn bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg w-full" @click="errorMessage = ''">Close</button>
    </div>
  </div>
  <div class="text-white flex justify-center items-center py-10">
    <div class="flex flex-col lg:flex-row bg-gray-800 shadow-xl rounded-lg overflow-hidden max-w-6xl w-full">
      <!-- Swap Details Section -->
      <div class="bg-gray-700 lg:w-1/3 p-6">
        <h2 class="text-2xl font-bold mb-6 border-b border-gray-600 pb-3">Estimated Swap Details</h2>
        <div class="space-y-4 text-gray-300">
          <p>
            <span class="font-semibold text-white">Amount Out:</span>
            {{ swapDetails?.amountOut ? swapDetails?.amountOut.toFixed(8) + ' ' + swapUserInput.tokenOutSymbol : 'N/A' }}
          </p>
          <p>
            <span class="font-semibold text-white">Rate:</span>
            {{ swapDetails?.rate ? swapDetails?.rate : 'N/A' }}
          </p>
        </div>
      </div>

      <!-- Swap Request Section -->
      <div class="flex-1 p-8">
        <h2 class="text-2xl font-bold mb-6">Swap Request</h2>
        <div class="space-y-6">
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <label class="block">
                <span class="block text-sm ml-3 font-medium mb-2">Chain In</span>
                <select class="select select-bordered" v-model="swapUserInput.chainIn" @change="onChainInChange">
                  <option v-for="chain in chainsList" :value="chain">{{ chain }}</option>
                </select>
              </label>
            </div>
            <div>
              <label class="block">
                <span class="block text-sm ml-3 font-medium mb-2">Token In</span>
                <select class="select select-bordered" v-model="swapUserInput.tokenInSymbol">
                  <option v-for="token in tokenInOptions" :value="token">{{ token }}</option>
                </select>
              </label>
            </div>
            <div>
              <label class="block">
                <span class="block text-sm ml-3 font-medium mb-2">Chain Out</span>
                <select class="select select-bordered" v-model="swapUserInput.chainOut" @change="onChainOutChange">
                  <option v-for="chain in chainsList" :value="chain">{{ chain }}</option>
                </select>
              </label>
            </div>
            <div>
              <label class="block">
                <span class="block text-sm ml-3 font-medium mb-2">Token Out</span>
                <select class="select select-bordered" v-model="swapUserInput.tokenOutSymbol">
                  <option v-for="token in tokenOutOptions" :value="token">{{ token }}</option>
                </select>
              </label>
            </div>
            <div>
              <label class="block">
                <span class="block text-sm ml-3 font-medium mb-2">Address In</span>
                <input
                  type="text"
                  disabled
                  v-model="swapUserInput.addressIn"
                  @input="getMaxAmountIn()"
                  class="input w-full bg-gray-900 border border-gray-600 text-gray-400 rounded-lg p-3"
                />
              </label>
            </div>
            <div>
              <label class="block">
                <span class="block text-sm ml-3 font-medium mb-2">Address Out</span>
                <input
                  type="text"
                  disabled
                  v-model="swapUserInput.addressOut"
                  class="input w-full bg-gray-900 border border-gray-600 text-gray-400 rounded-lg p-3"
                />
              </label>
            </div>

            <div>
              <label class="block">
                <span class="block text-sm ml-3 font-medium mb-2"
                  >Max Amount In:
                  <span v-if="!maxAmountInIsLoading"> {{ formatBitcoinBalance(maxAmountIn) }} {{ swapUserInput.tokenInSymbol }}</span></span
                >
                <input
                  type="number"
                  :placeholder="!swapUserInput.amountIn ? 'Amount In' : ''"
                  v-model="swapUserInput.amountIn"
                  @input="getSwapDetails()"
                  class="input w-full bg-gray-900 border border-gray-600 text-gray-400 rounded-lg p-3"
                />
              </label>
            </div>
          </div>
        </div>

        <div class="mt-8 text-center" v-if="!swapIdAlreadyCreated">
          <p class="text-sm text-gray-400 mb-4 text-justify">
            By clicking on Create, you will sign a message to demonstrate that you are the owner of the address in.
          </p>
          <button
            class="btn bg-black btn-wide border-spacing-1 cursor-pointer border-2 border-white hover:bg-gray-700 text-white font-semibold px-6 py-3 rounded-lg transition"
            :disabled="isCreateSwapButtonDisabled"
            @click="createSwap"
          >
            <a v-if="!isLoading">Create</a>
            <a v-else class="loading loading-spinner"></a>
          </button>
        </div>

        <div class="mt-8 text-center" v-if="swapIdAlreadyCreated">
          <p class="text-sm text-gray-400 mb-4 text-justify">By clicking on Confirm, you will sign the claim of the swap.</p>
          <button
            class="btn bg-black btn-wide border-spacing-1 border-2 border-white hover:bg-gray-700 text-white font-semibold px-6 py-3 rounded-lg transition"
            :disabled="isConfirmSwapButtonDisabled"
            @click="confirmSwap"
          >
            <a v-if="!isLoading">Confirm</a>
            <a v-else class="loading loading-spinner"></a>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
../services/sdkService
