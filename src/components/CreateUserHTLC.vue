<script setup lang="ts">
import { type CreateUserHtlcResponse, type SwapHistory, SwapStatus } from '@odinxorg/types';
import { ref } from 'vue';
import { SdkService } from '../services/sdkService';
import { useWalletStore } from '../stores/walletStore';
import SwapStatusCard from './SwapStatusCard.vue';

const walletStore = useWalletStore();
console.log('CreateUserHTLC walletStore', walletStore.getOdinTrade());
const useSdkService = new SdkService(walletStore.getOdinTrade());

const props = defineProps<{
  swapStatus: SwapHistory | null;
}>();

const isLoading = ref(false);
const isCreateUserHtlcCompleted = ref(false);
const createUserHtlcResponse = ref<CreateUserHtlcResponse | null>(null);
const isConfirmUserHtlcCompleted = ref(false);
const createUserHTLC = async () => {
  try {
    if (!props.swapStatus || !props.swapStatus.id) {
      return;
    }
    isLoading.value = true;
    createUserHtlcResponse.value = await useSdkService.createUserHtlc(props.swapStatus.id);
    console.log('createUserHtlcResponse', createUserHtlcResponse.value);
    isCreateUserHtlcCompleted.value = true;
  } catch (error) {
    console.error('Error creating user HTLC', error);
  } finally {
    isLoading.value = false;
  }
};

const confirmUserHtlc = async () => {
  try {
    if (!props.swapStatus || !props.swapStatus.id || !createUserHtlcResponse.value?.userHtlcToSign) {
      return;
    }
    isLoading.value = true;
    const response = await useSdkService.confirmUserHtlc(props.swapStatus.id, createUserHtlcResponse.value?.userHtlcToSign);
    console.log('response', response);
    isConfirmUserHtlcCompleted.value = true;
  } catch (error) {
    console.error('Error confirming user HTLC', error);
  } finally {
    isLoading.value = false;
  }
};
</script>
<template>
  <div class="text-white flex justify-center items-center py-10">
    <div class="flex flex-col lg:flex-row bg-gray-800 shadow-xl rounded-lg overflow-hidden max-w-6xl w-full">
      <!-- Swap Details Section -->
      <SwapStatusCard v-if="swapStatus" :swapStatus="swapStatus" />

      <!-- Swap Request Section -->
      <div class="flex-1 p-8">
        <h2 class="text-2xl font-bold mb-6">Create User HTLC</h2>
        <p v-if="swapStatus && swapStatus.status === SwapStatus.FIRST_BROKER_TRANSACTION_PENDING" class="ml-3">
          Waiting for three on-chain confirmations
        </p>
        <div class="mt-8 text-center">
          <button
            v-if="swapStatus && !isCreateUserHtlcCompleted"
            class="btn bg-black btn-wide border-spacing-1 border-2 border-white hover:bg-gray-700 text-white font-semibold px-6 py-3 rounded-lg transition"
            :disabled="swapStatus.status !== SwapStatus.FIRST_BROKER_TRANSACTION_COMPLETED || isLoading || isCreateUserHtlcCompleted"
            @click="createUserHTLC"
          >
            <a v-if="!isLoading">Create</a>
            <a v-else class="loading loading-spinner"></a>
          </button>
          <button
            v-if="
              swapStatus &&
              isCreateUserHtlcCompleted &&
              swapStatus.status === SwapStatus.FIRST_BROKER_TRANSACTION_COMPLETED &&
              createUserHtlcResponse
            "
            class="btn bg-black btn-wide border-spacing-1 border-2 border-white hover:bg-gray-700 text-white font-semibold px-6 py-3 rounded-lg transition"
            :disabled="isLoading || isConfirmUserHtlcCompleted"
            @click="confirmUserHtlc"
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
