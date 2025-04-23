import { OdinTradeSdk } from '@odinxorg/sdk';
import type { GetTokenSwapDetailsRequest } from '@odinxorg/types';
import { type MaxAmountOutRequest } from '@odinxorg/types';

interface CreateSwapFrontendRequest {
  amountOut: number;
  tokenInSymbol: string;
  tokenOutSymbol: string;
  chainIn: 'bitcoin' | 'ethereum';
  chainOut: 'bitcoin' | 'ethereum';
}

export class SdkService {
  private readonly odinTradeSdk: OdinTradeSdk;
  constructor(odinTradeSdk: OdinTradeSdk) {
    this.odinTradeSdk = odinTradeSdk;
  }

  async getTokenSwapDetails(request: GetTokenSwapDetailsRequest) {
    const response = await this.odinTradeSdk.getTokenSwapDetails(request);
    return response;
  }

  async getMaxAmountOut(request: MaxAmountOutRequest) {
    const response = await this.odinTradeSdk.getMaxAmountOut(request);
    return response;
  }

  async createSwap(request: CreateSwapFrontendRequest) {
    try {
      const response = await this.odinTradeSdk.createSwap(request);
      return response;
    } catch (error) {
      console.error('Error creating swap', error);
      throw error;
    }
  }

  async confirmSwap(swapId: string, userClaimToSign: string) {
    const response = await this.odinTradeSdk.confirmSwap(swapId, userClaimToSign);
    return response;
  }

  async createUserHtlc(swapId: string) {
    const response = await this.odinTradeSdk.createUserHtlc(swapId);
    return response;
  }

  async confirmUserHtlc(swapId: string, userHtlc: string[]) {
    const response = await this.odinTradeSdk.confirmUserHtlc(swapId, userHtlc);
    return response;
  }

  async getSwapStatus(swapId: string) {
    const response = await this.odinTradeSdk.getSwap(swapId);
    return response;
  }

  async getAllSwapsHistory(addressIn?: string, addressOut?: string) {
    const response = await this.odinTradeSdk.getSwapHistory(addressIn, addressOut);
    return response;
  }
}
