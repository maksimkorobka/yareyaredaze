const request = require("axios");
const APIKEY = "57ee3318536b23ee81d6b27e36997cde"
const elasticsearch = require('elasticsearch');
const client = new elasticsearch.Client({
  host: 'localhost:9200',
  log: 'error'
});
const getFriends = async (user_id) => {
    const result = await request.get(`http://ws.audioscrobbler.com/2.0/?method=user.getfriends&user=${user_id}&api_key=${APIKEY}&format=json`);
    const friend =result.data.friends.user;
    return friend;
    
}
const main = async (user_id) =>{
    const allFriends = await getFriends(user_id);
    allFriends.forEach(friend => {
       if (insertUser(friend)){
           main(friend.name)
       }
        
    });
} 
const insertUser = async(user) => {
     if (await isUserIndexed(user.name)){
         return null;
     }
    return await client.index({
        index: 'users',
        type: '_doc',
        id: user.name,
        body: prepareUser(user) 
      });
}
const prepareUser = (user) => {
    const result = {...user};
    delete result.url
    delete result.image
    delete result.name
    return result
}
const isUserIndexed = async(id) => {
    return await client.exists({
        index: 'users',
        type: '_doc',
        id:id
      });
}
main("sladkiy_yoba");
