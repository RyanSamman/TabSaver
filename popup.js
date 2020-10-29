getTabList(rerenderList)

addAllButton = document.getElementById("addAll")
addAllButton.onclick = addAllTabs

addCurrentButton = document.getElementById("addCurrent")
addCurrentButton.onclick = addCurrentTab

deleteAllButton = document.getElementById("deleteAll")
deleteAllButton.onclick = deleteAllSavedTabs


function rerenderList(savedTabs) {
	listRoot = document.getElementById("listRoot")
	listRoot.innerHTML = ''
	const newTabElements = savedTabs.map(createListElement)
	newTabElements.forEach(e => listRoot.appendChild(e))
}

function addAllTabs() {
	chrome.windows.getCurrent({ populate: true }, window => {
		if (window.id == -1) return // No window present

		newTabs = window.tabs.map(tab => ({ title: tab.title, url: tab.url }))
		getTabList(oldTabs => {
			oldTabs.push(...newTabs)
			setTabList(oldTabs, rerenderList)
		})
	})
}

function addCurrentTab() {
	chrome.windows.getCurrent({ populate: true }, window => {
		activeTab = window.tabs.find(tab => tab.active)
		getTabList(oldTabs => {
			oldTabs.push({ title: activeTab.title, url: activeTab.url })
			setTabList(oldTabs, rerenderList)
		})
	})
}

function deleteAllSavedTabs() {
	console.log('deleting')
	setTabList([], rerenderList)
}

function deleteOneTab(tabIndex) {
	console.log(`deleting ${tabIndex}`)
	getTabList(oldTabs => {
		const newTabs = oldTabs.filter((_, i) => i != tabIndex)
		setTabList(newTabs, rerenderList)
	})

}

function createListElement({ title = 'MISSING TITLE', url = '#' }, index) {
	// Reduce size of title if it's too big
	const maxNameLength = 30
	const adjustedTitle = title.length < maxNameLength ? title : title.substring(0, maxNameLength) + "..."

	// Create a new list element (safely to prevent XSS)
	let template = document.createElement("template")

	template.innerHTML = (
		'<div class="list-group-item d-flex justify-content-between">'
		+ '<a class="flex-grow-1" target="_blank" href="#"></a>'
		+ '<button class="btn btn-light circle-button"><img class="red-svg" src="delete.svg" alt="trash svg"></button>'
		+ '</div>'
	)

	const newNode = template.content.firstChild
	const [anchorNode, buttonNode] = newNode.children

	// Set the text and url for each list element
	anchorNode.href = url
	anchorNode.innerText = adjustedTitle

	buttonNode.onclick = () => deleteOneTab(index);

	return newNode

}

// Apparently not sync... callback hell it is
function getTabList(callback) {
	chrome.storage.sync.get('tabList', data => callback(data.tabList))
}

function setTabList(newTabList = [], callback) {
	chrome.storage.sync.set({ 'tabList': newTabList }, () => callback(newTabList))
}
