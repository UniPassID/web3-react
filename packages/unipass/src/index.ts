import type {
  UniPassProvider,
  UniPassProviderOptions,
} from "@unipasswallet/ethereum-provider";
import type { Actions, ProviderRpcError } from "@web3-react/types";
import { Connector } from "@web3-react/types";
import type { EventEmitter } from "node:events";

type UniPassProviderForConnector = UniPassProvider & EventEmitter;

/**
 * @param options - Options to pass to `@unipasswallet/ethereum-provider`
 * @param onError - Handler to report errors thrown from eventListeners.
 */
export interface UniPassConstructorArgs {
  actions: Actions;
  options: UniPassProviderOptions;
  onError?: (error: Error) => void;
}

export class UniPass extends Connector {
  /** {@inheritdoc Connector.provider} */
  public declare provider?: UniPassProviderForConnector;
  private readonly options: UniPassProviderOptions;
  private eagerConnection?: Promise<void>;

  constructor({ actions, options, onError }: UniPassConstructorArgs) {
    super(actions, onError);
    this.options = options;
  }

  /** {@inheritdoc Connector.connectEagerly} */
  public async connectEagerly(): Promise<void> {
    return await this._connect();
  }

  /** {@inheritdoc Connector.activate} */
  public async activate(): Promise<void> {
    return await this._connect();
  }

  private async _connect(): Promise<void> {
    const cancelActivation = this.actions.startActivation();

    try {
      await this.isomorphicInitialize();
      if (!this.provider) return cancelActivation();

      const account = await this.provider.connect();
      if (account) {
        this.actions.update({
          chainId: this.options?.chainId ?? 137,
          accounts: [account.address],
        });
      } else {
        throw new Error("No accounts returned");
      }
    } catch (error) {
      console.debug("Could not connect eagerly", error);
      cancelActivation();
    }
  }

  private async isomorphicInitialize(): Promise<void> {
    if (this.eagerConnection) return;

    return (this.eagerConnection = import(
      "@unipasswallet/ethereum-provider"
    // eslint-disable-next-line @typescript-eslint/require-await
    ).then(async (m) => {
      const provider = new m.UniPassProvider(this.options);
      if (provider) {
        this.provider = provider as UniPassProviderForConnector;

        this.provider.on("disconnect", this.disconnectListener);
      }
    }));
  }

  private disconnectListener = (error?: ProviderRpcError): void => {
    this.actions.resetState();
    if (error) this.onError?.(error);
  };
}
