import { OdinTradeSdk, WindowProviderEvmSigner, XverseBitcoinSigner } from '@odinxorg/sdk';
import { defineStore } from 'pinia';
import { validatedENV } from '../validatedEnv';

let evmSigner = new WindowProviderEvmSigner();
let btcSigner = new XverseBitcoinSigner();
const walletPartnerId = '<wallet-partner-id>'
let odinTrade = new OdinTradeSdk({
  ethereumSigner: evmSigner,
  bitcoinSigner: btcSigner,
  url: validatedENV.VITE_BACKEND_URL,
  walletPartnerId
});

export const useWalletStore = defineStore('walletStore', {
  state: () => ({
    connected: false,
    evmAddress: '',
    btcAddress: '',
    odinTrade: odinTrade,
    initialized: false,
    attemptedToConnect: false,
  }),

  persist: true,

  actions: {
    init() {
      if (this.initialized) return;
      console.log('[walletStore] Initializing signers and OdinX SDK...');
      evmSigner = new WindowProviderEvmSigner();
      btcSigner = new XverseBitcoinSigner();
      odinTrade = new OdinTradeSdk({
        bitcoinSigner: btcSigner,
        ethereumSigner: evmSigner,
        url: validatedENV.VITE_BACKEND_URL,
        walletPartnerId: walletPartnerId,
      });
      this.initialized = true;
      console.log('....odinTrade', odinTrade, process.env.VITE_BACKEND_URL);
    },
    getEvmSigner() {
      return evmSigner;
    },
    getBtcSigner() {
      return btcSigner;
    },
    getOdinTrade() {
      return odinTrade;
    },

    async connectWallets() {
      try {
        this.init();
        this.attemptedToConnect = true;
        console.log('Connecting wallets...');
        await evmSigner.connect();
        await btcSigner.connect();

        this.evmAddress = await evmSigner.getAddress();
        console.log('EVM Address:', this.evmAddress);
        this.btcAddress = await btcSigner.getAddress();
        console.log('BTC Address:', this.btcAddress);

        this.connected = !!this.evmAddress && !!this.btcAddress;
        console.log('Connected:', this.connected);
      } catch (error) {
        console.error('Wallet connection failed:', error);
        this.connected = false;
      }
    },

    async checkConnection() {
      if (!this.connected) {
        await this.connectWallets();
      } else {
        this.evmAddress = await evmSigner.getAddress();
        this.btcAddress = await btcSigner.getAddress();
      }
    },

    resetWallets() {
      evmSigner = new WindowProviderEvmSigner();
      btcSigner = new XverseBitcoinSigner();
      odinTrade = new OdinTradeSdk({
        url: validatedENV.VITE_BACKEND_URL,
      });
      localStorage.clear();
      this.connected = false;
      this.evmAddress = '';
      this.btcAddress = '';
      this.initialized = true;
      console.log('[walletStore] Wallets reset');
    },
  },
});
