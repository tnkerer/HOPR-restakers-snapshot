const snapshot = require('./snapshot')
const fs = require('fs')
const util = require('util')

const S2_START_BLOCK = 20114766
const S2_SNAPSHOT_BLOCK = 21659759 // Snapshot time: 2022-04-15 23:48:40 UTC
const S3_START_BLOCK = 21819537
const S3_SNAPSHOT_BLOCK = 21868357 // Snapshot time: 2022-04-28 11:13:45 UTC
const AIRDROP_THRESHOLD = 250
const HOPR_S2_STAKE_ADDRESS = '0x2cDD13ddB0346E0F620C8E5826Da5d7230341c6E'
const HOPR_S3_STAKE_ADDRESS = '0xae933331ef0bE122f9499512d3ed4Fa3896DCf20'

util.inspect.defaultOptions.maxArrayLength = null

// This function removes addresses with balances
// below AIRDROP_THRESHOLD from a given datamap
function removeLowBalances (dataMap) {
  let count = 0
  dataMap.forEach((value, key) => {
    if (value < AIRDROP_THRESHOLD) {
      count++
      dataMap.delete(key)
    }
  })
  console.log(`${count} addresses were removed from the list because they held less than 250 HOPR during the first snapshot`)
  return dataMap
}

// Staker addresses are sorted in a Map object.
// This function will convert it to a JSON object
// already formated for the hopr-stake NFT minting
// guidelines

function mapToObj (inputMap) {
  const jsonStr = '{"data":[]}'
  const obj = JSON.parse(jsonStr)
  let count = 0
  inputMap.forEach(function (value, key) {
    obj.data.push({
      '': count,
      eoa: `>${key}<`,
      grade: value
    })
    count++
  })

  return obj
}

// Sorting Out users that:
// Were staking in Season 2 of the HOPR staking program at the season 3 Medium article was published.
// Had a stake of 250 HOPR Token or higher in Season 2
// That address was also staking in Season 3 of the HOPR staking program 72hrs after the start time.

async function sortEligible () {
  let data
  console.log('====================== STEP 01 ======================')
  data = await snapshot.fetchData(S2_START_BLOCK, S2_SNAPSHOT_BLOCK, HOPR_S2_STAKE_ADDRESS)
  console.log('====================== STEP 02 ======================')
  data = removeLowBalances(data)
  const seasonTwoData = data
  fs.writeFileSync('./logs/season2_stakers.log', util.inspect(seasonTwoData), 'utf-8')
  console.log('====================== STEP 03 ======================')
  data = await snapshot.fetchData(S3_START_BLOCK, S3_SNAPSHOT_BLOCK, HOPR_S3_STAKE_ADDRESS)
  const seasonThreeData = data
  fs.writeFileSync('./logs/season3_stakers.log', util.inspect(seasonThreeData), 'utf-8')
  const eligible = new Map()

  seasonThreeData.forEach((value, key) => {
    if (seasonTwoData.has(key)) {
      // This line calculate the percentile of staked HOPR
      // in Season 3 against amount staked in Season 2
      const percentile = value / seasonTwoData.get(key)
      if (percentile === 0) { return }
      eligible.set(key, percentile)
    }
  })

  // Sorting eligible addressess by descending percentiles
  const eligibleSorted = new Map([...eligible].sort((a, b) => b[1] - a[1]))

  // Converting percentiles to NFT Tier (Bronze, Silver, Gold or Diamond)
  eligibleSorted.forEach((value, key) => {
    if (value > 0 && value < 0.5) {
      eligibleSorted.set(key, 'Bronze')
    } else if (value >= 0.5 && value < 1) {
      eligibleSorted.set(key, 'Silver')
    } else if (value >= 1 && value < 1.1) {
      eligibleSorted.set(key, 'Gold')
    } else if (value >= 1.1) {
      eligibleSorted.set(key, 'Diamond')
    }
  })
  console.log('====================== STEP 04 ======================')
  console.log(`${eligibleSorted.size} eligible restakers found!`)
  fs.writeFileSync('./logs/eligible_restakers.log', util.inspect(eligibleSorted), 'utf-8')
  return mapToObj(eligibleSorted)
}

// Building CSV file from the JSON object

async function jsonToCsv () {
  const json = await sortEligible()
  const fields = Object.keys(json.data[0])
  const replacer = function (key, value) { return value === null ? '' : value }
  let csv = json.data.map(function (row) {
    return fields.map(function (fieldName) {
      return JSON.stringify(row[fieldName], replacer).replace(/"/g, '')
    }).join(',')
  })
  csv.unshift(fields.join(',')) // add header column
  csv = csv.join('\r\n')
  fs.writeFileSync('./Restaker_Recipients.csv', csv, 'utf-8')
  console.log('====================== STEP 05 ======================')
  console.log('Restaker_Recipients.csv was written in the current folder!')
}

jsonToCsv()
