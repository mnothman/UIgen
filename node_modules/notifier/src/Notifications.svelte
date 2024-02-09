<ul class="toasts">
  {#each toasts as toast (toast.id)}
    <li class="toast" style="background: {toast.background};" out:animateOut>
      <div class="content">{toast.msg}</div>
    </li>
  {/each}
</ul>

<script>
import { notification } from './store.js'
import { onDestroy } from 'svelte'

export let timeout = 1500;
export let themes = {
    danger: '#bb2124',
    success: '#22bb33',
    warning: '#f0ad4e',
    info: '#5bc0de',
    default: '#aaaaaa',
};

let toasts = [];
function createToast(msg, theme, to) {
    const background = themes[theme] || themes['default'];
    const id = Math.random().toString(36).replace(/[^a-z]+/g, '')
    setTimeout(() => { removeToast(id); }, to || timeout);
    toasts = [{
        id,
        msg,
        background,
        timeout: to || timeout,
        width: '100%',
    }, ...toasts];
}
function removeToast(id) {
    toasts = toasts.filter(t => t.id != id);
}
function animateOut(node, { delay = 0, duration = 300 }) {
    const css = t => `opacity: ${(t-.5) * 1}; transform: scaleX(${(t-.5)*1});`;
    return {delay, duration, css};
}

const unsubscribe = notification.subscribe(value => {
    if (!value)
        return;
    createToast(value.message, value.type, value.timeout);
    notification.set();
});
onDestroy(unsubscribe);
</script>

<style>
.toasts {
  position: fixed;
  top: 0;
  left: 0;
  padding: 0;
  margin: 0;
  z-index: 999;
  list-style: none;
}
.toast {
  position: relative;
  margin: 0.5rem;
  min-width: 15vw;
  animation: animate-in 350ms;
  color: #fff;
  transform-origin: top left;
  box-shadow: 0 0 15px #ccc;
}
.content {
  padding: 0.5rem;
  display: block;
  font-weight: 500;
  max-width: min(350px, 70vh);
}

@keyframes animate-in {
  0% {
    opacity: 0.5;
    transform: translateY(-1rem);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
