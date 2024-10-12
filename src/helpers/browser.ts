export const getActiveTab = async (): Promise<chrome.tabs.Tab> => {
    return new Promise((resolve) => {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        resolve(tabs[0])
      })
    })
  }
  
  export const openTab = async (url: string) => chrome.tabs.create({ url })
  
  export const getElementXPath = (element) => {
    if (element.id) {
      return '//*[@id="' + element.id + '"]'
    }
  
    if (element === document.body) {
      return '/html/body'
    }
  
    let ix = 0
    const siblings = element.parentNode.childNodes
  
    for (let i = 0; i < siblings.length; i++) {
      const sibling = siblings[i]
  
      if (sibling === element) {
        return (
          getElementXPath(element.parentNode) +
          '/' +
          element.tagName.toLowerCase() +
          '[' +
          (ix + 1) +
          ']'
        )
      }
  
      if (sibling.nodeType === 1 && sibling.tagName === element.tagName) {
        ix++
      }
    }
  }