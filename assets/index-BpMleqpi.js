(function(){let e=document.createElement(`link`).relList;if(e&&e.supports&&e.supports(`modulepreload`))return;for(let e of document.querySelectorAll(`link[rel="modulepreload"]`))n(e);new MutationObserver(e=>{for(let t of e)if(t.type===`childList`)for(let e of t.addedNodes)e.tagName===`LINK`&&e.rel===`modulepreload`&&n(e)}).observe(document,{childList:!0,subtree:!0});function t(e){let t={};return e.integrity&&(t.integrity=e.integrity),e.referrerPolicy&&(t.referrerPolicy=e.referrerPolicy),e.crossOrigin===`use-credentials`?t.credentials=`include`:e.crossOrigin===`anonymous`?t.credentials=`omit`:t.credentials=`same-origin`,t}function n(e){if(e.ep)return;e.ep=!0;let n=t(e);fetch(e.href,n)}})();var e=class e{constructor(t,n,r,i,a=`div`){this.parent=t,this.object=n,this.property=r,this._disabled=!1,this._hidden=!1,this.initialValue=this.getValue(),this.domElement=document.createElement(a),this.domElement.classList.add(`lil-controller`),this.domElement.classList.add(i),this.$name=document.createElement(`div`),this.$name.classList.add(`lil-name`),e.nextNameID=e.nextNameID||0,this.$name.id=`lil-gui-name-${++e.nextNameID}`,this.$widget=document.createElement(`div`),this.$widget.classList.add(`lil-widget`),this.$disable=this.$widget,this.domElement.appendChild(this.$name),this.domElement.appendChild(this.$widget),this.domElement.addEventListener(`keydown`,e=>e.stopPropagation()),this.domElement.addEventListener(`keyup`,e=>e.stopPropagation()),this.parent.children.push(this),this.parent.controllers.push(this),this.parent.$children.appendChild(this.domElement),this._listenCallback=this._listenCallback.bind(this),this.name(r)}name(e){return this._name=e,this.$name.textContent=e,this}onChange(e){return this._onChange=e,this}_callOnChange(){this.parent._callOnChange(this),this._onChange!==void 0&&this._onChange.call(this,this.getValue()),this._changed=!0}onFinishChange(e){return this._onFinishChange=e,this}_callOnFinishChange(){this._changed&&(this.parent._callOnFinishChange(this),this._onFinishChange!==void 0&&this._onFinishChange.call(this,this.getValue())),this._changed=!1}reset(){return this.setValue(this.initialValue),this._callOnFinishChange(),this}enable(e=!0){return this.disable(!e)}disable(e=!0){return e===this._disabled?this:(this._disabled=e,this.domElement.classList.toggle(`lil-disabled`,e),this.$disable.toggleAttribute(`disabled`,e),this)}show(e=!0){return this._hidden=!e,this.domElement.style.display=this._hidden?`none`:``,this}hide(){return this.show(!1)}options(e){let t=this.parent.add(this.object,this.property,e);return t.name(this._name),this.destroy(),t}min(e){return this}max(e){return this}step(e){return this}decimals(e){return this}listen(e=!0){return this._listening=e,this._listenCallbackID!==void 0&&(cancelAnimationFrame(this._listenCallbackID),this._listenCallbackID=void 0),this._listening&&this._listenCallback(),this}_listenCallback(){this._listenCallbackID=requestAnimationFrame(this._listenCallback);let e=this.save();e!==this._listenPrevValue&&this.updateDisplay(),this._listenPrevValue=e}getValue(){return this.object[this.property]}setValue(e){return this.getValue()!==e&&(this.object[this.property]=e,this._callOnChange(),this.updateDisplay()),this}updateDisplay(){return this}load(e){return this.setValue(e),this._callOnFinishChange(),this}save(){return this.getValue()}destroy(){this.listen(!1),this.parent.children.splice(this.parent.children.indexOf(this),1),this.parent.controllers.splice(this.parent.controllers.indexOf(this),1),this.parent.$children.removeChild(this.domElement)}},t=class extends e{constructor(e,t,n){super(e,t,n,`lil-boolean`,`label`),this.$input=document.createElement(`input`),this.$input.setAttribute(`type`,`checkbox`),this.$input.setAttribute(`aria-labelledby`,this.$name.id),this.$widget.appendChild(this.$input),this.$input.addEventListener(`change`,()=>{this.setValue(this.$input.checked),this._callOnFinishChange()}),this.$disable=this.$input,this.updateDisplay()}updateDisplay(){return this.$input.checked=this.getValue(),this}};function n(e){let t,n;return(t=e.match(/(#|0x)?([a-f0-9]{6})/i))?n=t[2]:(t=e.match(/rgb\(\s*(\d*)\s*,\s*(\d*)\s*,\s*(\d*)\s*\)/))?n=parseInt(t[1]).toString(16).padStart(2,0)+parseInt(t[2]).toString(16).padStart(2,0)+parseInt(t[3]).toString(16).padStart(2,0):(t=e.match(/^#?([a-f0-9])([a-f0-9])([a-f0-9])$/i))&&(n=t[1]+t[1]+t[2]+t[2]+t[3]+t[3]),n?`#`+n:!1}var r={isPrimitive:!0,match:e=>typeof e==`string`,fromHexString:n,toHexString:n},i={isPrimitive:!0,match:e=>typeof e==`number`,fromHexString:e=>parseInt(e.substring(1),16),toHexString:e=>`#`+e.toString(16).padStart(6,0)},a=[r,i,{isPrimitive:!1,match:e=>Array.isArray(e)||ArrayBuffer.isView(e),fromHexString(e,t,n=1){let r=i.fromHexString(e);t[0]=(r>>16&255)/255*n,t[1]=(r>>8&255)/255*n,t[2]=(r&255)/255*n},toHexString([e,t,n],r=1){r=255/r;let a=e*r<<16^t*r<<8^n*r<<0;return i.toHexString(a)}},{isPrimitive:!1,match:e=>Object(e)===e,fromHexString(e,t,n=1){let r=i.fromHexString(e);t.r=(r>>16&255)/255*n,t.g=(r>>8&255)/255*n,t.b=(r&255)/255*n},toHexString({r:e,g:t,b:n},r=1){r=255/r;let a=e*r<<16^t*r<<8^n*r<<0;return i.toHexString(a)}}];function o(e){return a.find(t=>t.match(e))}var s=class extends e{constructor(e,t,r,i){super(e,t,r,`lil-color`),this.$input=document.createElement(`input`),this.$input.setAttribute(`type`,`color`),this.$input.setAttribute(`tabindex`,-1),this.$input.setAttribute(`aria-labelledby`,this.$name.id),this.$text=document.createElement(`input`),this.$text.setAttribute(`type`,`text`),this.$text.setAttribute(`spellcheck`,`false`),this.$text.setAttribute(`aria-labelledby`,this.$name.id),this.$display=document.createElement(`div`),this.$display.classList.add(`lil-display`),this.$display.appendChild(this.$input),this.$widget.appendChild(this.$display),this.$widget.appendChild(this.$text),this._format=o(this.initialValue),this._rgbScale=i,this._initialValueHexString=this.save(),this._textFocused=!1,this.$input.addEventListener(`input`,()=>{this._setValueFromHexString(this.$input.value)}),this.$input.addEventListener(`blur`,()=>{this._callOnFinishChange()}),this.$text.addEventListener(`input`,()=>{let e=n(this.$text.value);e&&this._setValueFromHexString(e)}),this.$text.addEventListener(`focus`,()=>{this._textFocused=!0,this.$text.select()}),this.$text.addEventListener(`blur`,()=>{this._textFocused=!1,this.updateDisplay(),this._callOnFinishChange()}),this.$disable=this.$text,this.updateDisplay()}reset(){return this._setValueFromHexString(this._initialValueHexString),this}_setValueFromHexString(e){if(this._format.isPrimitive){let t=this._format.fromHexString(e);this.setValue(t)}else this._format.fromHexString(e,this.getValue(),this._rgbScale),this._callOnChange(),this.updateDisplay()}save(){return this._format.toHexString(this.getValue(),this._rgbScale)}load(e){return this._setValueFromHexString(e),this._callOnFinishChange(),this}updateDisplay(){return this.$input.value=this._format.toHexString(this.getValue(),this._rgbScale),this._textFocused||(this.$text.value=this.$input.value.substring(1)),this.$display.style.backgroundColor=this.$input.value,this}},c=class extends e{constructor(e,t,n){super(e,t,n,`lil-function`),this.$button=document.createElement(`button`),this.$button.appendChild(this.$name),this.$widget.appendChild(this.$button),this.$button.addEventListener(`click`,e=>{e.preventDefault(),this.getValue().call(this.object),this._callOnChange()}),this.$button.addEventListener(`touchstart`,()=>{},{passive:!0}),this.$disable=this.$button}},l=class extends e{constructor(e,t,n,r,i,a){super(e,t,n,`lil-number`),this._initInput(),this.min(r),this.max(i);let o=a!==void 0;this.step(o?a:this._getImplicitStep(),o),this.updateDisplay()}decimals(e){return this._decimals=e,this.updateDisplay(),this}min(e){return this._min=e,this._onUpdateMinMax(),this}max(e){return this._max=e,this._onUpdateMinMax(),this}step(e,t=!0){return this._step=e,this._stepExplicit=t,this}updateDisplay(){let e=this.getValue();if(this._hasSlider){let t=(e-this._min)/(this._max-this._min);t=Math.max(0,Math.min(t,1)),this.$fill.style.width=t*100+`%`}return this._inputFocused||(this.$input.value=this._decimals===void 0?e:e.toFixed(this._decimals)),this}_initInput(){this.$input=document.createElement(`input`),this.$input.setAttribute(`type`,`text`),this.$input.setAttribute(`aria-labelledby`,this.$name.id),window.matchMedia(`(pointer: coarse)`).matches&&(this.$input.setAttribute(`type`,`number`),this.$input.setAttribute(`step`,`any`)),this.$widget.appendChild(this.$input),this.$disable=this.$input;let e=()=>{let e=parseFloat(this.$input.value);isNaN(e)||(this._stepExplicit&&(e=this._snap(e)),this.setValue(this._clamp(e)))},t=e=>{let t=parseFloat(this.$input.value);isNaN(t)||(this._snapClampSetValue(t+e),this.$input.value=this.getValue())},n=e=>{e.key===`Enter`&&this.$input.blur(),e.code===`ArrowUp`&&(e.preventDefault(),t(this._step*this._arrowKeyMultiplier(e))),e.code===`ArrowDown`&&(e.preventDefault(),t(this._step*this._arrowKeyMultiplier(e)*-1))},r=e=>{this._inputFocused&&(e.preventDefault(),t(this._step*this._normalizeMouseWheel(e)))},i=!1,a,o,s,c,l,u=e=>{a=e.clientX,o=s=e.clientY,i=!0,c=this.getValue(),l=0,window.addEventListener(`mousemove`,d),window.addEventListener(`mouseup`,f)},d=e=>{if(i){let t=e.clientX-a,n=e.clientY-o;Math.abs(n)>5?(e.preventDefault(),this.$input.blur(),i=!1,this._setDraggingStyle(!0,`vertical`)):Math.abs(t)>5&&f()}if(!i){let t=e.clientY-s;l-=t*this._step*this._arrowKeyMultiplier(e),c+l>this._max?l=this._max-c:c+l<this._min&&(l=this._min-c),this._snapClampSetValue(c+l)}s=e.clientY},f=()=>{this._setDraggingStyle(!1,`vertical`),this._callOnFinishChange(),window.removeEventListener(`mousemove`,d),window.removeEventListener(`mouseup`,f)};this.$input.addEventListener(`input`,e),this.$input.addEventListener(`keydown`,n),this.$input.addEventListener(`wheel`,r,{passive:!1}),this.$input.addEventListener(`mousedown`,u),this.$input.addEventListener(`focus`,()=>{this._inputFocused=!0}),this.$input.addEventListener(`blur`,()=>{this._inputFocused=!1,this.updateDisplay(),this._callOnFinishChange()})}_initSlider(){this._hasSlider=!0,this.$slider=document.createElement(`div`),this.$slider.classList.add(`lil-slider`),this.$fill=document.createElement(`div`),this.$fill.classList.add(`lil-fill`),this.$slider.appendChild(this.$fill),this.$widget.insertBefore(this.$slider,this.$input),this.domElement.classList.add(`lil-has-slider`);let e=(e,t,n,r,i)=>(e-t)/(n-t)*(i-r)+r,t=t=>{let n=this.$slider.getBoundingClientRect(),r=e(t,n.left,n.right,this._min,this._max);this._snapClampSetValue(r)},n=e=>{this._setDraggingStyle(!0),t(e.clientX),window.addEventListener(`mousemove`,r),window.addEventListener(`mouseup`,i)},r=e=>{t(e.clientX)},i=()=>{this._callOnFinishChange(),this._setDraggingStyle(!1),window.removeEventListener(`mousemove`,r),window.removeEventListener(`mouseup`,i)},a=!1,o,s,c=e=>{e.preventDefault(),this._setDraggingStyle(!0),t(e.touches[0].clientX),a=!1},l=e=>{e.touches.length>1||(this._hasScrollBar?(o=e.touches[0].clientX,s=e.touches[0].clientY,a=!0):c(e),window.addEventListener(`touchmove`,u,{passive:!1}),window.addEventListener(`touchend`,d))},u=e=>{if(a){let t=e.touches[0].clientX-o,n=e.touches[0].clientY-s;Math.abs(t)>Math.abs(n)?c(e):(window.removeEventListener(`touchmove`,u),window.removeEventListener(`touchend`,d))}else e.preventDefault(),t(e.touches[0].clientX)},d=()=>{this._callOnFinishChange(),this._setDraggingStyle(!1),window.removeEventListener(`touchmove`,u),window.removeEventListener(`touchend`,d)},f=this._callOnFinishChange.bind(this),p;this.$slider.addEventListener(`mousedown`,n),this.$slider.addEventListener(`touchstart`,l,{passive:!1}),this.$slider.addEventListener(`wheel`,e=>{if(Math.abs(e.deltaX)<Math.abs(e.deltaY)&&this._hasScrollBar)return;e.preventDefault();let t=this._normalizeMouseWheel(e)*this._step;this._snapClampSetValue(this.getValue()+t),this.$input.value=this.getValue(),clearTimeout(p),p=setTimeout(f,400)},{passive:!1})}_setDraggingStyle(e,t=`horizontal`){this.$slider&&this.$slider.classList.toggle(`lil-active`,e),document.body.classList.toggle(`lil-dragging`,e),document.body.classList.toggle(`lil-${t}`,e)}_getImplicitStep(){return this._hasMin&&this._hasMax?(this._max-this._min)/1e3:.1}_onUpdateMinMax(){!this._hasSlider&&this._hasMin&&this._hasMax&&(this._stepExplicit||this.step(this._getImplicitStep(),!1),this._initSlider(),this.updateDisplay())}_normalizeMouseWheel(e){let{deltaX:t,deltaY:n}=e;return Math.floor(e.deltaY)!==e.deltaY&&e.wheelDelta&&(t=0,n=-e.wheelDelta/120,n*=this._stepExplicit?1:10),t+-n}_arrowKeyMultiplier(e){let t=this._stepExplicit?1:10;return e.shiftKey?t*=10:e.altKey&&(t/=10),t}_snap(e){let t=0;return this._hasMin?t=this._min:this._hasMax&&(t=this._max),e-=t,e=Math.round(e/this._step)*this._step,e+=t,e=parseFloat(e.toPrecision(15)),e}_clamp(e){return e<this._min&&(e=this._min),e>this._max&&(e=this._max),e}_snapClampSetValue(e){this.setValue(this._clamp(this._snap(e)))}get _hasScrollBar(){let e=this.parent.root.$children;return e.scrollHeight>e.clientHeight}get _hasMin(){return this._min!==void 0}get _hasMax(){return this._max!==void 0}},u=class extends e{constructor(e,t,n,r){super(e,t,n,`lil-option`),this.$select=document.createElement(`select`),this.$select.setAttribute(`aria-labelledby`,this.$name.id),this.$display=document.createElement(`div`),this.$display.classList.add(`lil-display`),this.$select.addEventListener(`change`,()=>{this.setValue(this._values[this.$select.selectedIndex]),this._callOnFinishChange()}),this.$select.addEventListener(`focus`,()=>{this.$display.classList.add(`lil-focus`)}),this.$select.addEventListener(`blur`,()=>{this.$display.classList.remove(`lil-focus`)}),this.$widget.appendChild(this.$select),this.$widget.appendChild(this.$display),this.$disable=this.$select,this.options(r)}options(e){return this._values=Array.isArray(e)?e:Object.values(e),this._names=Array.isArray(e)?e:Object.keys(e),this.$select.replaceChildren(),this._names.forEach(e=>{let t=document.createElement(`option`);t.textContent=e,this.$select.appendChild(t)}),this.updateDisplay(),this}updateDisplay(){let e=this.getValue(),t=this._values.indexOf(e);return this.$select.selectedIndex=t,this.$display.textContent=t===-1?e:this._names[t],this}},d=class extends e{constructor(e,t,n){super(e,t,n,`lil-string`),this.$input=document.createElement(`input`),this.$input.setAttribute(`type`,`text`),this.$input.setAttribute(`spellcheck`,`false`),this.$input.setAttribute(`aria-labelledby`,this.$name.id),this.$input.addEventListener(`input`,()=>{this.setValue(this.$input.value)}),this.$input.addEventListener(`keydown`,e=>{e.code===`Enter`&&this.$input.blur()}),this.$input.addEventListener(`blur`,()=>{this._callOnFinishChange()}),this.$widget.appendChild(this.$input),this.$disable=this.$input,this.updateDisplay()}updateDisplay(){return this.$input.value=this.getValue(),this}},f=`.lil-gui {
  font-family: var(--font-family);
  font-size: var(--font-size);
  line-height: 1;
  font-weight: normal;
  font-style: normal;
  text-align: left;
  color: var(--text-color);
  user-select: none;
  -webkit-user-select: none;
  touch-action: manipulation;
  --background-color: #1f1f1f;
  --text-color: #ebebeb;
  --title-background-color: #111111;
  --title-text-color: #ebebeb;
  --widget-color: #424242;
  --hover-color: #4f4f4f;
  --focus-color: #595959;
  --number-color: #2cc9ff;
  --string-color: #a2db3c;
  --font-size: 11px;
  --input-font-size: 11px;
  --font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
  --font-family-mono: Menlo, Monaco, Consolas, "Droid Sans Mono", monospace;
  --padding: 4px;
  --spacing: 4px;
  --widget-height: 20px;
  --title-height: calc(var(--widget-height) + var(--spacing) * 1.25);
  --name-width: 45%;
  --slider-knob-width: 2px;
  --slider-input-width: 27%;
  --color-input-width: 27%;
  --slider-input-min-width: 45px;
  --color-input-min-width: 45px;
  --folder-indent: 7px;
  --widget-padding: 0 0 0 3px;
  --widget-border-radius: 2px;
  --checkbox-size: calc(0.75 * var(--widget-height));
  --scrollbar-width: 5px;
}
.lil-gui, .lil-gui * {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}
.lil-gui.lil-root {
  width: var(--width, 245px);
  display: flex;
  flex-direction: column;
  background: var(--background-color);
}
.lil-gui.lil-root > .lil-title {
  background: var(--title-background-color);
  color: var(--title-text-color);
}
.lil-gui.lil-root > .lil-children {
  overflow-x: hidden;
  overflow-y: auto;
}
.lil-gui.lil-root > .lil-children::-webkit-scrollbar {
  width: var(--scrollbar-width);
  height: var(--scrollbar-width);
  background: var(--background-color);
}
.lil-gui.lil-root > .lil-children::-webkit-scrollbar-thumb {
  border-radius: var(--scrollbar-width);
  background: var(--focus-color);
}
@media (pointer: coarse) {
  .lil-gui.lil-allow-touch-styles, .lil-gui.lil-allow-touch-styles .lil-gui {
    --widget-height: 28px;
    --padding: 6px;
    --spacing: 6px;
    --font-size: 13px;
    --input-font-size: 16px;
    --folder-indent: 10px;
    --scrollbar-width: 7px;
    --slider-input-min-width: 50px;
    --color-input-min-width: 65px;
  }
}
.lil-gui.lil-force-touch-styles, .lil-gui.lil-force-touch-styles .lil-gui {
  --widget-height: 28px;
  --padding: 6px;
  --spacing: 6px;
  --font-size: 13px;
  --input-font-size: 16px;
  --folder-indent: 10px;
  --scrollbar-width: 7px;
  --slider-input-min-width: 50px;
  --color-input-min-width: 65px;
}
.lil-gui.lil-auto-place, .lil-gui.autoPlace {
  max-height: 100%;
  position: fixed;
  top: 0;
  right: 15px;
  z-index: 1001;
}

.lil-controller {
  display: flex;
  align-items: center;
  padding: 0 var(--padding);
  margin: var(--spacing) 0;
}
.lil-controller.lil-disabled {
  opacity: 0.5;
}
.lil-controller.lil-disabled, .lil-controller.lil-disabled * {
  pointer-events: none !important;
}
.lil-controller > .lil-name {
  min-width: var(--name-width);
  flex-shrink: 0;
  white-space: pre;
  padding-right: var(--spacing);
  line-height: var(--widget-height);
}
.lil-controller .lil-widget {
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
  min-height: var(--widget-height);
}
.lil-controller.lil-string input {
  color: var(--string-color);
}
.lil-controller.lil-boolean {
  cursor: pointer;
}
.lil-controller.lil-color .lil-display {
  width: 100%;
  height: var(--widget-height);
  border-radius: var(--widget-border-radius);
  position: relative;
}
@media (hover: hover) {
  .lil-controller.lil-color .lil-display:hover:before {
    content: " ";
    display: block;
    position: absolute;
    border-radius: var(--widget-border-radius);
    border: 1px solid #fff9;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
  }
}
.lil-controller.lil-color input[type=color] {
  opacity: 0;
  width: 100%;
  height: 100%;
  cursor: pointer;
}
.lil-controller.lil-color input[type=text] {
  margin-left: var(--spacing);
  font-family: var(--font-family-mono);
  min-width: var(--color-input-min-width);
  width: var(--color-input-width);
  flex-shrink: 0;
}
.lil-controller.lil-option select {
  opacity: 0;
  position: absolute;
  width: 100%;
  max-width: 100%;
}
.lil-controller.lil-option .lil-display {
  position: relative;
  pointer-events: none;
  border-radius: var(--widget-border-radius);
  height: var(--widget-height);
  line-height: var(--widget-height);
  max-width: 100%;
  overflow: hidden;
  word-break: break-all;
  padding-left: 0.55em;
  padding-right: 1.75em;
  background: var(--widget-color);
}
@media (hover: hover) {
  .lil-controller.lil-option .lil-display.lil-focus {
    background: var(--focus-color);
  }
}
.lil-controller.lil-option .lil-display.lil-active {
  background: var(--focus-color);
}
.lil-controller.lil-option .lil-display:after {
  font-family: "lil-gui";
  content: "↕";
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  padding-right: 0.375em;
}
.lil-controller.lil-option .lil-widget,
.lil-controller.lil-option select {
  cursor: pointer;
}
@media (hover: hover) {
  .lil-controller.lil-option .lil-widget:hover .lil-display {
    background: var(--hover-color);
  }
}
.lil-controller.lil-number input {
  color: var(--number-color);
}
.lil-controller.lil-number.lil-has-slider input {
  margin-left: var(--spacing);
  width: var(--slider-input-width);
  min-width: var(--slider-input-min-width);
  flex-shrink: 0;
}
.lil-controller.lil-number .lil-slider {
  width: 100%;
  height: var(--widget-height);
  background: var(--widget-color);
  border-radius: var(--widget-border-radius);
  padding-right: var(--slider-knob-width);
  overflow: hidden;
  cursor: ew-resize;
  touch-action: pan-y;
}
@media (hover: hover) {
  .lil-controller.lil-number .lil-slider:hover {
    background: var(--hover-color);
  }
}
.lil-controller.lil-number .lil-slider.lil-active {
  background: var(--focus-color);
}
.lil-controller.lil-number .lil-slider.lil-active .lil-fill {
  opacity: 0.95;
}
.lil-controller.lil-number .lil-fill {
  height: 100%;
  border-right: var(--slider-knob-width) solid var(--number-color);
  box-sizing: content-box;
}

.lil-dragging .lil-gui {
  --hover-color: var(--widget-color);
}
.lil-dragging * {
  cursor: ew-resize !important;
}
.lil-dragging.lil-vertical * {
  cursor: ns-resize !important;
}

.lil-gui .lil-title {
  height: var(--title-height);
  font-weight: 600;
  padding: 0 var(--padding);
  width: 100%;
  text-align: left;
  background: none;
  text-decoration-skip: objects;
}
.lil-gui .lil-title:before {
  font-family: "lil-gui";
  content: "▾";
  padding-right: 2px;
  display: inline-block;
}
.lil-gui .lil-title:active {
  background: var(--title-background-color);
  opacity: 0.75;
}
@media (hover: hover) {
  body:not(.lil-dragging) .lil-gui .lil-title:hover {
    background: var(--title-background-color);
    opacity: 0.85;
  }
  .lil-gui .lil-title:focus {
    text-decoration: underline var(--focus-color);
  }
}
.lil-gui.lil-root > .lil-title:focus {
  text-decoration: none !important;
}
.lil-gui.lil-closed > .lil-title:before {
  content: "▸";
}
.lil-gui.lil-closed > .lil-children {
  transform: translateY(-7px);
  opacity: 0;
}
.lil-gui.lil-closed:not(.lil-transition) > .lil-children {
  display: none;
}
.lil-gui.lil-transition > .lil-children {
  transition-duration: 300ms;
  transition-property: height, opacity, transform;
  transition-timing-function: cubic-bezier(0.2, 0.6, 0.35, 1);
  overflow: hidden;
  pointer-events: none;
}
.lil-gui .lil-children:empty:before {
  content: "Empty";
  padding: 0 var(--padding);
  margin: var(--spacing) 0;
  display: block;
  height: var(--widget-height);
  font-style: italic;
  line-height: var(--widget-height);
  opacity: 0.5;
}
.lil-gui.lil-root > .lil-children > .lil-gui > .lil-title {
  border: 0 solid var(--widget-color);
  border-width: 1px 0;
  transition: border-color 300ms;
}
.lil-gui.lil-root > .lil-children > .lil-gui.lil-closed > .lil-title {
  border-bottom-color: transparent;
}
.lil-gui + .lil-controller {
  border-top: 1px solid var(--widget-color);
  margin-top: 0;
  padding-top: var(--spacing);
}
.lil-gui .lil-gui .lil-gui > .lil-title {
  border: none;
}
.lil-gui .lil-gui .lil-gui > .lil-children {
  border: none;
  margin-left: var(--folder-indent);
  border-left: 2px solid var(--widget-color);
}
.lil-gui .lil-gui .lil-controller {
  border: none;
}

.lil-gui label, .lil-gui input, .lil-gui button {
  -webkit-tap-highlight-color: transparent;
}
.lil-gui input {
  border: 0;
  outline: none;
  font-family: var(--font-family);
  font-size: var(--input-font-size);
  border-radius: var(--widget-border-radius);
  height: var(--widget-height);
  background: var(--widget-color);
  color: var(--text-color);
  width: 100%;
}
@media (hover: hover) {
  .lil-gui input:hover {
    background: var(--hover-color);
  }
  .lil-gui input:active {
    background: var(--focus-color);
  }
}
.lil-gui input:disabled {
  opacity: 1;
}
.lil-gui input[type=text],
.lil-gui input[type=number] {
  padding: var(--widget-padding);
  -moz-appearance: textfield;
}
.lil-gui input[type=text]:focus,
.lil-gui input[type=number]:focus {
  background: var(--focus-color);
}
.lil-gui input[type=checkbox] {
  appearance: none;
  width: var(--checkbox-size);
  height: var(--checkbox-size);
  border-radius: var(--widget-border-radius);
  text-align: center;
  cursor: pointer;
}
.lil-gui input[type=checkbox]:checked:before {
  font-family: "lil-gui";
  content: "✓";
  font-size: var(--checkbox-size);
  line-height: var(--checkbox-size);
}
@media (hover: hover) {
  .lil-gui input[type=checkbox]:focus {
    box-shadow: inset 0 0 0 1px var(--focus-color);
  }
}
.lil-gui button {
  outline: none;
  cursor: pointer;
  font-family: var(--font-family);
  font-size: var(--font-size);
  color: var(--text-color);
  width: 100%;
  border: none;
}
.lil-gui .lil-controller button {
  height: var(--widget-height);
  text-transform: none;
  background: var(--widget-color);
  border-radius: var(--widget-border-radius);
}
@media (hover: hover) {
  .lil-gui .lil-controller button:hover {
    background: var(--hover-color);
  }
  .lil-gui .lil-controller button:focus {
    box-shadow: inset 0 0 0 1px var(--focus-color);
  }
}
.lil-gui .lil-controller button:active {
  background: var(--focus-color);
}

@font-face {
  font-family: "lil-gui";
  src: url("data:application/font-woff2;charset=utf-8;base64,d09GMgABAAAAAALkAAsAAAAABtQAAAKVAAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAHFQGYACDMgqBBIEbATYCJAMUCwwABCAFhAoHgQQbHAbIDiUFEYVARAAAYQTVWNmz9MxhEgodq49wYRUFKE8GWNiUBxI2LBRaVnc51U83Gmhs0Q7JXWMiz5eteLwrKwuxHO8VFxUX9UpZBs6pa5ABRwHA+t3UxUnH20EvVknRerzQgX6xC/GH6ZUvTcAjAv122dF28OTqCXrPuyaDER30YBA1xnkVutDDo4oCi71Ca7rrV9xS8dZHbPHefsuwIyCpmT7j+MnjAH5X3984UZoFFuJ0yiZ4XEJFxjagEBeqs+e1iyK8Xf/nOuwF+vVK0ur765+vf7txotUi0m3N0m/84RGSrBCNrh8Ee5GjODjF4gnWP+dJrH/Lk9k4oT6d+gr6g/wssA2j64JJGP6cmx554vUZnpZfn6ZfX2bMwPPrlANsB86/DiHjhl0OP+c87+gaJo/gY084s3HoYL/ZkWHTRfBXvvoHnnkHvngKun4KBE/ede7tvq3/vQOxDXB1/fdNz6XbPdcr0Vhpojj9dG+owuSKFsslCi1tgEjirjXdwMiov2EioadxmqTHUCIwo8NgQaeIasAi0fTYSPTbSmwbMOFduyh9wvBrESGY0MtgRjtgQR8Q1bRPohn2UoCRZf9wyYANMXFeJTysqAe0I4mrherOekFdKMrYvJjLvOIUM9SuwYB5DVZUwwVjJJOaUnZCmcEkIZZrKqNvRGRMvmFZsmhP4VMKCSXBhSqUBxgMS7h0cZvEd71AWkEhGWaeMFcNnpqyJkyXgYL7PQ1MoSq0wDAkRtJIijkZSmqYTiSImfLiSWXIZwhRh3Rug2X0kk1Dgj+Iu43u5p98ghopcpSo0Uyc8SnjlYX59WUeaMoDqmVD2TOWD9a4pCRAzf2ECgwGcrHjPOWY9bNxq/OL3I/QjwEAAAA=") format("woff2");
}`;function p(e){let t=document.createElement(`style`);t.innerHTML=e;let n=document.querySelector(`head link[rel=stylesheet], head style`);n?document.head.insertBefore(t,n):document.head.appendChild(t)}var m=!1,ee=class e{constructor({parent:e,autoPlace:t=e===void 0,container:n,width:r,title:i=`Controls`,closeFolders:a=!1,injectStyles:o=!0,touchStyles:s=!0}={}){if(this.parent=e,this.root=e?e.root:this,this.children=[],this.controllers=[],this.folders=[],this._closed=!1,this._hidden=!1,this.domElement=document.createElement(`div`),this.domElement.classList.add(`lil-gui`),this.$title=document.createElement(`button`),this.$title.classList.add(`lil-title`),this.$title.setAttribute(`aria-expanded`,!0),this.$title.addEventListener(`click`,()=>this.openAnimated(this._closed)),this.$title.addEventListener(`touchstart`,()=>{},{passive:!0}),this.$children=document.createElement(`div`),this.$children.classList.add(`lil-children`),this.domElement.appendChild(this.$title),this.domElement.appendChild(this.$children),this.title(i),this.parent){this.parent.children.push(this),this.parent.folders.push(this),this.parent.$children.appendChild(this.domElement);return}this.domElement.classList.add(`lil-root`),s&&this.domElement.classList.add(`lil-allow-touch-styles`),!m&&o&&(p(f),m=!0),n?n.appendChild(this.domElement):t&&(this.domElement.classList.add(`lil-auto-place`,`autoPlace`),document.body.appendChild(this.domElement)),r&&this.domElement.style.setProperty(`--width`,r+`px`),this._closeFolders=a}add(e,n,r,i,a){if(Object(r)===r)return new u(this,e,n,r);let o=e[n];switch(typeof o){case`number`:return new l(this,e,n,r,i,a);case`boolean`:return new t(this,e,n);case`string`:return new d(this,e,n);case`function`:return new c(this,e,n)}console.error(`gui.add failed
	property:`,n,`
	object:`,e,`
	value:`,o)}addColor(e,t,n=1){return new s(this,e,t,n)}addFolder(t){let n=new e({parent:this,title:t});return this.root._closeFolders&&n.close(),n}load(e,t=!0){return e.controllers&&this.controllers.forEach(t=>{t instanceof c||t._name in e.controllers&&t.load(e.controllers[t._name])}),t&&e.folders&&this.folders.forEach(t=>{t._title in e.folders&&t.load(e.folders[t._title])}),this}save(e=!0){let t={controllers:{},folders:{}};return this.controllers.forEach(e=>{if(!(e instanceof c)){if(e._name in t.controllers)throw Error(`Cannot save GUI with duplicate property "${e._name}"`);t.controllers[e._name]=e.save()}}),e&&this.folders.forEach(e=>{if(e._title in t.folders)throw Error(`Cannot save GUI with duplicate folder "${e._title}"`);t.folders[e._title]=e.save()}),t}open(e=!0){return this._setClosed(!e),this.$title.setAttribute(`aria-expanded`,!this._closed),this.domElement.classList.toggle(`lil-closed`,this._closed),this}close(){return this.open(!1)}_setClosed(e){this._closed!==e&&(this._closed=e,this._callOnOpenClose(this))}show(e=!0){return this._hidden=!e,this.domElement.style.display=this._hidden?`none`:``,this}hide(){return this.show(!1)}openAnimated(e=!0){return this._setClosed(!e),this.$title.setAttribute(`aria-expanded`,!this._closed),requestAnimationFrame(()=>{let t=this.$children.clientHeight;this.$children.style.height=t+`px`,this.domElement.classList.add(`lil-transition`);let n=e=>{e.target===this.$children&&(this.$children.style.height=``,this.domElement.classList.remove(`lil-transition`),this.$children.removeEventListener(`transitionend`,n))};this.$children.addEventListener(`transitionend`,n);let r=e?this.$children.scrollHeight:0;this.domElement.classList.toggle(`lil-closed`,!e),requestAnimationFrame(()=>{this.$children.style.height=r+`px`})}),this}title(e){return this._title=e,this.$title.textContent=e,this}reset(e=!0){return(e?this.controllersRecursive():this.controllers).forEach(e=>e.reset()),this}onChange(e){return this._onChange=e,this}_callOnChange(e){this.parent&&this.parent._callOnChange(e),this._onChange!==void 0&&this._onChange.call(this,{object:e.object,property:e.property,value:e.getValue(),controller:e})}onFinishChange(e){return this._onFinishChange=e,this}_callOnFinishChange(e){this.parent&&this.parent._callOnFinishChange(e),this._onFinishChange!==void 0&&this._onFinishChange.call(this,{object:e.object,property:e.property,value:e.getValue(),controller:e})}onOpenClose(e){return this._onOpenClose=e,this}_callOnOpenClose(e){this.parent&&this.parent._callOnOpenClose(e),this._onOpenClose!==void 0&&this._onOpenClose.call(this,e)}destroy(){this.parent&&(this.parent.children.splice(this.parent.children.indexOf(this),1),this.parent.folders.splice(this.parent.folders.indexOf(this),1)),this.domElement.parentElement&&this.domElement.parentElement.removeChild(this.domElement),Array.from(this.children).forEach(e=>e.destroy())}controllersRecursive(){let e=Array.from(this.controllers);return this.folders.forEach(t=>{e=e.concat(t.controllersRecursive())}),e}foldersRecursive(){let e=Array.from(this.folders);return this.folders.forEach(t=>{e=e.concat(t.foldersRecursive())}),e}},h=document.getElementById(`canvas`),g=h.getContext(`2d`),te=document.getElementById(`file-input`),ne=document.getElementById(`upload-btn`),re=document.getElementById(`export-btn`),_=document.getElementById(`hint`),ie=document.getElementById(`info-fps`),v=document.getElementById(`info-char-count`),y=document.createElement(`canvas`),ae=y.getContext(`2d`),b=document.createElement(`canvas`),x=b.getContext(`2d`),S=document.createElement(`canvas`),C=S.getContext(`2d`),w=document.createElement(`canvas`),T=w.getContext(`2d`),E=null,D=null,O=!1,oe=0,k=!1,se=!0,A=0,j=0,M=!1,ce=!1,le={},ue={完整:`@%#*+=-:. `,密集:`@%#*`,稀疏:`*+=-:. `,方块:`█▓▒░ `,点阵:`●◐◗▪ `},de=[[0,8,2,10],[12,4,14,6],[3,11,1,9],[15,7,13,5]],fe=[`#ff4444`,`#44cc44`,`#4488ff`,`#ffaa00`,`#cc44ff`,`#44dddd`],pe={原始画面:`original`,"ASCII 艺术":`ascii`,边缘检测:`edge`,像素风:`pixelate`,有序抖动:`dither`,半色调:`halftone`},N={media:null,isVideo:!1,style:`ascii`,density:6,edgeThreshold:.1,bgColor:`#000000`,textColor:`#ffffff`,mouseX:window.innerWidth/2,mouseY:window.innerHeight/2,asciiCharset:`完整`,asciiInvert:!1,asciiColor:!1,halftoneColor:!1,showBorders:!1,activeViewport:0,viewports:[{x:window.innerWidth/2,y:window.innerHeight/2,size:160,style:`original`,styleParams:{asciiCharset:`完整`,asciiInvert:!1,asciiColor:!1,halftoneColor:!1},subjectMatting:!1}],playbackPlaying:!1,playbackTime:0,playbackSpeed:1,isRecording:!1,subjectMatting:!1,maskBrushSize:20},P=[],F,me={TOL:7},I={active:!1,mode:null,vpIndex:-1,edge:null,startX:0,startY:0,startVpX:0,startVpY:0,startSize:0};function he(e){return{w:e.videoWidth||e.naturalWidth||e.width||0,h:e.videoHeight||e.naturalHeight||e.height||0}}function ge(e,t,n,r){let i=Math.max(e/n,t/r),a=n*i,o=r*i;return{x:(e-a)/2,y:(t-o)/2,w:a,h:o}}function _e(e){let t=e.size/2;return{x:e.x-t,y:e.y-t,w:e.size,h:e.size}}function ve(){let{media:e}=N;if(!e)return null;let{w:t,h:n}=he(e);return!t||!n?null:ge(h.width,h.height,t,n)}function ye(e,t){let n=N.viewports,r=me.TOL*2;for(let i=n.length-1;i>=0;i--){let a=_e(n[i]),o=Math.abs(e-a.x)<r,s=Math.abs(e-(a.x+a.w))<r,c=Math.abs(t-a.y)<r,l=Math.abs(t-(a.y+a.h))<r,u=t>=a.y-r&&t<=a.y+a.h+r,d=e>=a.x-r&&e<=a.x+a.w+r;if(o&&c)return{i,edge:`nw`};if(s&&c)return{i,edge:`ne`};if(o&&l)return{i,edge:`sw`};if(s&&l)return{i,edge:`se`};if(u&&o)return{i,edge:`w`};if(u&&s)return{i,edge:`e`};if(d&&c)return{i,edge:`n`};if(d&&l)return{i,edge:`s`};if(e>=a.x&&e<=a.x+a.w&&t>=a.y&&t<=a.y+a.h)return{i,edge:`inside`}}return null}function be(e){return e?e===`inside`?`grab`:{n:`n-resize`,s:`s-resize`,w:`w-resize`,e:`e-resize`,nw:`nw-resize`,ne:`ne-resize`,sw:`sw-resize`,se:`se-resize`}[e]||`crosshair`:`crosshair`}function xe(){z[N.style===`ascii`?`show`:`hide`](),we[N.style===`halftone`?`show`:`hide`]()}var L=new ee({title:`控制面板`}),Se=L.addFolder(`样式设置`);Se.add(N,`style`,pe).name(`全局样式`).onChange(()=>{xe(),N.isVideo||(J=!0)}),Se.add(N,`subjectMatting`).name(`主体抠图`).onChange(()=>{N.subjectMatting&&(Je(),E||K()),N.isVideo||(J=!0)}),Se.open();var R=L.addFolder(`蒙版编辑`);R.add(N,`maskBrushSize`,5,100,1).name(`画笔大小`);var Ce={expand:()=>Xe(1,`expand`),shrink:()=>Xe(1,`shrink`),reset:()=>{E=null,Je(),K(),J=!0}};R.add(Ce,`expand`).name(`➕ 扩展蒙版`),R.add(Ce,`shrink`).name(`➖ 收缩蒙版`),R.add(Ce,`reset`).name(`↺ 重置蒙版`),R.hide();var z=L.addFolder(`ASCII 选项`);z.add(N,`asciiCharset`,Object.keys(ue)).name(`字符集`).onChange(()=>{N.isVideo||(J=!0)}),z.add(N,`asciiInvert`).name(`反转亮度`).onChange(()=>{N.isVideo||(J=!0)}),z.add(N,`asciiColor`).name(`彩色字符`).onChange(()=>{N.isVideo||(J=!0)}),z.open();var we=L.addFolder(`半色调选项`);we.add(N,`halftoneColor`).name(`彩色模式`).onChange(()=>{N.isVideo||(J=!0)}),we.open();var B=L.addFolder(`视频控制`),Te,V,H,Ee=1/30;Te=B.add(N,`playbackTime`,0,1,.001).name(`进度`).onChange(e=>{let t=N.media;t&&N.isVideo&&t.duration&&(t.currentTime=e*t.duration)}),B.add(N,`playbackSpeed`,[.25,.5,1,1.5,2]).name(`速度`).onChange(e=>{N.media&&N.isVideo&&(N.media.playbackRate=e)});var De={play:()=>{let e=N.media;e&&N.isVideo&&e.play()},pause:()=>{let e=N.media;e&&N.isVideo&&e.pause()}};V=B.add(De,`play`).name(`▶ 播放`),H=B.add(De,`pause`).name(`⏸ 暂停`),H.hide();var Oe={prevFrame:()=>U(-1),nextFrame:()=>U(1)};B.add(Oe,`prevFrame`).name(`⏮ 上一帧`),B.add(Oe,`nextFrame`).name(`⏭ 下一帧`);function U(e){let t=N.media;!t||!N.isVideo||(t.pause(),t.currentTime=Math.max(0,Math.min(t.duration||0,t.currentTime+e*Ee)))}var ke={start:()=>Ze(),stop:()=>Qe()};B.add(ke,`start`).name(`⏺ 录制`),B.add(ke,`stop`).name(`⏹ 停止`),B.hide();var W=L.addFolder(`多视窗管理`);F=W.add(N,`activeViewport`,0,0,1).name(`当前编辑`).onChange(()=>{N.isVideo||(J=!0)}),W.add({addViewport:()=>{let e=N.viewports.length,t=N.viewports[0];N.viewports.push({x:t.x+(e%3-1)*180,y:t.y+Math.floor(e/3)*180+60,size:120,style:`original`,styleParams:{asciiCharset:`完整`,asciiInvert:!1,asciiColor:!1,halftoneColor:!1},subjectMatting:!1}),je(e),N.isVideo||(J=!0)}},`addViewport`).name(`＋ 添加视窗`),W.add(N,`showBorders`).name(`显示边框`);var G=L.addFolder(`渲染参数`);G.add(N,`density`,2,20,1).name(`采样密度`).onChange(()=>{N.isVideo||(J=!0)}),G.add(N,`edgeThreshold`,.02,.5,.01).name(`边缘阈值`).onChange(()=>{N.isVideo||(J=!0)}),G.addColor(N,`bgColor`).name(`背景颜色`).onChange(()=>{N.isVideo||(J=!0)}),G.addColor(N,`textColor`).name(`前景颜色`).onChange(()=>{N.isVideo||(J=!0)}),G.open();function Ae(e){let t=P[e];if(!t)return;let{ctrls:n}=t,r=N.viewports[e]?.style;r&&(n.asciiCharset[r===`ascii`?`show`:`hide`](),n.asciiInvert[r===`ascii`?`show`:`hide`](),n.asciiColor[r===`ascii`?`show`:`hide`](),n.halftoneColor[r===`halftone`?`show`:`hide`]())}function je(e){let t=N.viewports[e],n=W.addFolder(`视窗 ${e+1}`),r={style:n.add(t,`style`,pe).name(`视窗样式`).onChange(()=>{Ae(e),N.isVideo||(J=!0)}),x:n.add(t,`x`,0,9999,1).name(`X`).onChange(()=>{N.isVideo||(J=!0)}),y:n.add(t,`y`,0,9999,1).name(`Y`).onChange(()=>{N.isVideo||(J=!0)}),size:n.add(t,`size`,20,800,1).name(`大小`).onChange(()=>{N.isVideo||(J=!0)}),subjectMatting:n.add(t,`subjectMatting`).name(`主体抠图`).onChange(()=>{N.isVideo||(J=!0)})},i=t.styleParams;r.asciiCharset=n.add(i,`asciiCharset`,Object.keys(ue)).name(`字符集`).onChange(()=>{N.isVideo||(J=!0)}),r.asciiInvert=n.add(i,`asciiInvert`).name(`反转亮度`).onChange(()=>{N.isVideo||(J=!0)}),r.asciiColor=n.add(i,`asciiColor`).name(`彩色字符`).onChange(()=>{N.isVideo||(J=!0)}),r.halftoneColor=n.add(i,`halftoneColor`).name(`彩色模式`).onChange(()=>{N.isVideo||(J=!0)}),r.remove=n.add({fn:()=>Me(e)},`fn`).name(`✕ 删除视窗`),P.push({folder:n,ctrls:r}),Ae(e),F&&(F.max(N.viewports.length-1),F.updateDisplay()),n.open()}function Me(e){if(N.viewports.length<=1){let e=N.viewports[0];e.x=window.innerWidth/2,e.y=window.innerHeight/2,e.size=160,e.style=`original`,e.subjectMatting=!1,Object.assign(e.styleParams,{asciiCharset:`完整`,asciiInvert:!1,asciiColor:!1,halftoneColor:!1});let t=P[0];t&&(t.ctrls.x.updateDisplay(),t.ctrls.y.updateDisplay(),t.ctrls.size.updateDisplay(),t.ctrls.style.updateDisplay(),t.ctrls.subjectMatting&&t.ctrls.subjectMatting.updateDisplay(),Ae(0)),N.isVideo||(J=!0);return}N.viewports.splice(e,1),P[e].folder.domElement.remove(),P.splice(e,1),N.activeViewport>=N.viewports.length&&(N.activeViewport=N.viewports.length-1),F&&(F.max(N.viewports.length-1),F.updateDisplay()),N.isVideo||(J=!0)}je(0),xe();function Ne(){h.width=window.innerWidth,h.height=window.innerHeight,b.width=h.width,b.height=h.height,S.width=h.width,S.height=h.height,w.width=h.width,w.height=h.height,N.media&&!N.isVideo&&(J=!0)}Ne(),window.addEventListener(`resize`,Ne),ne.addEventListener(`click`,()=>te.click()),te.addEventListener(`change`,e=>{let t=e.target.files[0];if(!t)return;let n=()=>{_.innerHTML=`<p>加载失败，请重试</p>`,_.className=`hint-visible`};if(t.type.startsWith(`video/`)){N.isRecording&&Qe(),E=null,R.hide();let e=document.createElement(`video`);e.src=URL.createObjectURL(t),e.muted=!0,e.loop=!0,e.playsInline=!0,e.addEventListener(`error`,n),e.addEventListener(`loadedmetadata`,()=>{N.media=e,N.isVideo=!0,N.playbackTime=0,N.playbackSpeed=1,_.className=`hint-hidden`,B.show(),e.play().catch(n)}),e.addEventListener(`play`,()=>{N.playbackPlaying=!0,V&&V.hide(),H&&H.show()}),e.addEventListener(`pause`,()=>{N.playbackPlaying=!1,V&&V.show(),H&&H.hide()}),e.addEventListener(`timeupdate`,()=>{e.duration&&(N.playbackTime=e.currentTime/e.duration,Te&&Te.updateDisplay())}),e.addEventListener(`ended`,()=>{N.playbackPlaying=!1,V&&V.show(),H&&H.hide(),N.isRecording&&Qe()})}else{E=null,R.hide();let e=new Image;e.src=URL.createObjectURL(t),e.addEventListener(`error`,n),e.addEventListener(`load`,()=>{N.media=e,N.isVideo=!1,B.hide(),_.className=`hint-hidden`,J=!0})}});function Pe(e){let t=e.clientX,n=e.clientY;if(N.mouseX=t,N.mouseY=n,E&&(e.shiftKey||e.ctrlKey||e.metaKey)){e.preventDefault(),k=!0,se=e.shiftKey,A=t,j=n,Ye(t,n,e.shiftKey),J=!0;return}if(!N.media)return;let r=ye(t,n);if(!r){N.activeViewport=-1;return}N.activeViewport=r.i,F&&F.updateDisplay();let i=N.viewports[r.i];r.edge===`inside`?(I.active=!0,I.mode=`move`,I.vpIndex=r.i,I.startX=t,I.startY=n,I.startVpX=i.x,I.startVpY=i.y):(I.active=!0,I.mode=`resize`,I.vpIndex=r.i,I.edge=r.edge,I.startX=t,I.startY=n,I.startVpX=i.x,I.startVpY=i.y,I.startSize=i.size)}function Fe(e){let t=e.clientX,n=e.clientY;if(N.mouseX=t,N.mouseY=n,k&&E){let e=Math.hypot(t-A,n-j),r=Math.max(1,Math.ceil(e/(N.maskBrushSize*.5)));for(let e=0;e<=r;e++){let i=e/r;Ye(A+(t-A)*i,j+(n-j)*i,se)}A=t,j=n,J=!0;return}if(I.active&&I.mode){let e=N.viewports[I.vpIndex];if(!e){I.active=!1;return}if(N.isVideo||(J=!0),I.mode===`move`)e.x=Math.round(Math.max(0,I.startVpX+t-I.startX)),e.y=Math.round(Math.max(0,I.startVpY+n-I.startY));else{let r=t-I.startX,i=n-I.startY,a=0,o=I.edge;o.includes(`e`)&&(a=r),o.includes(`w`)&&(a=Math.max(a,-r)),o.includes(`s`)&&(a=Math.max(a,i)),o.includes(`n`)&&(a=Math.max(a,-i));let s=Math.max(20,Math.round(I.startSize+a)),c=s-I.startSize;e.size=s,(o.includes(`e`)||o.includes(`w`))&&(e.x=Math.round(I.startVpX+c/2)),(o.includes(`s`)||o.includes(`n`))&&(e.y=Math.round(I.startVpY+c/2))}let r=P[I.vpIndex];r&&(r.ctrls.x&&r.ctrls.x.updateDisplay(),r.ctrls.y&&r.ctrls.y.updateDisplay(),r.ctrls.size&&r.ctrls.size.updateDisplay());return}if(N.mouseX=t,N.mouseY=n,N.media){let e=ye(t,n);e&&e.edge===`inside`&&N.activeViewport>=0?h.style.cursor=N.viewports.length?`grab`:`crosshair`:h.style.cursor=e?be(e.edge):`crosshair`}else h.style.cursor=`crosshair`}function Ie(){if(k){k=!1,h.style.cursor=`crosshair`,J=!0;return}I.active&&I.mode&&(J=!0),I.active=!1,I.mode=null,I.vpIndex=-1,I.edge=null,h.style.cursor=`crosshair`}h.addEventListener(`pointerdown`,Pe),h.addEventListener(`pointermove`,Fe),window.addEventListener(`pointerup`,Ie),document.addEventListener(`keydown`,e=>{e.key===`Shift`&&(M=!0),(e.key===`Control`||e.key===`Meta`)&&(ce=!0);let t=N.media;!t||!N.isVideo||(e.key===` `||e.key===`Space`?(e.preventDefault(),t.paused?t.play():t.pause()):e.key===`ArrowLeft`?(e.preventDefault(),U(-1)):e.key===`ArrowRight`&&(e.preventDefault(),U(1)))}),document.addEventListener(`keyup`,e=>{e.key===`Shift`&&(M=!1),(e.key===`Control`||e.key===`Meta`)&&(ce=!1)});function Le(){let{media:e}=N;if(!e)return;let t=h.width,n=h.height;(y.width!==t||y.height!==n)&&(y.width=t,y.height=n),ae.clearRect(0,0,t,n);let{w:r,h:i}=he(e);if(!r||!i)return;let a=ge(t,n,r,i);ae.drawImage(e,a.x,a.y,a.w,a.h)}function Re(){return ae.getImageData(0,0,y.width,y.height)}function ze(e,t,n={}){let{width:r,height:i,data:a}=e,o=N.density,s=ue[n.asciiCharset||N.asciiCharset],c=s.length,l=n.asciiInvert===void 0?N.asciiInvert:n.asciiInvert,u=n.asciiColor===void 0?N.asciiColor:n.asciiColor;if(t.fillStyle=N.bgColor,t.fillRect(0,0,h.width,h.height),t.font=`${o*1.15}px "Courier New", "Noto Sans Mono", monospace`,t.textAlign=`center`,t.textBaseline=`middle`,v.textContent=`字符: ${Math.ceil(r/o)*Math.ceil(i/o)}`,u)for(let e=0;e<i;e+=o)for(let n=0;n<r;n+=o){let i=(e*r+n)*4,u=a[i],d=a[i+1],f=a[i+2],p=Math.floor((u*.299+d*.587+f*.114)/255*(c-1));l&&(p=c-1-p),p=Math.max(0,Math.min(c-1,p)),t.fillStyle=`rgb(${u},${d},${f})`,t.fillText(s[p],n+o/2,e+o/2)}else{t.fillStyle=N.textColor;for(let e=0;e<i;e+=o)for(let n=0;n<r;n+=o){let i=(e*r+n)*4,u=Math.floor((a[i]*.299+a[i+1]*.587+a[i+2]*.114)/255*(c-1));l&&(u=c-1-u),u=Math.max(0,Math.min(c-1,u)),t.fillText(s[u],n+o/2,e+o/2)}}}function Be(e,t){let{width:n,height:r,data:i}=e,a=N.density;t.fillStyle=N.bgColor,t.fillRect(0,0,h.width,h.height);let o=Math.ceil(n/a),s=Math.ceil(r/a),c=new Float32Array(o*s);for(let e=0;e<s;e++){let t=Math.min(e*a+(a>>1),r-1),s=e*o;for(let e=0;e<o;e++){let r=Math.min(e*a+(a>>1),n-1),o=(t*n+r)*4;c[s+e]=i[o]*.299+i[o+1]*.587+i[o+2]*.114}}let l=[-1,0,1,-2,0,2,-1,0,1],u=[-1,-2,-1,0,0,0,1,2,1];t.fillStyle=N.textColor;let d=0;for(let e=1;e<s-1;e++){e*o;for(let n=1;n<o-1;n++){let r=0,i=0,s=0;for(let t=-1;t<=1;t++){let a=(e+t)*o;for(let e=-1;e<=1;e++){let t=c[a+(n+e)];r+=t*l[s],i+=t*u[s],s++}}Math.sqrt(r*r+i*i)/255>N.edgeThreshold&&(t.fillRect(n*a,e*a,a,a),d++)}}v.textContent=`边缘区块: ${d}`}function Ve(e,t){let{width:n,height:r,data:i}=e,a=N.density;t.fillStyle=N.bgColor,t.fillRect(0,0,h.width,h.height);let o=0;for(let e=0;e<r;e+=a)for(let r=0;r<n;r+=a){let s=(e*n+r)*4;t.fillStyle=`rgb(${i[s]},${i[s+1]},${i[s+2]})`,t.fillRect(r,e,a,a),o++}v.textContent=`像素块: ${o}`}function He(e,t){let{width:n,height:r,data:i}=e,a=N.density;t.fillStyle=N.bgColor,t.fillRect(0,0,h.width,h.height);let o=Math.ceil(n/a),s=Math.ceil(r/a);t.fillStyle=N.textColor;let c=0;for(let e=0;e<s;e++){let s=Math.min(e*a+(a>>1),r-1);for(let r=0;r<o;r++){let o=Math.min(r*a+(a>>1),n-1),l=(s*n+o)*4;(i[l]*.299+i[l+1]*.587+i[l+2]*.114)/255>(de[e&3][r&3]+.5)/16&&(t.fillRect(r*a,e*a,a,a),c++)}}v.textContent=`抖动像素: ${c}`}function Ue(e,t,n={}){let{width:r,height:i,data:a}=e,o=N.density;t.fillStyle=N.bgColor,t.fillRect(0,0,h.width,h.height);let s=Math.ceil(r/o),c=Math.ceil(i/o),l=o/2;for(let e=0;e<c;e++){let c=Math.min(e*o+(o>>1),i-1);for(let i=0;i<s;i++){let s=Math.min(i*o+(o>>1),r-1),u=(c*r+s)*4,d=a[u],f=a[u+1],p=a[u+2],m=(1-(d*.299+f*.587+p*.114)/255)*l;m>.5&&(t.fillStyle=(n.halftoneColor===void 0?N.halftoneColor:n.halftoneColor)?`rgb(${d},${f},${p})`:N.textColor,t.beginPath(),t.arc(i*o+l,e*o+l,m,0,Math.PI*2),t.fill())}}v.textContent=`半色调点: ${s*c}`}function We(e,t,n,r={}){switch(e){case`ascii`:ze(t,n,r);break;case`edge`:Be(t,n);break;case`pixelate`:Ve(t,n);break;case`dither`:He(t,n);break;case`halftone`:Ue(t,n,r);break}}function Ge(e,t,n={}){if(e===`original`)return null;let r=le[e];if(!r){let t=document.createElement(`canvas`);r={canvas:t,ctx:t.getContext(`2d`)},le[e]=r}return(r.canvas.width!==h.width||r.canvas.height!==h.height)&&(r.canvas.width=h.width,r.canvas.height=h.height),We(e,t,r.ctx,n),r.canvas}function Ke(e){let t=ve();t&&e.drawImage(N.media,t.x,t.y,t.w,t.h)}function qe(e,t){let n=_e(e),r=N.viewports.indexOf(e),i=fe[Math.max(0,r)%fe.length];if(g.save(),t?(g.fillStyle=i+`15`,g.fillRect(n.x,n.y,n.w,n.h),g.strokeStyle=i,g.lineWidth=2.5,g.setLineDash([])):(g.strokeStyle=i+`99`,g.lineWidth=1,g.setLineDash([5,4])),g.strokeRect(n.x,n.y,n.w,n.h),g.setLineDash([]),t){let e=me.TOL;g.fillStyle=`#fff`,g.strokeStyle=i,g.lineWidth=1.5;for(let[t,r]of[[n.x,n.y],[n.x+n.w,n.y],[n.x,n.y+n.h],[n.x+n.w,n.y+n.h]])g.fillRect(t-e,r-e,e*2,e*2),g.strokeRect(t-e,r-e,e*2,e*2)}else{g.strokeStyle=i+`cc`,g.lineWidth=1.5;for(let[e,t,r,i,a,o]of[[n.x,n.y,1,0,0,1],[n.x+n.w,n.y,-1,0,0,1],[n.x,n.y+n.h,1,0,0,-1],[n.x+n.w,n.y+n.h,-1,0,0,-1]])g.beginPath(),g.moveTo(e+r*10,t),g.lineTo(e,t),g.lineTo(e,t+o*10),g.stroke()}g.restore()}function Je(){if(!(D||typeof SelfieSegmentation>`u`))try{D=new SelfieSegmentation({locateFile:e=>`https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation/${e}`}),D.setOptions({modelSelection:1}),D.onResults(e=>{let t=e.segmentationMask;if(!t){O=!1;return}let n=document.createElement(`canvas`);n.width=y.width,n.height=y.height;let r=n.getContext(`2d`);r.drawImage(t,0,0,n.width,n.height);let i=r.getImageData(0,0,n.width,n.height);for(let e=0;e<i.data.length;e+=4){let t=i.data[e];i.data[e]=255,i.data[e+1]=255,i.data[e+2]=255,i.data[e+3]=t}r.putImageData(i,0,0),E=n,O=!1,R.show(),J=!0})}catch(e){console.warn(`主体抠图初始化失败:`,e),O=!1}}function K(){!D||O||!N.media||(O=!0,D.send({image:N.media}))}function Ye(e,t,n){if(!E)return;let r=E.getContext(`2d`),i=N.maskBrushSize,a=Math.round(e),o=Math.round(t),s=Math.max(0,a-i),c=Math.max(0,o-i),l=Math.min(E.width,a+i),u=Math.min(E.height,o+i),d=l-s,f=u-c;if(d<=0||f<=0)return;let p=r.getImageData(s,c,d,f),m=p.data,ee=i*i;for(let e=0;e<f;e++)for(let t=0;t<d;t++){let r=s+t-a,i=c+e-o;if(r*r+i*i<=ee){let r=(e*d+t)*4+3;m[r]=n?255:0}}r.putImageData(p,s,c)}function Xe(e,t){if(!E)return;let n=E.width,r=E.height,i=document.createElement(`canvas`);i.width=n,i.height=r;let a=i.getContext(`2d`);a.filter=`blur(${e}px)`,a.drawImage(E,0,0),a.filter=`none`;let o=a.getImageData(0,0,n,r);for(let e=0;e<o.data.length;e+=4){let n=o.data[e+3];o.data[e]=255,o.data[e+1]=255,o.data[e+2]=255,o.data[e+3]=t===`expand`?n>80?255:0:n>200?255:0}a.putImageData(o,0,0),E.getContext(`2d`).drawImage(i,0,0),J=!0}function q(e,t){t||=Re(),e.clearRect(0,0,h.width,h.height),N.style!==`original`&&Ge(N.style,t),N.style===`original`?Ke(e):e.drawImage(le[N.style].canvas,0,0);for(let n=0;n<N.viewports.length;n++){let r=N.viewports[n],i=r.style||`original`;if(i!==N.style){let n=_e(r);e.save(),e.beginPath(),e.rect(n.x,n.y,n.w,n.h),e.clip(),r.subjectMatting&&E?(e.fillStyle=N.bgColor,e.fillRect(0,0,h.width,h.height),C.clearRect(0,0,h.width,h.height),i===`original`?Ke(C):We(i,t,C,r.styleParams||{}),C.save(),C.globalCompositeOperation=`destination-in`,C.drawImage(E,0,0),C.restore(),e.drawImage(S,0,0)):i===`original`?Ke(e):We(i,t,e,r.styleParams||{}),e.restore()}}}var J=!0,Y=0,X=performance.now();function Z(e){let t=!!N.media;if(t&&!N.isVideo&&!J&&!I.active){requestAnimationFrame(Z);return}if(!t){Y++,e-X>=1e3&&(ie.textContent=`FPS: ${Y}`,Y=0,X=e),J=!1,requestAnimationFrame(Z);return}Le();let n=Re();if(g.clearRect(0,0,h.width,h.height),N.subjectMatting?(g.fillStyle=N.bgColor,g.fillRect(0,0,h.width,h.height),N.isVideo?(oe++,(oe%10==0||!E)&&K()):E||K(),E?(q(x,n),x.save(),x.globalCompositeOperation=`destination-in`,x.drawImage(E,0,0),x.restore(),g.drawImage(b,0,0)):q(g,n)):q(g,n),E&&(k||M||ce)){let e=k?se:M;T.clearRect(0,0,h.width,h.height),T.fillStyle=`rgba(255, 80, 80, 0.30)`,T.fillRect(0,0,h.width,h.height),T.globalCompositeOperation=`destination-out`,T.drawImage(E,0,0),T.globalCompositeOperation=`source-over`,g.drawImage(w,0,0),g.save(),g.beginPath(),g.arc(N.mouseX,N.mouseY,N.maskBrushSize,0,Math.PI*2),g.strokeStyle=e?`rgba(100, 255, 100, 0.7)`:`rgba(255, 100, 100, 0.7)`,g.lineWidth=2,g.stroke(),g.fillStyle=e?`rgba(100, 255, 100, 0.12)`:`rgba(255, 100, 100, 0.12)`,g.fill(),g.restore()}for(let e=0;e<N.viewports.length;e++)N.showBorders&&qe(N.viewports[e],e===N.activeViewport);Y++,e-X>=1e3&&(ie.textContent=`FPS: ${Y}`,Y=0,X=e),J=!1,requestAnimationFrame(Z)}requestAnimationFrame(Z),re.addEventListener(`click`,()=>{let e=document.createElement(`a`);e.download=`duality-export.png`,e.href=h.toDataURL(`image/png`),e.click()});var Q=null,$=[];function Ze(){let e=N.media;if(!(!e||!N.isVideo||N.isRecording)){try{let e=h.captureStream(30);Q=new MediaRecorder(e,{mimeType:`video/webm;codecs=vp9`})}catch{let e=h.captureStream(30);Q=new MediaRecorder(e)}$=[],Q.ondataavailable=e=>{e.data.size>0&&$.push(e.data)},Q.onstop=()=>{if($.length){let e=new Blob($,{type:`video/webm`}),t=URL.createObjectURL(e),n=document.createElement(`a`);n.href=t,n.download=`duality-export.webm`,n.click(),URL.revokeObjectURL(t)}$=[],N.media&&(N.media.loop=!0)},Q.start(),N.isRecording=!0,e.loop=!1,e.currentTime=0,e.play()}}function Qe(){Q&&Q.state!==`inactive`&&Q.stop(),N.isRecording=!1,N.media&&(N.media.loop=!0)}