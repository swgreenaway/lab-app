// Relative URLs, so the page works whatever host/port IIS is bound to
async function api(path, options) {
  const res = await fetch(`api/${path}`, options);
  if (!res.ok) throw new Error(`${options?.method ?? 'GET'} api/${path} -> ${res.status} ${res.statusText}`);
  return res;
}

const $ = (id) => document.getElementById(id);

function showError(err) {
  $('error').textContent = err.message;
  $('error').hidden = false;
}

function clearError() {
  $('error').hidden = true;
}

function renderNotes(notes) {
  $('notes').replaceChildren(...notes.map((text) => {
    const li = document.createElement('li');
    li.textContent = text;
    return li;
  }));
}

$('hello-btn').addEventListener('click', async () => {
  clearError();
  try {
    $('hello-out').textContent = await (await api('hello')).text();
  } catch (err) { showError(err); }
});

$('note-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  clearError();
  try {
    const res = await api('notes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: $('note-text').value }),
    });
    $('note-text').value = '';
    renderNotes(await res.json());
  } catch (err) { showError(err); }
});

api('notes').then((res) => res.json()).then(renderNotes).catch(showError);
