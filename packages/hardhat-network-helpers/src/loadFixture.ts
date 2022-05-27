import type { SnapshotRestorer } from "./helpers/takeSnapshot";

import { FixtureSnapshotError, InvalidSnapshotError } from "./errors";

type Fixture<T> = () => Promise<T>;

interface Snapshot<T> {
  restorer: SnapshotRestorer;
  fixture: Fixture<T>;
  data: T;
}

const snapshots: Array<Snapshot<any>> = [];

/**
 * Useful for `beforeEach` hooks that setup the desired state of the network.
 *
 * Executes the given function and takes a snapshot of the blockchain. Upon
 * subsequent calls to `loadFixture` with the same function, rather than
 * executing the function again, the blockchain will be restored to that
 * snapshot.
 *
 * *Warning*: don't use `loadFixture` with an anonymous function, otherwise the
 * function will be executed each time instead of using snapshots:
 *
 * - Correct usage: `loadFixture(deployTokens)`
 * - Incorrect usage: `loadFixture(async () => { ... })`
 *
 * @param fixture The function that will be used to set up the fixture.
 * @example
 * async function deployContractsFixture() {
 *   const token = await Token.deploy(...);
 *   const exchange = await Exchange.deploy(...);
 *
 *   return { token, exchange };
 * }
 *
 * it("test", async function () {
 *   const { token, exchange } = await loadFixture(deployContractsFixture);
 *
 *   // use token and exchanges contracts
 * })
```
 */
export async function loadFixture<T>(fixture: Fixture<T>): Promise<T> {
  const snapshot = snapshots.find((s) => s.fixture === fixture);

  const { takeSnapshot } = await import("./helpers/takeSnapshot");

  if (snapshot !== undefined) {
    try {
      await snapshot.restorer.restore();
    } catch (e) {
      if (e instanceof InvalidSnapshotError) {
        throw new FixtureSnapshotError(e);
      }

      throw e;
    }

    return snapshot.data;
  } else {
    const data = await fixture();
    const restorer = await takeSnapshot();

    snapshots.push({
      restorer,
      fixture,
      data,
    });

    return data;
  }
}
