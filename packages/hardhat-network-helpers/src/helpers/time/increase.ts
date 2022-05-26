import type { NumberLike } from "../../types";

import {
  getHardhatProvider,
  toRpcQuantity,
  assertPositiveNumber,
  toBigInt,
} from "../../utils";
import { mine } from "../mine";

import { latest } from "./latest";

/**
 * Mines a new block whose timestamp is `amountInSeconds` after the latest block's timestamp.
 *
 * @param amountInSeconds Number of seconds to increase the next block's timestamp by.
 * @returns The timestamp of the mined block.
 * @example
 * // advance time by one hour and mine a new block
 * await helpers.time.increase(3600);
 */
export async function increase(amountInSeconds: NumberLike): Promise<number> {
  const provider = await getHardhatProvider();

  const normalizedAmount = toBigInt(amountInSeconds);
  assertPositiveNumber(normalizedAmount);

  const latestTimestamp = BigInt(await latest());

  const targetTimestamp = latestTimestamp + normalizedAmount;

  await provider.request({
    method: "evm_setNextBlockTimestamp",
    params: [toRpcQuantity(targetTimestamp)],
  });

  await mine();

  return latest();
}
