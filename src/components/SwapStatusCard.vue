<script setup lang="ts">
import { ClipboardIcon } from '@heroicons/vue/24/outline';
import { Chains, type SwapHistory } from '@odinxorg/types';
import { clipboardText, onClipboardCopy, useAddress } from '../utils/formatAddress';
import { validatedENV } from '../validatedEnv';

defineProps<{
  swapStatus: SwapHistory;
}>();

const redirectToExplorer = (txHash: string, chain: Chains) => {
  if (chain === Chains.BITCOIN) {
    window.open(`${validatedENV.VITE_BITCOIN_EXPLORER_URL}/tx/${txHash}`, '_blank');
  } else if (chain === Chains.ETHEREUM) {
    window.open(`${validatedENV.VITE_ETHEREUM_EXPLORER_URL}/tx/${txHash}`, '_blank');
  }
};
</script>

<template>
  <div class="bg-gray-700 w-auto p-6">
    <h2 class="text-2xl font-bold mb-6 border-b border-gray-600 pb-3">Swap Status</h2>
    <div class="space-y-4 text-gray-300">
      <div>
        <span class="font-bold">Status: </span>
        <span class="text-cyan-500">{{ swapStatus?.status }}</span>
      </div>
      <ul class="steps steps-vertical w-full">
        <li
          class="step mt-5"
          :class="{ 'step-success': swapStatus?.htlc1TransactionHash }"
          :data-content="swapStatus?.htlc1TransactionHash ? '✓' : '1'"
        >
          <div>
            <span class="font-bold">HTLC 1 Transaction Hash: </span>
            <span
              v-if="swapStatus?.htlc1TransactionHash"
              class="link text-cyan-500"
              @click="redirectToExplorer(swapStatus.htlc1TransactionHash, swapStatus.chainOut as Chains)"
              >{{ useAddress(swapStatus.htlc1TransactionHash) }}
            </span>
            <div v-if="swapStatus?.htlc1TransactionHash" aria-role="tooltip" class="tooltip text-xs z-90" :data-tip="clipboardText">
              <button
                aria-label="Copy TxHash to clipboard"
                :aria-describedby="`tooltip-${swapStatus.htlc1TransactionHash}`"
                class="bg-transparent px-1.5"
                @click="onClipboardCopy(swapStatus.htlc1TransactionHash)"
              >
                <ClipboardIcon class="w-5 h-5 text-end text-cyan-500" />
              </button>
            </div>
          </div>
        </li>
        <li
          class="step"
          :class="{ 'step-success': swapStatus?.htlc2TransactionHash }"
          :data-content="swapStatus?.htlc2TransactionHash ? '✓' : '2'"
        >
          <div>
            <span class="font-bold">HTLC 2 Transaction Hash: </span>
            <span
              v-if="swapStatus?.htlc2TransactionHash"
              class="link text-cyan-500"
              @click="redirectToExplorer(swapStatus.htlc2TransactionHash, swapStatus.chainIn as Chains)"
              >{{ useAddress(swapStatus.htlc2TransactionHash) }}
            </span>
            <div v-if="swapStatus?.htlc2TransactionHash" aria-role="tooltip" class="tooltip text-xs" :data-tip="clipboardText">
              <button
                aria-label="Copy TxHash to clipboard"
                :aria-describedby="`tooltip-${swapStatus.htlc2TransactionHash}`"
                class="bg-transparent px-1.5"
                @click="onClipboardCopy(swapStatus.htlc2TransactionHash ?? '')"
              >
                <ClipboardIcon class="w-5 h-5 text-end text-cyan-500" />
              </button>
            </div>
          </div>
        </li>
        <li
          class="step"
          :class="{ 'step-success': swapStatus?.brokerClaimedTransactionHash }"
          :data-content="swapStatus?.brokerClaimedTransactionHash ? '✓' : '3'"
        >
          <div>
            <span class="font-bold">Broker Claimed Transaction Hash: </span>
            <span
              v-if="swapStatus?.brokerClaimedTransactionHash"
              class="link text-cyan-500"
              @click="redirectToExplorer(swapStatus.brokerClaimedTransactionHash, swapStatus.chainIn as Chains)"
              >{{ useAddress(swapStatus.brokerClaimedTransactionHash) }}
            </span>
            <div v-if="swapStatus?.brokerClaimedTransactionHash" aria-role="tooltip" class="tooltip text-xs" :data-tip="clipboardText">
              <button
                aria-label="Copy TxHash to clipboard"
                :aria-describedby="`tooltip-${swapStatus.userClaimedTransactionHash}`"
                class="bg-transparent px-1.5"
                @click="onClipboardCopy(swapStatus.userClaimedTransactionHash ?? '')"
              >
                <ClipboardIcon class="w-5 h-5 text-end text-cyan-500" />
              </button>
            </div>
          </div>
        </li>
        <li
          class="step"
          :class="{ 'step-success': swapStatus?.userClaimedTransactionHash }"
          :data-content="swapStatus?.userClaimedTransactionHash ? '✓' : '4'"
        >
          <div>
            <span class="font-bold">User Claimed Transaction Hash: </span>
            <span
              v-if="swapStatus?.userClaimedTransactionHash"
              class="link text-cyan-500"
              @click="redirectToExplorer(swapStatus.userClaimedTransactionHash, swapStatus.chainOut as Chains)"
              >{{ useAddress(swapStatus.userClaimedTransactionHash) }}
              <div aria-role="tooltip" class="tooltip text-xs" :data-tip="clipboardText">
                <button
                  aria-label="Copy TxHash to clipboard"
                  :aria-describedby="`tooltip-${swapStatus.userClaimedTransactionHash}`"
                  class="bg-transparent px-1.5"
                  @click="onClipboardCopy(swapStatus.userClaimedTransactionHash ?? '')"
                >
                  <ClipboardIcon class="w-5 h-5 text-end text-cyan-500" />
                </button>
              </div>
            </span>
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>
