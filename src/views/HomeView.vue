<script setup lang="ts">
import { Chains, SwapStatus, type SwapHistory, type SwapStatusResponse } from '@odinxorg/types';
import { onMounted, ref } from 'vue';
import ClaimUserCard from '../components/ClaimUserCard.vue';
import CreateSwap from '../components/CreateSwap.vue';
import CreateUserHTLC from '../components/CreateUserHTLC.vue';
import HistorySwaps from '../components/HistorySwaps.vue';
import SwapStatusCard from '../components/SwapStatusCard.vue';
import { SdkService } from '../services/sdkService';
import { useWalletStore } from '../stores/walletStore';

const walletStore = useWalletStore();

const useSdkService = new SdkService(walletStore.getOdinTrade());

const allSwaps = ref<SwapHistory[]>([]);
const cardToShow = ref<'createSwap' | 'createUserHTLC' | 'claimUserCard' | null>();

const tabSelected = ref<'newSwap' | 'currentSwap' | 'historySwaps' | null>();
const newSwapTabIsActive = ref<boolean>(false);
const currentSwapTabIsActive = ref<boolean>(false);

const swapStatus = ref<SwapStatusResponse | null>();
const currentSwap = ref<SwapHistory | null>();
const showClaimUserModal = ref<boolean>(false);

const swapFrom = ref<Chains>(Chains.ETHEREUM);

const fetchSwapStatus = async () => {
  try {
    if (!walletStore.evmAddress || !walletStore.btcAddress) {
      return;
    }
    const addressIn =
      swapFrom.value === Chains.BITCOIN ? await walletStore.getBtcSigner().getAddress() : await walletStore.getEvmSigner().getAddress();
    if (!addressIn) return;
    const orderHistory = await useSdkService.getAllSwapsHistory(addressIn);
    if (orderHistory.length === 0) {
      newSwapTabIsActive.value = true;
      tabSelected.value = 'newSwap';
      return;
    }
    allSwaps.value = orderHistory;
    currentSwap.value = orderHistory[0]; // is the most recent swap
    if (
      !currentSwap.value ||
      currentSwap.value.status === SwapStatus.CREATED ||
      currentSwap.value.status === SwapStatus.BROKER_CLAIM_COMPLETED ||
      currentSwap.value.status === SwapStatus.FAILED ||
      currentSwap.value.status === SwapStatus.USER_CLAIM_PENDING ||
      currentSwap.value.status === SwapStatus.USER_CLAIM_COMPLETED
    ) {
      newSwapTabIsActive.value = true;
      if (currentSwap.value.status === SwapStatus.USER_CLAIM_COMPLETED || currentSwap.value.status === SwapStatus.FAILED) {
        currentSwapTabIsActive.value = false;
      } else {
        currentSwapTabIsActive.value = true;
        cardToShow.value = 'claimUserCard';
        swapStatus.value = currentSwap.value;
      }
      if (!tabSelected.value) {
        tabSelected.value = 'newSwap';
      }
      return;
    }
    if (
      currentSwap.value &&
      (currentSwap.value.status === SwapStatus.FIRST_BROKER_TRANSACTION_PENDING ||
        currentSwap.value.status === SwapStatus.FIRST_BROKER_TRANSACTION_COMPLETED)
    ) {
      swapStatus.value = currentSwap.value;
      newSwapTabIsActive.value = false;
      currentSwapTabIsActive.value = true;
      if (!tabSelected.value || tabSelected.value === 'newSwap') {
        tabSelected.value = 'currentSwap';
      }
      return (cardToShow.value = 'createUserHTLC');
    }
    if (
      currentSwap.value &&
      (currentSwap.value.status === SwapStatus.FIRST_USER_TRANSACTION_PENDING ||
        currentSwap.value.status === SwapStatus.FIRST_USER_TRANSACTION_COMPLETED)
    ) {
      swapStatus.value = currentSwap.value;
      newSwapTabIsActive.value = false;
      currentSwapTabIsActive.value = true;
      if (!tabSelected.value) {
        tabSelected.value = 'currentSwap';
      }
      return (cardToShow.value = 'claimUserCard');
    }
  } catch (error) {
    console.error('Error fetching swap status:', error);
  }
};

