# Chaindraw

A demo project which is based on [chainlink VRF](https://docs.chain.link/docs/chainlink-vrf) to provide a fairly draw ceremony on ethereum blockchain to twitter users. 

## Description
A lot of draw event happen nowaday in social network as a marketing method, however draw event creators normally provide the winner by a black-box selection which creates doubts about the fairness of the event. With blockchain based solution ChainDraw, draw event can be fully transparent and verifiable to user. 
The mecanism consists in following steps:
- user call [chainDraw](https://twitter.com/chain_draw) bot by doing a quote_retweet and texting @chain_draw, a draw event is then created.
- Currently, the retweeter of the quoted_tweet will be used as the population of the created draw event, retweeter's ids will be submitted to our [draw smartcontract](https://rinkeby.etherscan.io/address/0x92174A89559b38d536Efc363CBc1fdE782A4bf56) by calling `takeDraw` transaction, and a request to chainlink vrf for a random number will be created.
- on the other hand, chainlink vrf will provide a random number once it get notified by our transaction, a winner user id will be stored by doing: `winner = population[random_number % population_length]` 
- The result will be communicated back to twitter draw event creator as a comment to the same draw retweet.

## prerequisites
- truffle
- node@12
- sqlite3
- twitter developer account

## Installation
- `git clone https://github.com/kkx/chaindraw`
- `npm install`
- export following environment variables

```bash
export mneonic=""
export web3Endpoint=""
export consumer_key=""
export consumer_secret=""
export access_token=""
export access_token_secret=""
```

## Test
- deploy draw smart contract: `truffle migrate --network rinkeby`
- run bot1 to listen draw event creation and create draw event in blockchain: `truffle exec script/bot.js --network rinkeby`
- run bot2 to check draw event result from blockchain and write back the result to draw event creator: `truffle exec script/bot_check.js --network rinkeby`


## Demo Account
Currently, a [twitter bot account](https://twitter.com/chain_draw) is deployed and bound with a twitter developer account, one(draw event creator) can simple test the application by doing a "quote retweet" of an arbitrary tweet(with retweets)
and texting at least @chain_draw to call the bot, Bot will extract retweeted user list to put it onchaink. A random number will be provided by VRF to select the lucky winner of the draw ceremony. 
Bot will listen blockchain events and answers to original draw creator about the result once the winner is selected.
