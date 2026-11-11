const grid = document.querySelector('.site-articles-masonry');

if (grid) {
  let scheduled = false;
  const layout = () => {
    scheduled = false;
    const cards = Array.from(grid.children).filter(card => card.classList.contains('card'));
    const gap = parseFloat(getComputedStyle(grid).rowGap) || 0;
    // Measure natural card heights before assigning grid spans.
    const spans = cards.map(card => Math.ceil((card.getBoundingClientRect().height + gap) / (8 + gap)));
    cards.forEach((card, index) => {
      const span = `span ${Math.max(1, spans[index])}`;
      if (card.style.gridRowEnd !== span) card.style.gridRowEnd = span;
    });
    grid.classList.add('site-articles-masonry--ready');
  };
  const scheduleLayout = () => {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(layout);
  };

  if ('ResizeObserver' in window) {
    const observer = new ResizeObserver(scheduleLayout);
    observer.observe(grid);
    Array.from(grid.children).forEach(card => observer.observe(card));
  }
  new MutationObserver(scheduleLayout).observe(grid, { childList: true });
  grid.addEventListener('load', scheduleLayout, true);
  window.addEventListener('resize', scheduleLayout);
  document.fonts?.ready.then(scheduleLayout);
  layout();
}
