exports.handler = async function(event){

const token = process.env.NOTION_TOKEN

const body = JSON.parse(event.body)

const ids = body.ids

for(let i=0;i<ids.length;i++){

await fetch(`https://api.notion.com/v1/pages/${ids[i]}`,{

method:"PATCH",

headers:{
"Authorization":`Bearer ${token}`,
"Content-Type":"application/json",
"Notion-Version":"2022-06-28"
},

body:JSON.stringify({

properties:{

"Order":{

number:i+1

}

}

})

})

}

return{

statusCode:200,

body:"ok"

}

}