const config = require('./config')
const twitter = require('twit');

const { Sequelize, DataTypes } = require('sequelize');
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: 'database.sqlite'
})
const Status = sequelize.define('Status', {
  // Model attributes are defined here
  status_id: {
    type: DataTypes.STRING,
    allowNull: false
  },
  draw: {
    type: DataTypes.INTEGER,
	allowNull: true
    // allowNull defaults to true
  },
  ids: {
	type: DataTypes.STRING,
	allowNull: false,
	},
  state: { 
	type: DataTypes.INTEGER,
    defaultValue: 0,
  }
}, 
 {
      indexes:[
       {
         unique: false,
         fields:['status_id']
       },
		{
         unique: false,
         fields:['state']
       }
      ]
  // Other model options go here
});

const T = new twitter(config.twitterConfig)

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}   

module.exports = {
    Status,
    sleep, 
    T,
    sequelize 
}
