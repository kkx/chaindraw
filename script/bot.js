const utils = require('./utils');
const config = require('./config');
const Draw = artifacts.require('Draw');
const Status = utils.Status;

async function addDrawStatus(mention){
	// add to db
	s = await Status.findOne({ where: {status_id: mention.id_str}})
	console.log(mention)
	console.log(s)
	if (!s){
		retweeters = [];
		while(true){
				var retweets = await new Promise(resolve => {
					utils.T.get('statuses/retweeters/ids', {id: mention.quoted_status_id_str, count:100,  trim_user:1, include_entities: false, stringify_ids: true}, function(error, data, response){resolve(data)})
				}); 
				retweeters.push(...retweets.ids)
				console.log('retwitters', retweeters)
				// prepared for premiun api where we can receive more then 100 ids
				if (retweets['next_cursor'] == 0){
					break;
				}
		}
			
		
	    // create draw in blockchain
	    var drawContract = await Draw.at(config.drawContractAddress)
		console.log(mention.id_str, retweeters, retweeters.length)
		console.log(Date.now().toString())
		const hash = web3.utils.sha3(Date.now().toString());
		console.log("hash", hash)
		var seed = new web3.utils.BN(hash);
		console.log("seed", seed)
		await drawContract.takeDraw(mention.id_str, retweeters, retweeters.length, seed);
	    s = await Status.create({status_id: mention.id_str, ids: retweeters.join(',')})
		console.log("status created", s)
    }else{
		console.log('mention already processed');
	}
}

async function addDrawStatuses(mentions){
	for (var i=0; i<mentions.length; i++){
		await addDrawStatus(mentions[i])
		break
	}
}

async function getLastStatusId(){
	try{
		var statuses = await Status.findAll({ order: [ ['status_id', 'DESC'], ] })
	} catch (error) {
	  console.error('Unable to connect to the database:', error);
	}
	console.log('db statueses', statuses)
    var last_status = statuses[0];
	var last_id = 0;
	if (last_status){
		last_id = last_status.status_id;
	}
	return last_id 
}


async function twitterBot(){
	// sync db
	await utils.sequelize.sync();
	console.log("synced")

	var draw = await Draw.at(config.drawContractAddress)
	console.log(draw.address)
	while(true){
			last_id = await getLastStatusId(); 
			console.log('last_id', last_id);
			var mentions = await new Promise(resolve => {
					utils.T.get('statuses/mentions_timeline', {count:50, since: last_id, trim_user:1, include_entities: true }, function(error, data, response){resolve(data)})
				  }); 
			console.log('metions', mentions)
			await addDrawStatuses(mentions)
		    await utils.sleep(50000);
	}
}


module.exports = async function(callback) {
	try{
		await twitterBot();
	}catch(error){
		console.log(error)
	}
	callback()
}



