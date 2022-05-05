# 🐰 HOPR Restakers Snapshot

A Node JS application to calculate recipients of Restaker HOPR Boost NFTs for the HOPR Association.

### ✅ Quick Rundown

This script works in `FIVE` steps:

1. A Snapshot with all Season 2 HOPR Stakers is taken
     * A snapshot was taken at Block Height `21653434` (2022-04-15 15:00:00 UTC)
     * Output logs for this snapshot are available at `./logs/season2_stakers.log`
     
2. The list has its addresses staking less than 250 HOPR removed

3. A Snapshot with all Season 3 HOPR Stakers is taken
     * A snapshot was taken at Block Height `21884993` (2022-04-29 12:00:00 UTC)
     * Output logs for this snapshot are available at `./logs/season3_stakers.log`

4. Eligible Restaker HOPR Boost NFT recipients are sorted out
    * NFT grades are attributed considering [HOPR Association guidelines](https://github.com/hoprnet/hoprnet/issues/3771)
    * Output logs with eligible address data are available at `./logs/eligible_restakers.log`

5. A CSV file is created following [HOPR's NFT minting guidelines](https://github.com/hoprnet/hopr-stake#batch-mint-nfts)
    * `Restaker_Recipients.csv` is the output file


# 🚀 Quick Start

To re-run this script, follow the steps:

### ✅ Clone or fork `HOPR-restakers-snapshot`:

```sh
git clone https://github.com/menezesphill/HOPR-restakers-snapshot.git
```

### ✅ Install all dependencies:

```sh
cd HOPR-restakers-snapshot
yarn install
```

### ✅ Run the script

You can run the script by writing:

```sh
node index.js
```

# 📢 Final Considerations

The original [ISSUE](https://github.com/hoprnet/hoprnet/issues/3771) recommended using [Dune Analytics](https://dune.com/browse/dashboards) for data handling. But unfortunatelly, exporting data as CSV files from Dune requires a [paid plan](https://dune.com/pricing). 

The approach we used is scalable, reusable, free, and checked against Dune Analytics results.
