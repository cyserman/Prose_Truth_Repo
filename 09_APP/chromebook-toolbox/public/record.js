// Audio recording functionality
let mediaRecorder;
let chunks = [];

window.startRecording = async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorder = new MediaRecorder(stream);
    chunks = [];
    
    mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
    
    mediaRecorder.onstop = async () => {
      const blob = new Blob(chunks, { type: 'audio/webm' });
      const formData = new FormData();
      formData.append('audio', blob);
      
      const res = await fetch('/save-audio', {
        method: 'POST',
        body: formData
      });
      
      const data = await res.json();
      alert(`Audio saved: ${data.file}`);
    };
    
    mediaRecorder.start();
    alert('Recording started...');
  } catch (error) {
    alert(`Error: ${error.message}`);
  }
};

window.stopRecording = () => {
  if (mediaRecorder && mediaRecorder.state === 'recording') {
    mediaRecorder.stop();
    alert('Recording stopped');
  } else {
    alert('No active recording');
  }
};
