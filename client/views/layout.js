const html = require('choo/html')
const css = require('sheetify')

const LeftPanel = require('./left-panel')

const prefix = css`
  :host {
    height: 100%;
    display: flex;
  }
  .left {
    width: 200px;
    overflow-y: auto;
    background-color: #2F4550;
  }
  .right {
    height: 100%;
    flex: 1 auto;
    display: flex;
    flex-direction: column;
  }
`

module.exports = (CurrentView) => (state, prev, send) => {
  const leftPanel = LeftPanel(state, prev, send)
  leftPanel.classList.add('left')

  const currentView = CurrentView ? CurrentView(state, prev, send) : html`<div></div>`
  currentView.classList.add('right')

  return html`
    <div onload=${() => send('convos:fetch')} class=${prefix}>
      ${leftPanel}
      ${currentView}
    </div>`
}
