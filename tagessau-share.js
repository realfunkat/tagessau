(() => {
  const canonical = document.querySelector('link[rel="canonical"]')?.href || location.href;
  const url = document.querySelector('meta[property="og:url"]')?.content || canonical;
  const title = document.querySelector('meta[property="og:title"]')?.content || document.title;

  const icons = {
    native: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 15V3m0 0L7.5 7.5M12 3l4.5 4.5M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7" fill="none" stroke-width="2"/></svg>',
    whatsapp: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 11.7a8 8 0 0 1-11.8 7L4 20l1.3-4.1A8 8 0 1 1 20 11.7Z" fill="none" stroke-width="1.9"/><path d="M8.2 7.8c.4 3.7 2.3 5.7 6 6.2l1.1-1.2 2 .9c-.2 1.2-1 2-2.2 2.2-4.8-.7-7.5-3.3-8.1-8.1.2-1.2 1-2 2.2-2.2l.9 2-1.9.2Z" stroke="none"/></svg>',
    x: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 4l14 16M19 4L5 20" fill="none" stroke-width="2.2"/></svg>',
    facebook: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14.2 21v-8h2.7l.4-3h-3.1V8.1c0-.9.3-1.5 1.6-1.5h1.7V3.9c-.3 0-1.3-.1-2.5-.1-2.5 0-4.2 1.5-4.2 4.3V10H8v3h2.8v8h3.4Z" stroke="none"/></svg>',
    email: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 6.5h18v12H3zM3.5 7l8.5 7 8.5-7" fill="none" stroke-width="1.9"/></svg>',
    copy: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9.5 14.5l5-5M7.8 16.2l-1.1 1.1a3.25 3.25 0 0 1-4.6-4.6l3-3a3.25 3.25 0 0 1 4.6 0M16.2 7.8l1.1-1.1a3.25 3.25 0 0 1 4.6 4.6l-3 3a3.25 3.25 0 0 1-4.6 0" fill="none" stroke-width="1.9"/></svg>'
  };

  const enhance = (element, channel, label) => {
    element.dataset.shareChannel = channel;
    element.setAttribute('aria-label', label);
    element.setAttribute('title', label);
    element.innerHTML = icons[channel] + '<span class="share-visually-hidden">' + label + '</span>';
  };

  document.querySelectorAll('.ts-share').forEach(bar => {
    const heading = bar.querySelector('strong');
    if (heading) heading.textContent = 'Teilen auf:';

    const status = bar.querySelector('[data-share-status]');
    const native = bar.querySelector('[data-native-share]');
    if (native && navigator.share) {
      native.hidden = false;
      enhance(native, 'native', 'Über Gerät teilen');
      native.addEventListener('click', async () => {
        try { await navigator.share({title, url}); }
        catch (error) {
          if (error.name !== 'AbortError' && status) status.textContent = 'Bitte einen der Teilen-Links verwenden.';
        }
      });
    }

    bar.querySelectorAll('a').forEach(link => {
      if (link.hasAttribute('data-share-ignore')) return;
      const href = link.getAttribute('href') || '';
      if (href.includes('whatsapp.com')) enhance(link, 'whatsapp', 'Auf WhatsApp teilen');
      else if (href.includes('twitter.com') || href.includes('x.com')) enhance(link, 'x', 'Auf X teilen');
      else if (href.includes('facebook.com')) enhance(link, 'facebook', 'Auf Facebook teilen');
      else if (href.startsWith('mailto:')) enhance(link, 'email', 'Per E-Mail teilen');
    });

    const copy = bar.querySelector('[data-copy-share]');
    if (copy) {
      enhance(copy, 'copy', 'Link kopieren');
      copy.addEventListener('click', async () => {
        try {
          await navigator.clipboard.writeText(url);
          if (status) status.textContent = 'Link kopiert!';
        } catch {
          if (status) status.textContent = 'Link zum Kopieren: ' + url;
        }
      });
    }
  });
})();
