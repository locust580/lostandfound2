const Post = require('../models/Post');

async function searchFor(term) {  
  //input scrubbing
  const searchNoSpecialChar = term.replace(/[^a-zA-Z0-9 ]/g, "");
  //make a list of terms to allow for ambidirectional searching
  let searchList = searchNoSpecialChar.split(' ');
  //set data variable
  let data = [];
  //merge function
  const merge = (a, b, predicate = (a, b) => a === b) => {
    const c = [...a]; // copy to avoid side effects
    // add all items from B to copy C if they're not already present
    b.forEach((bItem) => (c.some((cItem) => predicate(bItem, cItem)) ? null : c.push(bItem)))
    return c;
  }
  //iterate through search terms and compile array of objects matching them
  for (let i = 0; i < searchList.length; i++) {
    let midData = await Post.find({
      $or: [
          { title: { $regex: new RegExp(searchList[i], 'i') }},
          { body: { $regex: new RegExp(searchList[i], 'i') }}
      ]
    });
    if (midData != []){
      //data = data.concat(midData);
      data = merge(data, midData, (a,b) => a.createdAt === b.createdAt);
    }
  }
  //return the sorted and searched posts
  return data;
}

module.exports = searchFor;
