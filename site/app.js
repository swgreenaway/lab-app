// Relative URLs, so the page works whatever host/port IIS is bound to
const api = (path, options) =>
  fetch(`api/${path}`, options).then(async (res) => {
    if (!res.ok) throw new Error(`${options?.method ?? 'GET'} api/${path} -> ${res.status} ${res.statusText}`);
    return res.status === 204 ? null : res.json();
  });

const $ = (id) => document.getElementById(id);

function showError(err) {
  $('error').textContent = err.message;
  $('error').hidden = false;
}

function clearError() {
  $('error').hidden = true;
}

$('hello-btn').addEventListener('click', async () => {
  clearError();
  try {
    const data = await api('hello');
    $('hello-out').textContent = `${data.message} (${new Date(data.time).toLocaleTimeString()})`;
  } catch (err) { showError(err); }
});

$('info-btn').addEventListener('click', async () => {
  clearError();
  try {
    $('info-out').textContent = JSON.stringify(await api('info'), null, 2);
  } catch (err) { showError(err); }
});

async function loadNotes() {
  const notes = await api('notes');
  const list = $('notes');
  list.replaceChildren(...notes.map((note) => {
    const li = document.createElement('li');
    li.textContent = `${note.text} `;
    const del = document.createElement('button');
    del.className = 'link';
    del.textContent = 'delete';
    del.addEventListener('click', async () => {
      clearError();
      try {
        await api(`notes/${note.id}`, { method: 'DELETE' });
        await loadNotes();
      } catch (err) { showError(err); }
    });
    li.append(del);
    return li;
  }));
}

$('note-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  clearError();
  try {
    await api('notes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: $('note-text').value }),
    });
    $('note-text').value = '';
    await loadNotes();
  } catch (err) { showError(err); }
});

loadNotes().catch(showError);
