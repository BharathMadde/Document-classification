// API utility for backend integration
const BASE_URL = 'http://localhost:3000/api/documents';

export async function uploadDocument(file) {
  const formData = new FormData();
  formData.append('document', file);
  try {
    const res = await fetch(`${BASE_URL}/upload`, {
      method: 'POST',
      body: formData,
    });
    if (!res.ok) {
      const errText = await res.text();
      console.error('Upload failed:', errText);
      throw new Error('Upload failed: ' + errText);
    }
    return res.json();
  } catch (err) {
    console.error('Upload error:', err);
    throw new Error('Upload failed. Please try again.');
  }
}

export async function extractDocument(id) {
  try {
    const res = await fetch(`${BASE_URL}/extract`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    if (!res.ok) {
      const errText = await res.text();
      console.error('Extraction failed:', errText);
      throw new Error('Extraction failed: ' + errText);
    }
    return res.json();
  } catch (err) {
    console.error('Extraction error:', err);
    throw new Error('Extraction failed. Please try again.');
  }
}

export async function classifyDocument(id, extractedText) {
  try {
    const res = await fetch(`${BASE_URL}/classify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, extractedText }),
    });
    if (!res.ok) {
      const errText = await res.text();
      console.error('Classification failed:', errText);
      throw new Error('Classification failed: ' + errText);
    }
    return res.json();
  } catch (err) {
    console.error('Classification error:', err);
    throw new Error('Classification failed. Please try again.');
  }
}

export async function routeDocument(id, type) {
  try {
    const res = await fetch(`${BASE_URL}/route`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, type }),
    });
    if (!res.ok) {
      const errText = await res.text();
      console.error('Routing failed:', errText);
      throw new Error('Routing failed: ' + errText);
    }
    return res.json();
  } catch (err) {
    console.error('Routing error:', err);
    throw new Error('Routing failed. Please try again.');
  }
}

export async function listDocuments() {
  try {
    const res = await fetch(`${BASE_URL}`);
    if (!res.ok) {
      const errText = await res.text();
      console.error('List documents failed:', errText);
      throw new Error('Failed to fetch documents: ' + errText);
    }
    return res.json();
  } catch (err) {
    console.error('List documents error:', err);
    throw new Error('Failed to fetch documents. Please try again.');
  }
}

export async function getDocument(id) {
  try {
    const res = await fetch(`${BASE_URL}/${id}`);
    if (!res.ok) {
      const errText = await res.text();
      console.error('Get document failed:', errText);
      throw new Error('Failed to fetch document: ' + errText);
    }
    return res.json();
  } catch (err) {
    console.error('Get document error:', err);
    throw new Error('Failed to fetch document. Please try again.');
  }
} 