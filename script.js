

const bottomBar = document.querySelector('.bottom-bar');
const nav = document.querySelector('nav');

window.addEventListener('scroll', () => {
  const navBottom = nav.getBoundingClientRect().bottom;
  
if (navBottom < 0) {
  bottomBar.style.transform = 'translateX(-50%) translateY(0)';
} else {
  bottomBar.style.transform = 'translateX(-50%) translateY(100px)';
}
});


// ============================================================================================================================= //

