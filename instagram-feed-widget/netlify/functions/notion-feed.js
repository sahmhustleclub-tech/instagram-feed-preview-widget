exports.handler = async function(){

const token = process.env.NOTION_TOKEN
const database = process.env.NOTION_DATABASE_ID

const res = await fetch(`https://api.notion.com/v1/databases/${database}/query`,{

method:"POST",

headers:{
"Authorization":`Bearer ${token}`,
"Content-Type":"application/json",
"Notion-Version":"2022-06-28"
}

})

const data = await res.json()

const items = (data.results || [])
.filter(page => page.properties["Platform"]?.select?.name === "Instagram")
.map(page=>{

const props=page.properties

let image=""

const files=props["Attachment"]?.files

if(files && files.length>0){

image=files[0].file?.url || files[0].external?.url

}

return{

id:page.id,
feedImage:image

}

})

return{

statusCode:200,
body:JSON.stringify({items})

}

}