onMounted(async () => {
    await walletStore.connectWallets();
  
  await fetchSwapStatus();
  setInterval(async () => {
    await fetchSwapStatus();
  }, 5000);
});

const closeClaimUserModal = () => {
  showClaimUserModal.value = false;
  swapStatus.value = null;
};
</script>

<template>
  <div class="max-h-full p-8">
    <div class="mb-4">
      <p v-if="!walletStore.evmAddress || !walletStore.btcAddress" class="text-gray-300">
          <span class="text-red-500">⚠️</span> Wallets not connected 
          <button class="btn btn-primary ml-3" @click="walletStore.connectWallets()">Connect Wallets</button>
      </p>
      <p class="text-green-500" v-if="walletStore.connected">
        ✅ Wallets connected: <br />
        
        <span >
          Bitcoin: {{ walletStore.btcAddress }} <br />
          Ethereum: {{ walletStore.evmAddress }}
        </span>
        <button class="btn btn-primary ml-3" @click="walletStore.resetWallets()">Disconnect Wallets</button>
      </p>

    </div>

    <div class="flex justify-center items-center gap-4 mb-8">
      <span class="text-white">Swap from:</span>
      <label class="swap swap-rotate">
        <input
          type="checkbox"
          :checked="swapFrom === Chains.ETHEREUM"
          @change="
            swapFrom = swapFrom === Chains.BITCOIN ? ((tabSelected = null), Chains.ETHEREUM) : ((tabSelected = null), Chains.BITCOIN)
          "
        />
        <div class="swap-on text-orange-400">Ethereum</div>
        <div class="swap-off text-cyan-400">Bitcoin</div>
      </label>
    </div>

    <div class="flex justify-center mb-10">
      <div role="tablist" class="tabs tabs-bordered">
        <a
          v-if="newSwapTabIsActive"
          role="tab"
          @click="tabSelected = 'newSwap'"
          class="tab"
          :class="{ 'tab-active': tabSelected === 'newSwap' }"
          >New Swap</a
        >
        <a
          v-if="currentSwapTabIsActive"
          role="tab"
          @click="tabSelected = 'currentSwap'"
          class="tab"
          :class="{ 'tab-active': tabSelected === 'currentSwap' }"
          >Current Swap</a
        >
        <a role="tab" @click="tabSelected = 'historySwaps'" class="tab" :class="{ 'tab-active': tabSelected === 'historySwaps' }"
          >History Swaps</a
        >
      </div>
    </div>
    <div v-if="tabSelected === 'newSwap'">
      <CreateSwap :chainIn="swapFrom" />
    </div>
    <div v-if="tabSelected === 'currentSwap'">
      <CreateUserHTLC v-if="cardToShow === 'createUserHTLC' && currentSwap" :swapStatus="currentSwap" />
      <ClaimUserCard v-if="cardToShow === 'claimUserCard' && currentSwap" :swapStatus="currentSwap" />
    </div>
    <div v-if="tabSelected === 'historySwaps'">
      <HistorySwaps :allSwaps="allSwaps" />
    </div>
  </div>
  <dialog id="claim_modal" class="modal" :class="{ 'modal-open': showClaimUserModal }">
    <div class="modal-box max-w-2xl bg-gray-800 border border-gray-700">
      <div class="flex flex-col items-center gap-4">
        <div class="flex items-center gap-2">
          <svg class="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 class="text-2xl font-bold text-white">Claim Transaction Sent!</h3>
        </div>
        <p class="text-gray-300 text-center">Your claim transaction has been submitted to the network and is being processed.</p>
        <div class="w-full mt-4">
          <SwapStatusCard v-if="currentSwap" :swapStatus="currentSwap" :chainIn="swapFrom" />
        </div>

        <div class="modal-action w-full flex justify-end mt-6">
          <button class="btn btn-primary" @click="closeClaimUserModal">Close</button>
        </div>
      </div>
    </div>
  </dialog>
</template>
../services/sdkService
