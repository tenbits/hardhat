import { getHardhatProvider } from "../../utils";

/**
 * Returns the number of the latest block.
 * @example
 * await helpers.time.latestBlock();
 */
export async function latestBlock(): Promise<number> {
  const provider = await getHardhatProvider();

  const height = (await provider.request({
    method: "eth_blockNumber",
    params: [],
  })) as string;

  return parseInt(height, 16);
}
