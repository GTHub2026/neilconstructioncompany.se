const menuToggle = document.querySelector('.menu-toggle');
const mainNav = document.querySelector('.main-nav');

if (menuToggle && mainNav) {
  menuToggle.addEventListener('click', () => {
    const isOpen = mainNav.classList.toggle('is-open');
    menuToggle.classList.toggle('active', isOpen);
    menuToggle.setAttribute('aria-expanded', String(isOpen));
  });

  mainNav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      mainNav.classList.remove('is-open');
      menuToggle.classList.remove('active');
      menuToggle.setAttribute('aria-expanded', 'false');
    });
  });
}

const contactForm = document.getElementById('contactForm');

if (contactForm) {
  contactForm.addEventListener('submit', function (event) {
    event.preventDefault();

    const submitButton = contactForm.querySelector('button[type="submit"]');
    const originalText = submitButton.textContent;

    submitButton.textContent = 'Message Sent!';
    submitButton.disabled = true;
    submitButton.style.opacity = '0.8';

    setTimeout(() => {
      contactForm.reset();
      submitButton.textContent = originalText;
      submitButton.disabled = false;
      submitButton.style.opacity = '1';
    }, 2200);
  });
}

const jokeButton = document.getElementById('jokeButton');
const jokeType = document.getElementById('jokeType');
const jokeText = document.getElementById('jokeText');

async function loadJoke() {
  if (!jokeButton || !jokeType || !jokeText) return;

  jokeButton.disabled = true;
  jokeButton.textContent = 'Loading…';
  jokeType.textContent = 'Loading joke…';
  jokeText.textContent = 'Fetching something funny...';

  try {
    const response = await fetch('https://v2.jokeapi.dev/joke/Any?type=single&safe-mode');
    if (!response.ok) throw new Error('Unable to fetch a joke right now.');

    const data = await response.json();

    if (data.error) throw new Error(data.message || 'Unable to fetch a joke right now.');

    jokeType.textContent = data.category ? `${data.category} • ${data.type}` : 'Random Joke';
    jokeText.textContent = data.joke || `${data.setup}\n\n${data.delivery}`;
  } catch (error) {
    jokeType.textContent = 'Error';
    jokeText.textContent = 'We could not load a joke right now. Please try again.';
  } finally {
    jokeButton.disabled = false;
    jokeButton.textContent = 'New Joke';
  }
}

if (jokeButton) {
  jokeButton.addEventListener('click', loadJoke);
  loadJoke();
}
