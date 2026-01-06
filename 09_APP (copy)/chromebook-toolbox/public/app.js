// File upload drag-and-drop
const dz = document.getElementById('dropzone');

dz.ondragover = (e) => e.preventDefault();

dz.ondrop = async (e) => {
  e.preventDefault();
  const file = e.dataTransfer.files[0];
  const formData = new FormData();
  formData.append('file', file);
  
  const res = await fetch('/upload', {
    method: 'POST',
    body: formData
  });
  
  const data = await res.json();
  alert(`Uploaded: ${file.name}`);
};

// Notepad save function
window.saveNote = async () => {
  const text = document.getElementById('notepadText').value;
  
  const res = await fetch('/save-note', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ note: text })
  });
  
  const data = await res.json();
  alert(`Saved to: ${data.path}`);
  
  // Clear notepad after save
  document.getElementById('notepadText').value = '';
};
