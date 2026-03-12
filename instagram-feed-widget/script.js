const grid = document.getElementById("grid")
const refreshBtn = document.getElementById("refreshBtn")
const planBtn = document.getElementById("planBtn")

let sortable
let planMode = false

refreshBtn.onclick = loadFeed

planBtn.onclick = togglePlan

async function loadFeed(){

grid.innerHTML="Loading..."

const res = await fetch("/api/feed")

const data = await res.json()

grid.innerHTML=""

data.items.forEach(item=>{

const div=document.createElement("div")

div.className="card"
div.dataset.id=item.id

div.innerHTML=`<img src="${item.feedImage}">`

grid.appendChild(div)

})

initSortable()

}

function togglePlan(){

planMode=!planMode

planBtn.innerText=planMode ? "Plan Grid ON" : "Plan Grid OFF"

if(sortable){

sortable.option("disabled",!planMode)

}

}

function initSortable(){

sortable = new Sortable(grid,{
animation:150,
disabled:true,
onEnd:updateOrder
})

}

async function updateOrder(){

const ids=[...grid.children].map(c=>c.dataset.id)

await fetch("/api/reorder",{

method:"POST",

headers:{
"Content-Type":"application/json"
},

body:JSON.stringify({ids})

})

}

loadFeed()

setInterval(loadFeed,30000)