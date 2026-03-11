const grid = document.getElementById("grid")
const refreshBtn = document.getElementById("refreshBtn")

refreshBtn.onclick = loadFeed

async function loadFeed(){

grid.innerHTML="Loading..."

const res = await fetch("/api/feed")

const data = await res.json()

grid.innerHTML=""

data.items.forEach(item=>{

const div=document.createElement("div")

div.className="card"

div.innerHTML=`<img src="${item.feedImage}">`

grid.appendChild(div)

})

}

loadFeed()