<script setup lang="ts">
import { ClipboardIcon } from '@heroicons/vue/24/outline';
import { Chains, type SwapHistory } from '@odinxorg/types';
import { ref } from 'vue';
import { clipboardText, onClipboardCopy, useAddress } from '../utils/formatAddress';
import { validatedENV } from '../validatedEnv';
const selectedSwap = ref<SwapHistory | null>(null);

defineProps<{
  allSwaps: SwapHistory[];
}>();

const redirectToExplorer = (txHash: string, chain: Chains) => {
  if (chain === Chains.BITCOIN) {
    window.open(`${validatedENV.VITE_BITCOIN_EXPLORER_URL}/tx/${txHash}`, '_blank');
  } else if (chain === Chains.ETHEREUM) {
    window.open(`${validatedENV.VITE_ETHEREUM_EXPLORER_URL}/tx/${txHash}`, '_blank');
  }
};

const selectSwap = (swap: SwapHistory) => {
  selectedSwap.value = swap;
};
</script>

<template>
  <div class="text-white flex justify-center items-center py-10">
    <div class="max-h-full flex flex-col lg:flex-row bg-gray-800 shadow-xl rounded-lg overflow-hidden max-w-6xl w-full">
      <!-- Left side - Scrollable list -->
      <div class="bg-gray-700 lg:w-1/2 p-6 overflow-y-auto border-r border-gray-600">
        <h2 class="text-2xl font-bold mb-6 border-b border-gray-600 pb-3">Swaps List</h2>
        <div class="text-gray-300">
          <div
            v-for="swap in allSwaps"
            :key="swap.id"
            class="p-4 border-b border-gray-600 cursor-pointer hover:bg-gray-600 transition-colors"
            @click="selectSwap(swap)"
            :class="{ 'bg-gray-600': selectedSwap?.id === swap.id }"
          >
            <div class="flex justify-between mb-2">
              <span class="text-sm text-gray-400">{{ new Date(swap.createdAt).toLocaleString() }}</span>
              <span class="text-sm px-2 py-1 rounded" :class="swap.status.toLowerCase()">{{ swap.status }}</span>
            </div>
            <div class="text-sm">{{ swap.amountIn }} {{ swap.tokenInSymbol }} → {{ swap.amountOut }} {{ swap.tokenOutSymbol }}</div>
          </div>
        </div>
      </div>

      <!-- Right side - Swap details -->
      <div class="flex-2 p-6 space-y-8" v-if="selectedSwap">
        <h2 class="text-xl font-semibold text-gray-200">Swap Details</h2>

        <div class="space-y-3">
          <h3 class="text-lg text-gray-400">Amount</h3>
          <div class="space-y-2 text-gray-300">
            <div>Input: {{ selectedSwap.amountIn }} {{ selectedSwap.tokenInSymbol }}</div>
            <div>Output: {{ selectedSwap.amountOut }} {{ selectedSwap.tokenOutSymbol }}</div>
            <div>Rate: {{ selectedSwap.rate.toFixed(8) }}</div>
          </div>
        </div>

        <div class="space-y-3">
          <h3 class="text-lg text-gray-400">Addresses</h3>
          <div class="space-y-2 text-gray-300 break-all">
            <div>From: {{ selectedSwap.addressIn }}</div>
            <div>To: {{ selectedSwap.addressOut }}</div>
          </div>
        </div>

        <div class="space-y-3">
          <h3 class="text-lg text-gray-400">Transactions</h3>
          <div class="space-y-2 text-gray-300">
            <div v-if="selectedSwap.htlc1TransactionHash" class="flex">
              <span class="w-36">HTLC 1 (Broker):</span>
              <span
                class="link hover:text-cyan-400 flex items-center gap-2"
                @click="redirectToExplorer(selectedSwap.htlc1TransactionHash, selectedSwap.chainOut as Chains)"
              >
                {{ useAddress(selectedSwap.htlc1TransactionHash) }}
              </span>
              <div v-if="selectedSwap.htlc1TransactionHash" aria-role="tooltip" class="tooltip text-xs" :data-tip="clipboardText">
                <button
                  aria-label="Copy TxHash to clipboard"
                  :aria-describedby="`tooltip-${selectedSwap.htlc1TransactionHash}`"
                  class="bg-transparent px-1.5"
                  @click="onClipboardCopy(selectedSwap.htlc1TransactionHash)"
                >
                  <ClipboardIcon class="w-5 h-5 text-end text-cyan-500" />
                </button>
              </div>
            </div>
            <div v-if="selectedSwap.htlc2TransactionHash" class="flex">
              <span class="w-36">HTLC 2 (User):</span>
              <span
                class="link hover:text-cyan-400 flex items-center gap-2"
                @click="redirectToExplorer(selectedSwap.htlc2TransactionHash, selectedSwap.chainIn as Chains)"
              >
                {{ useAddress(selectedSwap.htlc2TransactionHash) }}
              </span>
              <div v-if="selectedSwap.htlc2TransactionHash" aria-role="tooltip" class="tooltip text-xs" :data-tip="clipboardText">
                <button
                  aria-label="Copy TxHash to clipboard"
                  :aria-describedby="`tooltip-${selectedSwap.htlc2TransactionHash}`"
                  class="bg-transparent px-1.5"
                  @click="onClipboardCopy(selectedSwap.htlc2TransactionHash)"
                >
                  <ClipboardIcon class="w-5 h-5 text-end text-cyan-500" />
                </button>
              </div>
            </div>
            <div v-if="selectedSwap.brokerClaimedTransactionHash" class="flex">
              <span class="w-36">Broker Claim:</span>
              <span
                class="link hover:text-cyan-400 flex items-center gap-2"
                @click="redirectToExplorer(selectedSwap.brokerClaimedTransactionHash, selectedSwap.chainIn as Chains)"
              >
                {{ useAddress(selectedSwap.brokerClaimedTransactionHash) }}
              </span>
              <div v-if="selectedSwap.brokerClaimedTransactionHash" aria-role="tooltip" class="tooltip text-xs" :data-tip="clipboardText">
                <button
                  aria-label="Copy TxHash to clipboard"
                  :aria-describedby="`tooltip-${selectedSwap.brokerClaimedTransactionHash}`"
                  class="bg-transparent px-1.5"
                  @click="onClipboardCopy(selectedSwap.brokerClaimedTransactionHash)"
                >
                  <ClipboardIcon class="w-5 h-5 text-end text-cyan-500" />
                </button>
              </div>
            </div>
            <div v-if="selectedSwap.userClaimedTransactionHash" class="flex">
              <span class="w-36">User Claim:</span>
              <span
                class="link hover:text-cyan-400 flex items-center gap-2"
                @click="redirectToExplorer(selectedSwap.userClaimedTransactionHash, selectedSwap.chainOut as Chains)"
              >
                {{ useAddress(selectedSwap.userClaimedTransactionHash) }}
              </span>
              <div v-if="selectedSwap.userClaimedTransactionHash" aria-role="tooltip" class="tooltip text-xs" :data-tip="clipboardText">
                <button
                  aria-label="Copy TxHash to clipboard"
                  :aria-describedby="`tooltip-${selectedSwap.userClaimedTransactionHash}`"
                  class="bg-transparent px-1.5"
                  @click="onClipboardCopy(selectedSwap.userClaimedTransactionHash)"
                >
                  <ClipboardIcon class="w-5 h-5 text-end text-cyan-500" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div class="space-y-3">
          <h3 class="text-lg text-gray-400">Timestamps</h3>
          <div class="space-y-2 text-gray-300">
            <div>Created: {{ new Date(selectedSwap.createdAt).toLocaleString() }}</div>
            <div v-if="selectedSwap.updatedAt">Last Update: {{ new Date(selectedSwap.updatedAt).toLocaleString() }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
