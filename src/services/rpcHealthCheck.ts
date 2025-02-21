import { ChainListDataType } from '@/config';
import axios from 'axios';

const MAX_REQUEST_TIME = 8000;

type HealthCheckPlan = {
  index: number;
  chainName: string;
  rpcURL: string;
  ping: number;
};

class RPCHealthCheck {
  private _data: ChainListDataType;
  private _updateInterval: number;

  private _plans: Record<string, HealthCheckPlan[]>;
  private _roundRobinIndex: Record<string, number>;

  constructor() {
    this._data = {
      abi: [],
      chainList: {},
    };

    this._plans = {};
    this._roundRobinIndex = {};
    this._updateInterval = 2 * 60 * 1000;
  }

  public async init(data: ChainListDataType) {
    this.setData(data);
    await this.update();
  }

  public getHealthyRPC(chainName: string) {
    const plans = this._plans[chainName];
    if (!plans) {
      return '';
    }

    if (!this._roundRobinIndex[chainName]) {
      this._roundRobinIndex[chainName] = 0;
    }

    for (let i = 0; i < plans.length; ++i) {
      const index = this._roundRobinIndex[chainName];
      const result = plans[index];
      this._roundRobinIndex[chainName] = (index + 1) % plans.length;
      if (result.ping > 0) {
        return result.rpcURL;
      }
    }

    return '';
  }

  public setData(data: ChainListDataType) {
    this._data = data;

    for (let [chainName, info] of Object.entries(this._data.chainList)) {
      if (!this._plans[chainName]) {
        this._plans[chainName] = [];
      }
      info.rpcURLs.forEach((rpcURL, index) => {
        if (!this._plans[chainName].find((it) => it.rpcURL === rpcURL)) {
          this._plans[chainName].push({
            index,
            chainName,
            rpcURL,
            ping: 1000,
          });
        }
      });
    }
  }

  private async update() {
    try {
      let allPlans: HealthCheckPlan[] = [];
      for (const [_, plans] of Object.entries(this._plans)) {
        allPlans = allPlans.concat(plans);
      }

      const PARALLEL_TESTS = 4;
      for (let i = 0; i < allPlans.length; i += PARALLEL_TESTS) {
        let promises = [];
        for (let j = 0; j < PARALLEL_TESTS; ++j) {
          promises.push(this.testPlan(allPlans[i + j]));
        }
        await Promise.allSettled(promises);
      }

      console.log('All checks done');
    } catch (ex) {
      console.error(ex);
    }

    setTimeout(() => this.update(), this._updateInterval);
  }

  private async testPlan(plan: HealthCheckPlan) {
    const startTime = performance.now();
    const blockNumber = await this.getLatestBlock(plan.rpcURL);
    if (blockNumber > 0) {
      plan.ping = performance.now() - startTime;
    } else {
      plan.ping = 0;
    }
    console.info(`[${plan.chainName}] ${plan.rpcURL} - ${blockNumber} - ${Math.floor(plan.ping)}ms`);
  }

  private async getLatestBlock(url: string) {
    try {
      const response = await axios.post(
        url,
        {
          jsonrpc: '2.0',
          method: 'eth_blockNumber',
          params: [],
          id: 1,
        },
        {
          headers: { 'Content-Type': 'application/json' },
          timeout: MAX_REQUEST_TIME,
        }
      );

      const blockNumber = parseInt(response.data.result, 16);
      if (isNaN(blockNumber)) {
        return 0;
      }
      return blockNumber;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('RPC Error:', url, error.response ? error.response.data : error.message);
      } else {
        console.error(error);
      }
    }

    return 0;
  }
}

export const rpcHealthCheck = new RPCHealthCheck();
