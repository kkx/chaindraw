const Draw = artifacts.require('Draw');
const utils = require('./utils');
const config = require('./config');
const Status = utils.Status;
const T = utils.T
var draw;

async function getPendingDrawStatus(){
	var statuses = await Status.findAll({ where: {state: 0} })
	return statuses
}

async function drawResponseBot(){
	// sync db
	//await utils.sequelize.sync();

	console.log(draw.address)
	while(true){
        statuses = await getPendingDrawStatus();
        console.log(statuses)
        //await utils.sleep(5000);
        for (var i=0; i<statuses.length; i++){
            var winner_id = ''
            try{
                winner_id = await draw.getWinnerByTwitterId(statuses[i].status_id.toString())
                var username = await new Promise(resolve => {
                    T.get('users/lookup', {user_id:  winner_id.toString()}, function(error, data, response){resolve(data)})
                }); 
                console.log(username, {user_id:  winner_id.toString()})
                if (username[0]){
                    username = username[0].screen_name;
                }else{
                    username = winner_id;
                }

                // publish winner id to twitter
                await new Promise(resolve => {
                    T.post('statuses/update', {status:  "The winner for this draw is " + username + "(id:" + winner_id + ") For more proof please refer: https://rinkeby.etherscan.io/address/0x92174A89559b38d536Efc363CBc1fdE782A4bf56", in_reply_to_status_id: statuses[i].status_id, auto_populate_reply_metadata: true}, function(error, data, response){resolve(data)})
                }); 
                statuses[i].state = 1
                await statuses[i].save()
            }catch(e){
                console.log(e)
                console.log('status ', statuses[i].status_id, 'not filled with random number')
            }
        }
        break;
	}
}

module.exports = async function(callback) {
    draw = await Draw.at(config.drawContractAddress)
        try{
            await drawResponseBot();
        }catch(error){
            console.log(error)
        }
    callback()
}



