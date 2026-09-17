const jokeButton = document.getElementById('jokeButton');
const categorySelect = document.getElementById('category');
const jokeType = document.getElementById('jokeType');
const jokeText = document.getElementById('jokeText');
const statusMessage = document.getElementById('status');

const API_BASE = 'https://v2.jokeapi.dev/joke';

function setLoadingState(isLoading) {
  jokeButton.disabled = isLoading;
  jokeButton.textContent = isLoading ? 'Loading…' : 'Tell me a joke';
}

function displayJoke(joke) {
  jokeType.textContent = `${joke.category} • ${joke.type === 'twopart' ? 'Two-part joke' : 'Single joke'}`;
  jokeText.textContent = joke.type === 'twopart'
    ? `${joke.setup}\n\n${joke.delivery}`
    : joke.joke;
}

async function fetchJoke() {
  setLoadingState(true);
  statusMessage.className = 'status';
  statusMessage.textContent = 'Finding something funny…';

  const category = encodeURIComponent(categorySelect.value);
  const url = `${API_BASE}/${category}?safe-mode&type=single,twopart`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`The joke service returned ${response.status}.`);
    }

    const data = await response.json();
    if (data.error) {
      throw new Error(data.message || 'The joke service returned an error.');
    }

    displayJoke(data);
    statusMessage.textContent = 'Here is your random joke.';
  } catch (error) {
    jokeType.textContent = 'Something went wrong';
    jokeText.textContent = 'We could not load a joke right now. Please try again.';
    statusMessage.className = 'status error';
    statusMessage.textContent = error.message;
  } finally {
    setLoadingState(false);
  }
}

jokeButton.addEventListener('click', fetchJoke);
categorySelect.addEventListener('change', fetchJoke);
fetchJoke();
