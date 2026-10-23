// Relative URLs, so the page works whatever host/port IIS is bound to
async function api(path, options) {
  const res = await fetch(`api/${path}`, options);
  if (!res.ok) throw new Error(`${options?.method ?? 'GET'} api/${path} -> ${res.status} ${res.statusText}`);
  return res;
}

// Helper function
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
    $('hello-out').textContent = await (await api('hello')).text();
  } catch (err) { showError(err); }
});

// api('notes').then((res) => res.json()).then(renderNotes).catch(showError);
