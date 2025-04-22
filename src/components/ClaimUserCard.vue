<script setup lang="ts">
import { type SwapHistory, SwapStatus } from '@odinxorg/types';
import SwapStatusCard from './SwapStatusCard.vue';

defineProps<{
  swapStatus: SwapHistory;
}>();
</script>
<template>
  <div class="text-white flex justify-center items-center py-10">
    <div class="flex flex-col lg:flex-row bg-gray-800 shadow-xl rounded-lg overflow-hidden max-w-6xl w-full">
      <!-- Swap Details Section -->
      <SwapStatusCard v-if="swapStatus" :swapStatus="swapStatus" />

      <div class="flex-1 p-8 space-y-6">
        <h2 class="text-2xl font-bold text-gray-100">User Claim</h2>

        <div class="bg-gray-700/50 rounded-lg p-6 space-y-4">
          <p class="text-gray-300 leading-relaxed">
            The claim of your funds will be managed by the broker. You will receive a notification when the claim is completed.
          </p>

          <div class="mt-4 border-t border-gray-600 pt-4">
            <div v-if="swapStatus" class="space-y-3">
              <p v-if="swapStatus.status === SwapStatus.FIRST_USER_TRANSACTION_PENDING" class="flex items-center text-blue-300">
                <span class="mr-2">⏳</span>
                Waiting for three on-chain confirmations for user HTLC
              </p>

              <p v-if="swapStatus.status === SwapStatus.FIRST_USER_TRANSACTION_COMPLETED" class="flex items-center text-yellow-300">
                <span class="mr-2">⌛</span>
                Waiting for Broker to claim HTLC
              </p>

              <p v-if="swapStatus.status === SwapStatus.BROKER_CLAIM_PENDING" class="flex items-center text-green-300">
                <span class="mr-2">🔄</span>
                The broker is processing your transaction to unlock the funds on the Bitcoin network. You will receive your BTC shortly.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
