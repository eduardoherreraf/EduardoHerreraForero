// Keep a section active even when reversing direction inside a long section.
export function findActiveSectionIndex(sectionTops, position) {
  let activeIndex = 0;
  for (let index = 1; index < sectionTops.length; index += 1) {
    if (sectionTops[index] > position) break;
    activeIndex = index;
  }
  return activeIndex;
}

const menu = document.getElementById('article-scrollspy');
const sections = menu ? Array.from(menu.querySelectorAll('a[href^="#"]'))
  .map(link => ({ link, section: document.getElementById(decodeURIComponent(link.hash.slice(1))) }))
  .filter(({ section }) => section) : [];

if (sections.length) {
  let scheduled = false;
  const update = () => {
    scheduled = false;
    const navbar = document.querySelector('.navbar.fixed-top');
    const position = Math.max(0, navbar?.getBoundingClientRect().bottom ?? 0) + 1;
    const tops = sections.map(({ section }) => section.getBoundingClientRect().top);
    // The final section may be too short to reach the navbar at maximum scroll.
    const root = document.documentElement;
    const atBottom = window.scrollY > 0 &&
      window.scrollY + window.innerHeight >= root.scrollHeight - 1;
    const activeIndex = atBottom ? sections.length - 1 : findActiveSectionIndex(tops, position);

    sections.forEach(({ link }, index) => {
      const active = index === activeIndex;
      link.classList.toggle('active', active);
      if (active) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
  };
  const scheduleUpdate = () => {
    if (scheduled) return;
    scheduled = true;
    window.requestAnimationFrame(update);
  };

  window.addEventListener('scroll', scheduleUpdate, { passive: true });
  window.addEventListener('resize', scheduleUpdate);
  // Images and syntax highlighting can change section positions after startup.
  window.addEventListener('load', scheduleUpdate);
  document.addEventListener('load', scheduleUpdate, true);
  update();
}
